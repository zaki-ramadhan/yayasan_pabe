import prisma from "@/lib/prisma";
import { isRoutineScheduledForNow, getRoutineExecutionKey } from "@/lib/routineSchedulerHelper";
import { isCampaignClosed } from "@/lib/formatters";
import { createDonation } from "@/services/donationService";
import {
  completeSingleRoutineDonation,
  rolloverOrCompleteSingleRoutineDonation,
} from "@/services/routineCompletionService";
import { sendRoutinePausedDueToUnpaidEmail } from "@/services/emailService";
import { enqueueNotification } from "@/services/notificationQueueService";
import { processNotificationQueue } from "@/services/notificationWorkerService";
import { NOTIFICATION_TYPE } from "@/lib/notificationConstants";
import { getCampaignDetailHref } from "@/lib/zisFilter";

/**
 * Executes routine donation schedules: creates invoices and enqueues notification tasks to PostgreSQL queue,
 * then dispatches worker to process pending notifications.
 * @param {object} options
 * @param {Date} [options.currentTime=new Date()]
 * @param {string|null} [options.forceRoutineId=null] - Optional ID to bypass schedule matching (useful for testing)
 * @returns {Promise<object>} Processing summary metrics
 */
export async function processScheduledRoutineDonations({
  currentTime = new Date(),
  forceRoutineId = null,
} = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // 1. Ambil data komitmen donasi rutin yang berstatus aktif
  const queryWhere = { status: "ACTIVE" };
  if (forceRoutineId) {
    queryWhere.id = forceRoutineId;
  }

  const routines = await prisma.routineDonation.findMany({
    where: queryWhere,
    include: {
      campaign: true,
    },
  });

  if (!routines || routines.length === 0) {
    // Tetap proses antrean yang mungkin masih tersisa dari retry sebelumnya
    const workerSummary = await processNotificationQueue({ now: currentTime });
    return {
      success: true,
      processed: 0,
      succeeded: 0,
      failed: 0,
      skipped: 0,
      worker: workerSummary,
      message: "Tidak ada jadwal donasi rutin baru. Worker memeriksa antrean berjalan.",
      details: [],
    };
  }

  // 2. Filter yang sesuai jadwal saat ini (jika bukan force run)
  const dueRoutines = forceRoutineId
    ? routines
    : routines.filter((r) => isRoutineScheduledForNow(r, currentTime));

  const results = [];
  let succeeded = 0;
  let failed = 0;
  let skipped = 0;

  for (const routine of dueRoutines) {
    const execKey = getRoutineExecutionKey(routine.id, currentTime);

    try {
      // 3a. Cek masa berlaku: Jika melewati batas tanggal berakhir, selesaikan jadwal otomatis
      if (routine.hasCustomPeriod && routine.endDate) {
        const end = new Date(routine.endDate);
        end.setHours(23, 59, 59, 999);
        if (currentTime > end) {
          await completeSingleRoutineDonation(routine.id, {
            notifyDonor: true,
            reason: "Masa berlaku donasi rutin telah selesai",
          });
          skipped++;
          results.push({
            routineId: routine.id,
            donorPhone: routine.donorPhone,
            status: "AUTO_COMPLETED",
            reason: `Masa berlaku donasi rutin telah berakhir. Komitmen donasi otomatis diselesaikan.`,
          });
          continue;
        }
      }

      // 3b. Fail-safe Fiqih & Smart Rollover: Jika program terikat sudah tidak aktif atau ditutup,
      // alihkan ke program aktif yang paling membutuhkan dana. Jika tidak ada, selesaikan jadwal (Completed).
      if (routine.campaign && (routine.campaign.status !== "ACTIVE" || isCampaignClosed(routine.campaign))) {
        const rolloverRes = await rolloverOrCompleteSingleRoutineDonation(routine.id, {
          notifyDonor: true,
        });

        if (rolloverRes?.action === "ROLLED_OVER" && rolloverRes.targetCampaign) {
          routine.campaign = rolloverRes.targetCampaign;
          routine.campaignId = rolloverRes.targetCampaign.id;
          routine.programTitle = rolloverRes.targetCampaign.title;
        } else {
          skipped++;
          results.push({
            routineId: routine.id,
            donorPhone: routine.donorPhone,
            status: "AUTO_COMPLETED",
            reason: `Program "${routine.campaign.title || routine.programTitle}" berstatus tidak aktif/telah ditutup dan tidak ada program pengganti. Komitmen donasi otomatis diselesaikan.`,
          });
          continue;
        }
      }

      // 4. Verifikasi Idempotensi: Cek apakah jadwal ini sudah pernah dieksekusi hari ini
      if (!forceRoutineId) {
        const alreadyExecuted = await prisma.activityLog.findFirst({
          where: {
            action: "ROUTINE_EXECUTION",
            targetType: "RoutineDonation",
            targetId: routine.id,
            description: { contains: execKey },
          },
        });

        if (alreadyExecuted) {
          skipped++;
          results.push({
            routineId: routine.id,
            donorPhone: routine.donorPhone,
            status: "SKIPPED",
            reason: `Sudah diproses sebelumnya hari ini (${execKey})`,
          });
          continue;
        }
      }

      let invoiceId = null;
      let actionUrl = `${baseUrl}/donasi-rutin`;

      // 4b. Consecutive Unpaid Guard: Cegah spam invoice jika 3 tagihan sebelumnya kedaluwarsa berturut-turut
      if (routine.routineType === "AUTO_DONATION" && !forceRoutineId && typeof prisma?.donation?.findMany === "function") {
        const recentInvoices = await prisma.donation.findMany({
          where: {
            idempotencyKey: { startsWith: `ROUTINE_EXEC_${routine.id}_` },
          },
          orderBy: { createdAt: "desc" },
          take: 3,
          select: { id: true, status: true, invoiceId: true },
        });

        const isConsecutiveUnpaid =
          recentInvoices.length >= 3 &&
          recentInvoices.every((d) => d.status === "EXPIRED" || d.status === "CANCELLED");

        if (isConsecutiveUnpaid) {
          await prisma.routineDonation.update({
            where: { id: routine.id },
            data: { status: "PAUSED" },
          });

          await prisma.activityLog.create({
            data: {
              action: "ROUTINE_AUTO_PAUSED",
              targetType: "RoutineDonation",
              targetId: routine.id,
              userName: "System",
              description: `Jadwal donasi rutin otomatis dijeda karena 3 invoice berturut-turut (${recentInvoices.map((d) => d.invoiceId).join(", ")}) kedaluwarsa tanpa pelunasan.`,
            },
          });

          const resumeUrl = `${baseUrl}/donatur/dashboard#donor-routine-card`;
          if (routine.donorEmail) {
            try {
              await sendRoutinePausedDueToUnpaidEmail({
                to: routine.donorEmail,
                donorName: routine.donorName,
                programTitle: routine.programTitle,
                resumeUrl,
              });
            } catch (pauseErr) {
              console.warn("[RoutineScheduler] Gagal kirim email pause:", pauseErr?.message);
            }
          }

          skipped++;
          results.push({
            routineId: routine.id,
            donorPhone: routine.donorPhone,
            status: "AUTO_PAUSED",
            reason: "Jadwal dijeda otomatis karena 3 tagihan sebelumnya kedaluwarsa tanpa pelunasan.",
          });
          continue;
        }
      }

      // 5. Jika mode Donasi Otomatis (Auto-Invoice), terbitkan invoice donasi baru dengan saluran pilihan donatur
      if (routine.routineType === "AUTO_DONATION") {
        const donationIdempotencyKey = forceRoutineId
          ? `${execKey}_TEST_${Date.now()}`
          : execKey;

        const channelId = routine.paymentChannel || "qris";

        const donation = await createDonation({
          campaignId: routine.campaignId || null,
          campaignTitle: routine.programTitle || "Donasi Rutin PABE",
          campaignSlug: routine.campaign?.slug || "",
          donationType: "CAMPAIGN",
          amount: Number(routine.amount),
          paymentChannelId: channelId,
          donorName: routine.donorName,
          donorEmail: routine.donorEmail || "",
          donorPhone: routine.donorPhone,
          isAnonymous: Boolean(routine.isAnonymous),
          prayer: "Donasi rutin otomatis",
          idempotencyKey: donationIdempotencyKey,
        });

        invoiceId = donation.invoiceId;
        actionUrl = `${baseUrl}/invoice/${donation.invoiceId}?token=${donation.accessToken}`;
      } else if (routine.campaign?.slug) {
        actionUrl = `${baseUrl}${getCampaignDetailHref(routine.campaign)}`;
      }

      // 6. Masukkan tugas pengiriman pesan ke PostgreSQL Queue (Producer)
      const queueKey = forceRoutineId
        ? `ROUTINE_QUEUE_${execKey}_${Date.now()}`
        : `ROUTINE_QUEUE_${execKey}`;

      await enqueueNotification({
        routineDonationId: routine.id,
        type: routine.routineType === "AUTO_DONATION"
          ? NOTIFICATION_TYPE.ROUTINE_INVOICE
          : NOTIFICATION_TYPE.ROUTINE_REMINDER,
        recipientPhone: routine.donorPhone || routine.donorEmail || "-",
        payload: {
          donorName: routine.donorName,
          donorEmail: routine.donorEmail,
          programTitle: routine.programTitle,
          amount: routine.amount,
          frequency: routine.frequency,
          selectedDay: routine.selectedDay,
          monthlyDate: routine.monthlyDate,
          routineType: routine.routineType,
          paymentChannel: routine.paymentChannel || "qris",
          actionUrl,
          invoiceId,
        },
        scheduledFor: currentTime,
        idempotencyKey: queueKey,
      });

      // 7. Catat log eksekusi scheduler ke ActivityLog
      await prisma.activityLog.create({
        data: {
          action: "ROUTINE_EXECUTION",
          targetType: "RoutineDonation",
          targetId: routine.id,
          userName: routine.donorName,
          description: `Jadwal ${routine.routineType} donatur ${routine.donorEmail || routine.donorPhone} berhasil dimasukkan ke antrean [${execKey}].`,
        },
      });

      succeeded++;
      results.push({
        routineId: routine.id,
        donorName: routine.donorName,
        donorEmail: routine.donorEmail,
        donorPhone: routine.donorPhone,
        routineType: routine.routineType,
        invoiceId,
        actionUrl,
        status: "QUEUED",
      });
    } catch (err) {
      failed++;
      console.error(`[Routine Execution Error] ID: ${routine.id}`, err);
      results.push({
        routineId: routine.id,
        donorPhone: routine.donorPhone,
        status: "FAILED",
        error: err.message || "Gagal memproses donasi rutin.",
      });
    }
  }

  // 8. Jalankan Consumer Worker untuk memproses antrean yang jatuh tempo
  const workerSummary = await processNotificationQueue({ now: currentTime });

  return {
    success: true,
    processed: dueRoutines.length,
    succeeded,
    failed,
    skipped,
    worker: workerSummary,
    message: `Scheduler selesai. Diantrekan: ${succeeded}, Dilewati: ${skipped}, Gagal: ${failed}. Worker: ${workerSummary.succeeded} terkirim, ${workerSummary.retried} dijadwalkan ulang.`,
    details: results,
  };
}
