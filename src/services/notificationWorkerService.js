import prisma from "@/lib/prisma";
import {
  QUEUE_STATUS,
  QUEUE_CONFIG,
  NOTIFICATION_TYPE,
} from "@/lib/notificationConstants";
import {
  sendWhatsAppNotification,
  sendWhatsAppCompletionNotification,
} from "@/services/whatsapp";
import {
  sendRoutineDonationEmail,
  sendRoutineCompletionEmail,
  sendPasswordResetEmail,
  sendAccountActivationEmail,
  sendDonationReceiptEmail,
} from "@/services/emailService";
import { formatRoutineSchedule } from "@/data/routineDonation";

/**
 * Service Consumer / Worker: Bertanggung jawab mengambil tugas antrean (NotificationQueue),
 * memproses pengiriman melalui Email (Resend) sebagai kanal utama atau WhatsApp fallback,
 * menangani retry backoff, dan mencatat log pengiriman (NotificationLog).
 */

/**
 * Menghitung waktu penjadwalan ulang berikutnya berdasarkan attempt number (exponential backoff).
 *
 * @param {number} attempt
 * @returns {Date}
 */
export function calculateNextRetryTime(attempt) {
  const delays = QUEUE_CONFIG.RETRY_DELAYS_MINUTES;
  const delayIndex = Math.min(attempt - 1, delays.length - 1);
  const minutesToAdd = delays[delayIndex] || 15;
  return new Date(Date.now() + minutesToAdd * 60 * 1000);
}

/**
 * Memproses sejumlah tugas antrean notifikasi yang jatuh tempo.
 *
 * @param {object} [options]
 * @param {number} [options.batchSize=15] - Jumlah antrean yang diambil per batch
 * @param {Date} [options.now=new Date()] - Waktu patokan eksekusi
 * @returns {Promise<{ processed: number, succeeded: number, retried: number, failed: number, details: Array }>}
 */
