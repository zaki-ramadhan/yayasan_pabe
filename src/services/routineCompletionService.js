import prisma from "@/lib/prisma";
import { ROUTINE_STATUS } from "@/lib/routineDonationConstants";
import { sendWhatsAppCompletionNotification } from "@/services/whatsapp";

/**
 * Service khusus untuk mengelola siklus akhir (penutupan/completion) komitmen donasi rutin
 * saat program kampanye terkait ditutup atau target donasi telah terpenuhi (Opsi A).
 */

/**
 * Menyelesaikan seluruh komitmen donasi rutin yang terikat pada suatu campaign.
 *
 * @param {string} campaignId - ID program kampanye yang ditutup
 * @param {object} [options]
 * @param {string} [options.reason="PROGRAM_COMPLETED"] - Alasan penutupan
 * @param {boolean} [options.notifyDonors=true] - Kirim WA notifikasi ke donatur
 * @returns {Promise<{ updatedCount: number, notifiedCount: number, errors: Array }>}
 */
export async function completeRoutineDonationsForCampaign(
  campaignId,
  { reason = "PROGRAM_COMPLETED", notifyDonors = true } = {}
) {
  if (!campaignId) {
    return { updatedCount: 0, notifiedCount: 0, errors: [] };
  }

  // 1. Ambil seluruh komitmen donasi rutin aktif yang terikat ke program ini
  const activeRoutines = await prisma.routineDonation.findMany({
    where: {
      campaignId,
      status: ROUTINE_STATUS.ACTIVE,
    },
    include: {
      campaign: {
        select: { title: true, slug: true },
      },
    },
  });

  if (!activeRoutines || activeRoutines.length === 0) {
    return { updatedCount: 0, notifiedCount: 0, errors: [] };
  }

  // 2. Update status komitmen menjadi COMPLETED secara atomic
  const routineIds = activeRoutines.map((r) => r.id);
  await prisma.routineDonation.updateMany({
    where: {
      id: { in: routineIds },
    },
    data: {
      status: ROUTINE_STATUS.COMPLETED,
    },
  });

  // 3. Catat audit trail ke ActivityLog
  try {
    await prisma.activityLog.create({
      data: {
        action: "ROUTINE_AUTO_COMPLETED",
        targetType: "Campaign",
        targetId: campaignId,
        userName: "System",
        description: `Otomatis menyelesaikan ${activeRoutines.length} komitmen donasi rutin karena program ditutup (${reason}).`,
      },
    });
  } catch (logErr) {
    console.error("[RoutineCompletion] Gagal mencatat ActivityLog:", logErr);
  }

  // 4. Kirim notifikasi WhatsApp ke masing-masing donatur jika diaktifkan
  let notifiedCount = 0;
  const errors = [];
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yayasanpabe.org";

  if (notifyDonors) {
    for (const routine of activeRoutines) {
      try {
        await sendWhatsAppCompletionNotification({
          to: routine.donorPhone,
          donorName: routine.donorName,
          programTitle: routine.programTitle || routine.campaign?.title || "Program Kebaikan",
          catalogUrl: `${baseUrl}/program`,
        });
        notifiedCount++;
      } catch (err) {
        errors.push({
          routineId: routine.id,
          donorPhone: routine.donorPhone,
          error: err.message,
        });
      }
    }
  }

  return {
    updatedCount: activeRoutines.length,
    notifiedCount,
    errors,
  };
}

/**
 * Menyelesaikan satu komitmen donasi rutin tertentu (fail-safe saat cron mendeteksi program tidak aktif).
 *
 * @param {string} routineId
 * @param {object} [options]
 * @param {boolean} [options.notifyDonor=false]
 * @returns {Promise<object>}
 */
export async function completeSingleRoutineDonation(
  routineId,
  { notifyDonor = false } = {}
) {
  if (!routineId) return null;

  const routine = await prisma.routineDonation.findUnique({
    where: { id: routineId },
    include: {
      campaign: {
        select: { title: true },
      },
    },
  });

  if (!routine || routine.status === ROUTINE_STATUS.COMPLETED) {
    return routine;
  }

  const updated = await prisma.routineDonation.update({
    where: { id: routineId },
    data: { status: ROUTINE_STATUS.COMPLETED },
  });

  if (notifyDonor && routine.donorPhone) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yayasanpabe.org";
      await sendWhatsAppCompletionNotification({
        to: routine.donorPhone,
        donorName: routine.donorName,
        programTitle: routine.programTitle || routine.campaign?.title || "Program Kebaikan",
        catalogUrl: `${baseUrl}/program`,
      });
    } catch (err) {
      console.error(`[RoutineCompletion] Gagal kirim WA ke ${routine.donorPhone}:`, err);
    }
  }

  return updated;
}
