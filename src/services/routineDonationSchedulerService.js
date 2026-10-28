import prisma from "@/lib/prisma";
import { isRoutineScheduledForNow, getRoutineExecutionKey } from "@/lib/routineSchedulerHelper";
import { createDonation } from "@/services/donationService";
import { completeSingleRoutineDonation } from "@/services/routineCompletionService";
import { enqueueNotification } from "@/services/notificationQueueService";
import { processNotificationQueue } from "@/services/notificationWorkerService";
import { NOTIFICATION_TYPE } from "@/lib/notificationConstants";

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
      // 3. Fail-safe Fiqih: Jika program terikat sudah tidak aktif (COMPLETED / PAUSED), hentikan komitmen
      if (routine.campaign && routine.campaign.status !== "ACTIVE") {
        await completeSingleRoutineDonation(routine.id, { notifyDonor: true });
        skipped++;
        results.push({
          routineId: routine.id,
          donorPhone: routine.donorPhone,
          status: "AUTO_COMPLETED",
          reason: `Program "${routine.campaign.title || routine.programTitle}" berstatus ${routine.campaign.status}. Komitmen donasi otomatis diselesaikan.`,
        });
        continue;
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

      // 5. Jika mode Donasi Otomatis (Auto-Invoice), terbitkan invoice donasi baru dengan QRIS
      if (routine.routineType === "AUTO_DONATION") {
        const donationIdempotencyKey = forceRoutineId
          ? `${execKey}_TEST_${Date.now()}`
          : execKey;

        const donation = await createDonation({
          campaignId: routine.campaignId || null,
          campaignTitle: routine.programTitle || "Donasi Rutin PABE",
          campaignSlug: routine.campaign?.slug || "",
          donationType: "CAMPAIGN",
          amount: Number(routine.amount),
          paymentChannelId: "qris",
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
        actionUrl = `${baseUrl}/campaign/${routine.campaign.slug}`;
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
        recipientPhone: routine.donorPhone,
        payload: {
          donorName: routine.donorName,
          programTitle: routine.programTitle,
          amount: routine.amount,
          routineType: routine.routineType,
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
          description: `Jadwal ${routine.routineType} donatur ${routine.donorPhone} berhasil dimasukkan ke antrean [${execKey}].`,
        },
      });

      succeeded++;
      results.push({
        routineId: routine.id,
        donorName: routine.donorName,
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