export async function processNotificationQueue({
  batchSize = QUEUE_CONFIG.DEFAULT_BATCH_SIZE,
  now = new Date(),
} = {}) {
  // 1. Ambil antrean berstatus PENDING yang sudah masuk jadwal jatuh tempo
  const pendingItems = await prisma.notificationQueue.findMany({
    where: {
      status: QUEUE_STATUS.PENDING,
      scheduledFor: { lte: now },
    },
    include: {
      routineDonation: {
        select: { donorEmail: true },
      },
    },
    take: batchSize,
    orderBy: { scheduledFor: "asc" },
  });

  if (!pendingItems || pendingItems.length === 0) {
    return { processed: 0, succeeded: 0, retried: 0, failed: 0, details: [] };
  }

  const results = [];
  let succeeded = 0;
  let retried = 0;
  let failed = 0;

  for (const item of pendingItems) {
    // 2. Kunci status menjadi PROCESSING secara atomic (mencegah double worker race condition)
    try {
      const locked = await prisma.notificationQueue.updateMany({
        where: {
          id: item.id,
          status: QUEUE_STATUS.PENDING,
        },
        data: {
          status: QUEUE_STATUS.PROCESSING,
        },
      });

      if (locked.count === 0) {
        // Sudah diambil oleh worker lain
        continue;
      }
    } catch (lockErr) {
      console.warn(`[NotificationWorker] Gagal mengunci antrean ID: ${item.id}`, lockErr);
      continue;
    }

    const currentAttempt = item.attempts + 1;
    const payload = typeof item.payload === "string" ? JSON.parse(item.payload) : item.payload || {};

    try {
      // 3. Eksekusi pengiriman multi-kanal: utamakan Email, fallback otomatis ke WhatsApp jika gagal (atau sebaliknya)
      let dispatchResult = null;
      let usedChannel = null;
      const targetEmail = payload.donorEmail || item.routineDonation?.donorEmail || null;
      const targetPhone = item.recipientPhone;

      if (targetEmail) {
        try {
          if (item.type === NOTIFICATION_TYPE.PASSWORD_RESET) {
            dispatchResult = await sendPasswordResetEmail({
              to: targetEmail,
              name: payload.donorName || "Pengguna PABE",
              resetUrl: payload.resetUrl,
            });
          } else if (item.type === NOTIFICATION_TYPE.ACCOUNT_ACTIVATION) {
            dispatchResult = await sendAccountActivationEmail({
              to: targetEmail,
              name: payload.donorName || "Pengguna PABE",
              activationUrl: payload.activationUrl,
            });
          } else if (item.type === NOTIFICATION_TYPE.DONATION_RECEIPT) {
            dispatchResult = await sendDonationReceiptEmail({
              to: targetEmail,
              donorName: payload.donorName || "Sahabat Kebaikan",
              programTitle: payload.programTitle || "Program Kebaikan",
              amount: Number(payload.amount) || 0,
              invoiceId: payload.invoiceId,
              paidAt: payload.paidAt,
              paymentChannelName: payload.paymentChannelName,
              prayer: payload.prayer || "",
              actionUrl: payload.actionUrl,
            });
          } else if (item.type === NOTIFICATION_TYPE.ROUTINE_COMPLETION) {
            dispatchResult = await sendRoutineCompletionEmail({
              to: targetEmail,
              donorName: payload.donorName,
              programTitle: payload.programTitle,
              catalogUrl: payload.catalogUrl,
            });
          } else {
            dispatchResult = await sendRoutineDonationEmail({
              to: targetEmail,
              donorName: payload.donorName,
              programTitle: payload.programTitle,
              amount: Number(payload.amount) || 0,
              frequencyText: formatRoutineSchedule(payload),
              invoiceId: payload.invoiceId || null,
              actionUrl: payload.actionUrl,
              routineType: payload.routineType || "AUTO_DONATION",
            });
          }

          if (dispatchResult && dispatchResult.success !== false) {
            usedChannel = "EMAIL";
          }
        } catch (emailErr) {
          console.warn(`[NotificationWorker] Pengiriman email ke ${targetEmail} gagal, mengalihkan ke WhatsApp:`, emailErr?.message);
        }
      }

      // Fallback ke WhatsApp jika pengiriman email gagal atau target email tidak tersedia
      if (!usedChannel && targetPhone) {
        if (item.type === NOTIFICATION_TYPE.ROUTINE_COMPLETION) {
          dispatchResult = await sendWhatsAppCompletionNotification({
            to: targetPhone,
            donorName: payload.donorName,
            programTitle: payload.programTitle,
            catalogUrl: payload.catalogUrl,
          });
        } else {
          dispatchResult = await sendWhatsAppNotification({
            to: targetPhone,
            donorName: payload.donorName,
            programTitle: payload.programTitle,
            amount: payload.amount,
            routineType: payload.routineType || "AUTO_DONATION",
            actionUrl: payload.actionUrl,
            invoiceId: payload.invoiceId || null,
          });
        }

        if (dispatchResult && dispatchResult.success !== false) {
          usedChannel = "WHATSAPP";
        }
      }

      if (!usedChannel) {
        throw new Error(dispatchResult?.error || "Gagal memproses pengiriman notifikasi pada seluruh kanal (Email & WhatsApp).");
      }

      // 4. Sukses: update antrean menjadi SENT
      await prisma.notificationQueue.update({
        where: { id: item.id },
        data: {
          status: QUEUE_STATUS.SENT,
          attempts: currentAttempt,
          processedAt: new Date(),
          lastError: null,
        },
      });

      // 5. Catat log pengiriman sukses ke NotificationLog
      await prisma.notificationLog.create({
        data: {
          queueId: item.id,
          recipientPhone: item.recipientPhone,
          provider: usedChannel === "EMAIL" ? "resend_email" : (dispatchResult?.provider || "mock"),
          providerMessageId: dispatchResult?.id || dispatchResult?.messageId || null,
          status: "DELIVERED",
          attemptNumber: currentAttempt,
        },
      });

      succeeded++;
      results.push({
        id: item.id,
        recipient: usedChannel === "EMAIL" ? targetEmail : item.recipientPhone,
        channel: usedChannel,
        status: "SENT",
        attempt: currentAttempt,
      });
    } catch (err) {
      const errorMessage = err?.message || "Gagal memproses pengiriman notifikasi.";
      console.error(`[NotificationWorker] Gagal kirim pesan ke ${item.recipientPhone} (Percobaan #${currentAttempt}):`, errorMessage);

      // 6. Evaluasi apakah masih bisa di-retry atau sudah FAILED permanen
      const canRetry = currentAttempt < item.maxAttempts;
      const nextScheduled = canRetry ? calculateNextRetryTime(currentAttempt) : null;
      const finalStatus = canRetry ? QUEUE_STATUS.PENDING : QUEUE_STATUS.FAILED;

      await prisma.notificationQueue.update({
        where: { id: item.id },
        data: {
          status: finalStatus,
          attempts: currentAttempt,
          scheduledFor: canRetry ? nextScheduled : item.scheduledFor,
          lastError: errorMessage,
        },
      });

      // Catat log kegagalan ke NotificationLog
      await prisma.notificationLog.create({
        data: {
          queueId: item.id,
          recipientPhone: item.recipientPhone,
          provider: (process.env.WA_DRIVER || "mock").toLowerCase(),
          status: "FAILED",
          errorMessage,
          attemptNumber: currentAttempt,
        },
      });

      if (canRetry) {
        retried++;
        results.push({
          id: item.id,
          phone: item.recipientPhone,
          status: "RETRY_SCHEDULED",
          attempt: currentAttempt,
          nextScheduled,
          error: errorMessage,
        });
      } else {
        failed++;
        results.push({
          id: item.id,
          phone: item.recipientPhone,
          status: "FAILED_PERMANENT",
          attempt: currentAttempt,
          error: errorMessage,
        });
      }
    }
  }

  return {
    processed: pendingItems.length,
    succeeded,
    retried,
    failed,
    details: results,
  };
}
