import prisma from "@/lib/prisma";
import { ROUTINE_STATUS } from "@/lib/routineDonationConstants";
import {
  sendWhatsAppCompletionNotification,
  sendWhatsAppRolloverNotification,
} from "@/services/whatsapp";
import {
  sendRoutineCompletionEmail,
  sendRoutineRolloverEmail,
} from "@/services/emailService";
import { selectRolloverCampaign } from "./routineRolloverSelector";

/**
 * Service untuk mengelola siklus akhir (penutupan/completion) dan pengalihan cerdas (smart rollover)
 * komitmen donasi rutin saat program kampanye terkait ditutup atau target donasi telah terpenuhi.
 */

/**
 * Mengalihkan komitmen donasi rutin ke program aktif yang paling membutuhkan dana (Smart Rollover).
 * Jika tidak ada program aktif lain yang tersedia di sistem, komitmen diselesaikan secara aman (Completed).
 *
 * @param {string} campaignId - ID program kampanye yang ditutup
 * @param {object} [options]
 * @param {string} [options.reason="PROGRAM_COMPLETED"] - Alasan pengalihan/penutupan
 * @param {boolean} [options.notifyDonors=true] - Kirim notifikasi ke donatur
 * @param {object} [options.prismaClient=prisma]
 * @returns {Promise<{ action: string, targetCampaign?: object, updatedCount: number, notifiedCount: number, errors: Array }>}
 */
export async function rolloverOrCompleteRoutineDonationsForCampaign(
  campaignId,
  { reason = "PROGRAM_COMPLETED", notifyDonors = true, prismaClient = prisma } = {}
) {
  if (!campaignId) {
    return { action: "NONE", updatedCount: 0, notifiedCount: 0, errors: [] };
  }

  // 1. Ambil seluruh komitmen donasi rutin aktif yang terikat ke program ini
  const activeRoutines = await prismaClient.routineDonation.findMany({
    where: {
      campaignId,
      status: ROUTINE_STATUS.ACTIVE,
    },
    include: {
      campaign: {
        select: { id: true, title: true, slug: true, categoryId: true },
      },
    },
  });

  if (!activeRoutines || activeRoutines.length === 0) {
    return { action: "NONE", updatedCount: 0, notifiedCount: 0, errors: [] };
  }

  const oldCampaign = activeRoutines[0]?.campaign;
  const oldTitle = activeRoutines[0]?.programTitle || oldCampaign?.title || "Program Kebaikan";

  // 2. Evaluasi target program pengganti melalui Selector Engine (Smart Rollover)
  const targetCampaign = await selectRolloverCampaign({
    currentCampaignId: campaignId,
    currentCategoryId: oldCampaign?.categoryId || null,
    prismaClient,
  });

  // Jika tidak ditemukan program aktif lain, fallback ke Opsi Penutupan Aman (Completed)
  if (!targetCampaign) {
    const completedResult = await completeRoutineDonationsForCampaign(campaignId, {
      reason: `${reason} (Tidak ada program aktif lain untuk pengalihan)`,
      notifyDonors,
      prismaClient,
    });
    return { action: "COMPLETED", ...completedResult };
  }

  // 3. Eksekusi pengalihan komitmen secara atomic ke program baru
  const routineIds = activeRoutines.map((r) => r.id);
  await prismaClient.routineDonation.updateMany({
    where: { id: { in: routineIds } },
    data: {
      campaignId: targetCampaign.id,
      programTitle: targetCampaign.title,
    },
  });

  // 4. Catat audit trail ke ActivityLog
  try {
    await prismaClient.activityLog.create({
      data: {
        action: "ROUTINE_AUTO_ROLLOVER",
        targetType: "Campaign",
        targetId: campaignId,
        userName: "System",
        description: `Otomatis mengalihkan ${activeRoutines.length} komitmen donasi rutin dari program [${oldTitle}] ke program [${targetCampaign.title}] (${reason}).`,
      },
    });
  } catch (logErr) {
    console.error("[RoutineRollover] Gagal mencatat ActivityLog:", logErr);
  }

  // 5. Kirim notifikasi transparansi pengalihan ke donatur
  let notifiedCount = 0;
  const errors = [];
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yayasanpabe.org";
  const actionUrl = `${baseUrl}/donatur/dashboard#donor-routine-card`;

  if (notifyDonors) {
    for (const routine of activeRoutines) {
      try {
        if (routine.donorEmail) {
          await sendRoutineRolloverEmail({
            to: routine.donorEmail,
            donorName: routine.donorName,
            oldProgramTitle: oldTitle,
            newProgramTitle: targetCampaign.title,
            actionUrl,
          });
        } else if (routine.donorPhone) {
          await sendWhatsAppRolloverNotification({
            to: routine.donorPhone,
            donorName: routine.donorName,
            oldProgramTitle: oldTitle,
            newProgramTitle: targetCampaign.title,
            actionUrl,
          });
        }
        notifiedCount++;
      } catch (err) {
        errors.push({
          routineId: routine.id,
          recipient: routine.donorEmail || routine.donorPhone,
          error: err.message,
        });
      }
    }
  }

  return {
    action: "ROLLED_OVER",
    targetCampaign,
    updatedCount: activeRoutines.length,
    notifiedCount,
    errors,
  };
}

