import prisma from "@/lib/prisma";
import { sanitizeInput } from "@/lib/security";
import { deleteFromR2 } from "@/lib/r2Storage";

/**
 * Mengambil rekam penyaluran distribusi donasi ke mustahik.
 */
export async function getAdminDistributions({ page = 1, limit = 10 } = {}) {
  const skip = (Math.max(1, page) - 1) * limit;

  try {
    const [total, items, campaigns] = await Promise.all([
      prisma.campaignUpdate.count(),
      prisma.campaignUpdate.findMany({
        skip,
        take: limit,
        orderBy: { date: "desc" },
        include: {
          campaign: { select: { id: true, title: true, slug: true, bannerUrl: true } },
        },
      }),
      prisma.campaign.findMany({
        where: { status: "ACTIVE" },
        select: { id: true, title: true, bannerUrl: true },
      }),
    ]);

    return {
      items: items.map((u) => ({
        id: u.id,
        campaignId: u.campaignId,
        campaignTitle: u.campaign?.title || "Program Amanah",
        campaignBannerUrl: u.campaign?.bannerUrl || null,
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
        total: 0,
        totalPages: 1,
      },
      campaigns: [],
    };
  }
}


/**
 * Mencatat rekam penyaluran bantuan mustahik baru ke database.
 */
export async function createAdminDistribution(payload) {
  const title = sanitizeInput(payload.title || "").trim();
  const content = sanitizeInput(payload.content || "").trim();
  const disbursedAmount = Math.max(0, parseInt(payload.disbursedAmount, 10) || 0);
  const campaignId = payload.campaignId;
  const date = payload.date ? new Date(payload.date) : new Date();
  const images = Array.isArray(payload.images) ? payload.images.map((img) => sanitizeInput(img).trim()) : [];

  if (!title || !campaignId || disbursedAmount <= 0) {
    throw new Error("Judul, program tujuan, dan nominal penyaluran wajib diisi valid.");
  }

  return prisma.campaignUpdate.create({
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
}

/**
 * Memperbarui data rekam penyaluran yang sudah ada.
 */
export async function updateAdminDistribution(id, payload) {
  const existing = await prisma.campaignUpdate.findUnique({
    where: { id },
    select: { images: true },
  });

  const updateData = {};
  if (payload.title !== undefined) updateData.title = sanitizeInput(payload.title).trim();
  if (payload.content !== undefined) updateData.content = sanitizeInput(payload.content).trim();
  if (payload.disbursedAmount !== undefined) {
    updateData.disbursedAmount = Math.max(0, parseInt(payload.disbursedAmount, 10) || 0);
  }
  if (payload.campaignId !== undefined) updateData.campaignId = payload.campaignId;
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

  return prisma.campaignUpdate.update({
    where: { id },
    data: updateData,
    include: { campaign: true },
  });
}

/**
 * Menghapus data rekam penyaluran dari database dan membersihkan foto dokumentasi di R2.
 */
export async function deleteAdminDistribution(id) {
  const existing = await prisma.campaignUpdate.findUnique({
    where: { id },
    select: { images: true },
  });

  if (Array.isArray(existing?.images) && existing.images.length > 0) {
    await Promise.allSettled(existing.images.map((img) => deleteFromR2(img)));
  }

  return prisma.campaignUpdate.delete({
    where: { id },
  });
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
