import prisma from "@/lib/prisma";
import { CAMPAIGNS } from "@/data/campaigns";
import { sanitizeInput } from "@/lib/security";

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
    console.warn("Prisma getAdminDistributions fallback:", error.message);
    const mock = CAMPAIGNS.flatMap((c) =>
      (c.updates || []).map((u, i) => ({
        id: `dist-${c.id}-${i}`,
        campaignId: c.id,
        campaignTitle: c.title,
        campaignBannerUrl: c.bannerUrl || c.image || "/img/hero_card_1.jpeg",
        title: u.title,
        content: u.content,
        disbursedAmount: Number(u.spentAmount || 15000000),
        date: u.date || new Date().toISOString().split("T")[0],
        images: u.images || [],
        createdAt: new Date().toISOString(),
      }))
    );

    return {
      items: mock.slice(skip, skip + limit),
      pagination: {
        page,
        limit,
        total: mock.length,
        totalPages: Math.ceil(mock.length / limit) || 1,
      },
      campaigns: CAMPAIGNS.map((c) => ({ id: c.id, title: c.title, bannerUrl: c.bannerUrl || c.image || null })),
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
  const updateData = {};
  if (payload.title !== undefined) updateData.title = sanitizeInput(payload.title).trim();
  if (payload.content !== undefined) updateData.content = sanitizeInput(payload.content).trim();
  if (payload.disbursedAmount !== undefined) {
    updateData.disbursedAmount = Math.max(0, parseInt(payload.disbursedAmount, 10) || 0);
  }
  if (payload.campaignId !== undefined) updateData.campaignId = payload.campaignId;
  if (payload.date !== undefined) updateData.date = new Date(payload.date);
  if (Array.isArray(payload.images)) {
    updateData.images = payload.images.map((img) => sanitizeInput(img).trim());
  }

  return prisma.campaignUpdate.update({
    where: { id },
    data: updateData,
    include: { campaign: true },
  });
}

/**
 * Menghapus data rekam penyaluran dari database.
 */
export async function deleteAdminDistribution(id) {
  return prisma.campaignUpdate.delete({
    where: { id },
  });
}
