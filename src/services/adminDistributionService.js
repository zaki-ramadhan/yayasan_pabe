import prisma from "@/lib/prisma";
import { sanitizeInput } from "@/lib/security";
import { deleteFromR2 } from "@/lib/r2Storage";
import {
  calculateCampaignDisbursementBudget,
  validateDisbursementAmount,
} from "@/lib/distributionConstants";

/**
 * Mengambil rekam penyaluran distribusi donasi ke mustahik dan rincian anggaran program.
 */
export async function getAdminDistributions({ page = 1, limit = 10 } = {}) {
  const skip = (Math.max(1, page) - 1) * limit;

  try {
    const [total, items, rawCampaigns] = await Promise.all([
      prisma.campaignUpdate.count(),
      prisma.campaignUpdate.findMany({
        skip,
        take: limit,
        orderBy: { date: "desc" },
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
              slug: true,
              bannerUrl: true,
              location: true,
              targetAmount: true,
              collectedAmount: true,
            },
          },
        },
      }),
      prisma.campaign.findMany({
        where: { status: "ACTIVE" },
        select: {
          id: true,
          title: true,
          bannerUrl: true,
          targetAmount: true,
          collectedAmount: true,
          updates: {
            select: { id: true, disbursedAmount: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const campaigns = rawCampaigns.map((c) => {
      const totalDisbursed = (c.updates || []).reduce(
        (sum, u) => sum + (Number(u.disbursedAmount) || 0),
        0
      );
      const budgetInfo = calculateCampaignDisbursementBudget({
        collectedAmount: c.collectedAmount || 0,
        totalDisbursed,
      });

      return {
        id: c.id,
        title: c.title,
        bannerUrl: c.bannerUrl,
        targetAmount: Number(c.targetAmount || 0),
        collectedAmount: budgetInfo.collectedAmount,
        totalDisbursed: budgetInfo.totalDisbursed,
        remainingBudget: budgetInfo.remainingBudget,
        disbursementRatioPercent: budgetInfo.disbursementRatioPercent,
      };
    });

    return {
      items: items.map((u) => ({
        id: u.id,
        campaignId: u.campaignId,
        campaignTitle: u.campaign?.title || "Program Amanah",
        campaignBannerUrl: u.campaign?.bannerUrl || null,
        location: u.campaign?.location || null,
        title: u.title,
        content: u.content,
        disbursedAmount: Number(u.disbursedAmount || 0),
        date: u.date ? u.date.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        images: u.images || [],
        createdAt: u.createdAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      campaigns,
    };
  } catch (error) {
    console.warn("Prisma getAdminDistributions error:", error.message);
    return {
      items: [],
      pagination: {
        page,
        limit,
        total,
        totalPages: 1,
      },
      campaigns: [],
    };
  }
}


/**
 * Mencatat rekam penyaluran bantuan mustahik baru ke database dengan validasi sisa anggaran.
 * @param {object} payload
 * @param {object} [adminMeta]
 */
export async function createAdminDistribution(payload, adminMeta = {}) {
  const title = sanitizeInput(payload.title || "").trim();
  const content = sanitizeInput(payload.content || "").trim();
  const disbursedAmount = Math.max(0, parseInt(payload.disbursedAmount, 10) || 0);
  const campaignId = payload.campaignId;
  const date = payload.date ? new Date(payload.date) : new Date();
  const images = Array.isArray(payload.images) ? payload.images.map((img) => sanitizeInput(img).trim()) : [];

  if (!title || !campaignId || disbursedAmount <= 0) {
    throw new Error("Judul, program tujuan, dan nominal penyaluran wajib diisi valid.");
  }

  return prisma.$transaction(async (tx) => {
    const campaign = await tx.campaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        title: true,
        collectedAmount: true,
        updates: { select: { id: true, disbursedAmount: true } },
      },
    });

    if (!campaign) {
      throw new Error("Program donasi yang dipilih tidak ditemukan.");
    }

    const currentTotalDisbursed = (campaign.updates || []).reduce(
      (sum, u) => sum + (Number(u.disbursedAmount) || 0),
      0
    );

    const budgetInfo = calculateCampaignDisbursementBudget({
      collectedAmount: campaign.collectedAmount,
      totalDisbursed: currentTotalDisbursed,
    });

    const validation = validateDisbursementAmount(disbursedAmount, budgetInfo.remainingBudget);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const created = await tx.campaignUpdate.create({
      data: {
        campaignId,
        title,
        content,
        disbursedAmount,
        date,
        images,
      },
      include: { campaign: true },
    });

    if (tx.activityLog) {
      try {
        await tx.activityLog.create({
          data: {
            userId: adminMeta.userId || null,
            userName: adminMeta.userName || "Admin",
            userRole: adminMeta.userRole || "ADMIN",
            action: "CREATE_DISTRIBUTION",
            targetType: "CAMPAIGN_UPDATE",
            targetId: created.id,
            description: `Mencatat penyaluran dana Rp ${disbursedAmount.toLocaleString("id-ID")} untuk program '${campaign.title}'.`,
          },
        });
      } catch (logErr) {
        console.warn("Gagal mencatat ActivityLog penyaluran:", logErr.message);
      }
    }

    return created;
  });
}

/**
 * Memperbarui data rekam penyaluran yang sudah ada dengan validasi sisa anggaran.
 * @param {string} id
 * @param {object} payload
 * @param {object} [adminMeta]
 */
export async function updateAdminDistribution(id, payload, adminMeta = {}) {
  const existing = await prisma.campaignUpdate.findUnique({
    where: { id },
    select: { id: true, campaignId: true, disbursedAmount: true, images: true },
  });

  if (!existing) {
    throw new Error("Data penyaluran tidak ditemukan.");
  }

  const targetCampaignId = payload.campaignId || existing.campaignId;
  const newDisbursedAmount = payload.disbursedAmount !== undefined
    ? Math.max(0, parseInt(payload.disbursedAmount, 10) || 0)
    : existing.disbursedAmount;

  return prisma.$transaction(async (tx) => {
    const campaign = await tx.campaign.findUnique({
      where: { id: targetCampaignId },
      select: {
        id: true,
        title: true,
        collectedAmount: true,
        updates: { select: { id: true, disbursedAmount: true } },
      },
    });

    if (!campaign) {
      throw new Error("Program donasi yang dipilih tidak ditemukan.");
    }

    const currentTotalDisbursed = (campaign.updates || []).reduce(
      (sum, u) => sum + (Number(u.disbursedAmount) || 0),
      0
    );

    const isSameCampaign = existing.campaignId === targetCampaignId;
    const currentDisbursementAmount = isSameCampaign ? existing.disbursedAmount : 0;

    const budgetInfo = calculateCampaignDisbursementBudget({
      collectedAmount: campaign.collectedAmount,
      totalDisbursed: currentTotalDisbursed,
      currentDisbursementAmount,
    });

    const validation = validateDisbursementAmount(newDisbursedAmount, budgetInfo.remainingBudget);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const updateData = {};
    if (payload.title !== undefined) updateData.title = sanitizeInput(payload.title).trim();
    if (payload.content !== undefined) updateData.content = sanitizeInput(payload.content).trim();
    if (payload.disbursedAmount !== undefined) updateData.disbursedAmount = newDisbursedAmount;
    if (payload.campaignId !== undefined) updateData.campaignId = targetCampaignId;
    if (payload.date !== undefined) updateData.date = new Date(payload.date);
    if (Array.isArray(payload.images)) {
      const newImages = payload.images.map((img) => sanitizeInput(img).trim());
      updateData.images = newImages;

      // Bersihkan foto yang dihapus dari daftar
      if (Array.isArray(existing?.images)) {
        const removedImages = existing.images.filter((oldImg) => !newImages.includes(oldImg));
        if (removedImages.length > 0) {
          await Promise.allSettled(removedImages.map((img) => deleteFromR2(img)));
        }
      }
    }

    const updated = await tx.campaignUpdate.update({
      where: { id },
      data: updateData,
      include: { campaign: true },
    });

    if (tx.activityLog) {
      try {
        await tx.activityLog.create({
          data: {
            userId: adminMeta.userId || null,
            userName: adminMeta.userName || "Admin",
            userRole: adminMeta.userRole || "ADMIN",
            action: "UPDATE_DISTRIBUTION",
            targetType: "CAMPAIGN_UPDATE",
            targetId: updated.id,
            description: `Memperbarui penyaluran dana program '${campaign.title}' menjadi Rp ${newDisbursedAmount.toLocaleString("id-ID")}.`,
          },
        });
      } catch (logErr) {
        console.warn("Gagal mencatat ActivityLog update penyaluran:", logErr.message);
      }
    }

    return updated;
  });
}

/**
 * Menghapus data rekam penyaluran dari database dan membersihkan foto dokumentasi di R2.
 * @param {string} id
 * @param {object} [adminMeta]
 */
export async function deleteAdminDistribution(id, adminMeta = {}) {
  const existing = await prisma.campaignUpdate.findUnique({
    where: { id },
    include: { campaign: { select: { title: true } } },
  });

  if (!existing) {
    throw new Error("Data penyaluran tidak ditemukan.");
  }

  if (Array.isArray(existing.images) && existing.images.length > 0) {
    await Promise.allSettled(existing.images.map((img) => deleteFromR2(img)));
  }

  const deleted = await prisma.campaignUpdate.delete({
    where: { id },
  });

  if (prisma.activityLog) {
    try {
      await prisma.activityLog.create({
        data: {
          userId: adminMeta.userId || null,
          userName: adminMeta.userName || "Admin",
          userRole: adminMeta.userRole || "ADMIN",
          action: "DELETE_DISTRIBUTION",
          targetType: "CAMPAIGN_UPDATE",
          targetId: id,
          description: `Menghapus penyaluran dana Rp ${(existing.disbursedAmount || 0).toLocaleString("id-ID")} dari program '${existing.campaign?.title || "Program"}'.`,
        },
      });
    } catch (logErr) {
      console.warn("Gagal mencatat ActivityLog hapus penyaluran:", logErr.message);
    }
  }

  return deleted;
}

/**
 * Menghapus banyak data rekam penyaluran sekaligus dan membersihkan gambar di R2.
 */
export async function deleteAdminDistributionsBatch(ids) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("Daftar ID penyaluran tidak boleh kosong.");
  }

  const updatesToDelete = await prisma.campaignUpdate.findMany({
    where: { id: { in: ids } },
    select: { id: true, images: true },
  });

  const allImages = updatesToDelete.flatMap((u) => u.images || []).filter(Boolean);
  if (allImages.length > 0) {
    await Promise.allSettled(allImages.map((img) => deleteFromR2(img)));
  }

  const result = await prisma.campaignUpdate.deleteMany({
    where: { id: { in: ids } },
  });

  return { count: result.count };
}
