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

/**
 * Service Consumer / Worker: Bertanggung jawab mengambil tugas antrean (NotificationQueue),
 * memproses pengiriman melalui WhatsApp API, menangani retry backoff, dan mencatat log pengiriman (NotificationLog).
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
      // 3. Eksekusi pengiriman pesan sesuai tipe notifikasi
      let dispatchResult;

      if (item.type === NOTIFICATION_TYPE.ROUTINE_COMPLETION) {
        dispatchResult = await sendWhatsAppCompletionNotification({
          to: item.recipientPhone,
          donorName: payload.donorName,
          programTitle: payload.programTitle,
          catalogUrl: payload.catalogUrl,
        });
      } else {
        dispatchResult = await sendWhatsAppNotification({
          to: item.recipientPhone,
          donorName: payload.donorName,
          programTitle: payload.programTitle,
          amount: payload.amount,
          routineType: payload.routineType || "AUTO_DONATION",
          actionUrl: payload.actionUrl,
          invoiceId: payload.invoiceId || null,
        });
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
          provider: dispatchResult?.provider || "mock",
          providerMessageId: dispatchResult?.messageId || dispatchResult?.id || null,
          status: "DELIVERED",
          attemptNumber: currentAttempt,
        },
      });

      succeeded++;
      results.push({
        id: item.id,
        phone: item.recipientPhone,
        status: "SENT",
        attempt: currentAttempt,
      });
    } catch (err) {
      const errorMessage = err?.message || "Gagal memproses pengiriman WhatsApp.";
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