/**
 * Mengalihkan satu komitmen donasi rutin ke program aktif yang paling membutuhkan dana.
 * Digunakan sebagai fail-safe oleh cron scheduler jika program terikat sudah tidak aktif atau expired.
 *
 * @param {string} routineId
 * @param {object} [options]
 * @param {boolean} [options.notifyDonor=true]
 * @param {object} [options.prismaClient=prisma]
 * @returns {Promise<{ action: string, targetCampaign?: object, routine: object }>}
 */
export async function rolloverOrCompleteSingleRoutineDonation(
  routineId,
  { notifyDonor = true, prismaClient = prisma } = {}
) {
  if (!routineId) return null;

  const routine = await prismaClient.routineDonation.findUnique({
    where: { id: routineId },
    include: {
      campaign: {
        select: { id: true, title: true, slug: true, categoryId: true },
      },
    },
  });

  if (!routine || routine.status === ROUTINE_STATUS.COMPLETED) {
    return { action: "NONE", routine };
  }

  const oldTitle = routine.programTitle || routine.campaign?.title || "Program Kebaikan";

  // Evaluasi kandidat pengalihan
  const targetCampaign = await selectRolloverCampaign({
    currentCampaignId: routine.campaignId,
    currentCategoryId: routine.campaign?.categoryId || null,
    prismaClient,
  });

  // Jika tidak ada program aktif pengganti, selesaikan jadwal (Completed)
  if (!targetCampaign) {
    const updated = await completeSingleRoutineDonation(routineId, {
      notifyDonor,
      prismaClient,
    });
    return { action: "COMPLETED", routine: updated };
  }

  // Update komitmen ke program pengganti
  const updatedRoutine = await prismaClient.routineDonation.update({
    where: { id: routineId },
    data: {
      campaignId: targetCampaign.id,
      programTitle: targetCampaign.title,
    },
  });

  try {
    await prismaClient.activityLog.create({
      data: {
        action: "ROUTINE_AUTO_ROLLOVER",
        targetType: "RoutineDonation",
        targetId: routineId,
        userName: "System",
        description: `Otomatis mengalihkan donasi rutin ${routine.donorEmail || routine.donorPhone} dari program [${oldTitle}] ke program [${targetCampaign.title}].`,
      },
    });
  } catch (logErr) {
    console.error("[RoutineRollover] Gagal mencatat ActivityLog single:", logErr);
  }

  if (notifyDonor) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yayasanpabe.org";
      const actionUrl = `${baseUrl}/donatur/dashboard#donor-routine-card`;
      if (routine.donorEmail) {
        await sendRoutineRolloverEmail({
          to: routine.donorEmail,
          donorName: routine.donorName,
          oldProgramTitle: oldTitle,
          newProgramTitle: targetCampaign.title,
          actionUrl,
        });
      } else if (routine.donorPhone) {
        await sendWhatsAppRolloverNotification({
          to: routine.donorPhone,
          donorName: routine.donorName,
          oldProgramTitle: oldTitle,
          newProgramTitle: targetCampaign.title,
          actionUrl,
        });
      }
    } catch (err) {
      console.error("[RoutineRollover] Gagal kirim notifikasi single rollover:", err);
    }
  }

  return {
    action: "ROLLED_OVER",
    targetCampaign,
    routine: updatedRoutine,
  };
}

/**
 * Menyelesaikan seluruh komitmen donasi rutin yang terikat pada suatu campaign.
 *
 * @param {string} campaignId - ID program kampanye yang ditutup
 * @param {object} [options]
 * @param {string} [options.reason="PROGRAM_COMPLETED"] - Alasan penutupan
 * @param {boolean} [options.notifyDonors=true] - Kirim notifikasi ke donatur
 * @param {object} [options.prismaClient=prisma]
 * @returns {Promise<{ updatedCount: number, notifiedCount: number, errors: Array }>}
 */
export async function completeRoutineDonationsForCampaign(
  campaignId,
  { reason = "PROGRAM_COMPLETED", notifyDonors = true, prismaClient = prisma } = {}
) {
  if (!campaignId) {
    return { updatedCount: 0, notifiedCount: 0, errors: [] };
  }

  const activeRoutines = await prismaClient.routineDonation.findMany({
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

  const routineIds = activeRoutines.map((r) => r.id);
  await prismaClient.routineDonation.updateMany({
    where: { id: { in: routineIds } },
    data: { status: ROUTINE_STATUS.COMPLETED },
  });

  try {
    await prismaClient.activityLog.create({
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

  let notifiedCount = 0;
  const errors = [];
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yayasanpabe.org";

  if (notifyDonors) {
    for (const routine of activeRoutines) {
      const progTitle = routine.programTitle || routine.campaign?.title || "Program Kebaikan";
      try {
        if (routine.donorEmail) {
          await sendRoutineCompletionEmail({
            to: routine.donorEmail,
            donorName: routine.donorName,
            programTitle: progTitle,
            catalogUrl: `${baseUrl}/program`,
          });
        } else if (routine.donorPhone) {
          await sendWhatsAppCompletionNotification({
            to: routine.donorPhone,
            donorName: routine.donorName,
            programTitle: progTitle,
            catalogUrl: `${baseUrl}/program`,
          });
        }
        notifiedCount++;
      } catch (err) {
        errors.push({
          routineId: routine.id,
          recipient: routine.donorEmail || routine.donorPhone,
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
 * @param {object} [options.prismaClient=prisma]
 * @returns {Promise<object>}
 */
export async function completeSingleRoutineDonation(
  routineId,
  { notifyDonor = false, prismaClient = prisma } = {}
) {
  if (!routineId) return null;

  const routine = await prismaClient.routineDonation.findUnique({
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

  const updated = await prismaClient.routineDonation.update({
    where: { id: routineId },
    data: { status: ROUTINE_STATUS.COMPLETED },
  });

  if (notifyDonor) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yayasanpabe.org";
      const progTitle = routine.programTitle || routine.campaign?.title || "Program Kebaikan";
      if (routine.donorEmail) {
        await sendRoutineCompletionEmail({
          to: routine.donorEmail,
          donorName: routine.donorName,
          programTitle: progTitle,
          catalogUrl: `${baseUrl}/program`,
        });
      } else if (routine.donorPhone) {
        await sendWhatsAppCompletionNotification({
          to: routine.donorPhone,
          donorName: routine.donorName,
          programTitle: progTitle,
          catalogUrl: `${baseUrl}/program`,
        });
      }
    } catch (err) {
      console.error("[RoutineCompletion] Gagal kirim notifikasi penutupan:", err);
    }
  }

  return updated;
}
