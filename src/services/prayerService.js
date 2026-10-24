import prisma from "@/lib/prisma";
import { sanitizePrayer } from "@/lib/security";

/**
 * Mengambil daftar doa donatur untuk moderasi admin yayasan.
 */
export async function getAdminPrayers({
  page = 1,
  limit = 20,
  search = "",
  status = "ALL",
  campaignId = "",
} = {}) {
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const pageLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (currentPage - 1) * pageLimit;

  try {
    const where = {
      prayer: { not: null },
      AND: [{ prayer: { not: "" } }],
    };

    if (campaignId && campaignId !== "ALL") {
      where.campaignId = campaignId;
    }

    if (status === "ACTIVE") {
      where.isPrayerHidden = false;
    } else if (status === "HIDDEN") {
      where.isPrayerHidden = true;
    } else if (status === "PINNED") {
      where.isPrayerPinned = true;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { donorName: { contains: q, mode: "insensitive" } },
        { prayer: { contains: q, mode: "insensitive" } },
        { invoiceId: { contains: q, mode: "insensitive" } },
      ];
    }

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where,
        orderBy: [
          { isPrayerPinned: "desc" },
          { createdAt: "desc" },
        ],
        skip,
        take: pageLimit,
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      }),
      prisma.donation.count({ where }),
    ]);

    const formatted = donations.map((d) => ({
      id: d.id,
      invoiceId: d.invoiceId,
      campaignId: d.campaignId,
      campaignTitle: d.campaign?.title || "Donasi Umum",
      campaignSlug: d.campaign?.slug || "",
      donorName: d.isAnonymous ? "Hamba Allah" : d.donorName,
      rawDonorName: d.donorName,
      donorEmail: d.donorEmail,
      donorAvatar: d.donorAvatar || null,
      isAnonymous: d.isAnonymous,
      prayer: d.prayer,
      aminCount: d.aminCount || 0,
      isPrayerHidden: Boolean(d.isPrayerHidden),
      isPrayerPinned: Boolean(d.isPrayerPinned),
      prayerReply: d.prayerReply || null,
      prayerReplyAt: d.prayerReplyAt instanceof Date ? d.prayerReplyAt.toISOString() : d.prayerReplyAt,
      amount: Number(d.amount || 0),
      donationStatus: d.status,
      createdAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : d.createdAt,
    }));

    return {
      prayers: formatted,
      total,
      totalPages: Math.ceil(total / pageLimit) || 1,
      currentPage,
    };
  } catch (error) {
    console.warn("Prisma getAdminPrayers fallback:", error.message);
    return {
      prayers: [],
      total: 0,
      totalPages: 1,
      currentPage: 1,
    };
  }
}

/**
 * Menyembunyikan atau menampilkan doa donatur dari feed publik.
 */
export async function toggleHidePrayer({
  donationId,
  isHidden,
  actorName = "Admin",
  actorRole = "ADMIN",
  actorId,
}) {
  try {
    const updated = await prisma.donation.update({
      where: { id: donationId },
      data: { isPrayerHidden: Boolean(isHidden) },
      select: { id: true, invoiceId: true, donorName: true, isPrayerHidden: true },
    });

    return updated;
  } catch (error) {
    console.error("Error toggleHidePrayer:", error.message);
    throw new Error("Gagal memperbarui status moderasi doa.");
  }
}

/**
 * Menyematkan (pin) atau melepas pin doa donatur.
 */
export async function togglePinPrayer({
  donationId,
  isPinned,
}) {
  try {
    const updated = await prisma.donation.update({
      where: { id: donationId },
      data: { isPrayerPinned: Boolean(isPinned) },
      select: { id: true, invoiceId: true, donorName: true, isPrayerPinned: true },
    });

    return updated;
  } catch (error) {
    console.error("Error togglePinPrayer:", error.message);
    throw new Error("Gagal mengubah status sematan doa.");
  }
}

/**
 * Memberikan tanggapan / balasan resmi pengurus yayasan atas doa donatur.
 */
export async function replyPrayer({
  donationId,
  replyText,
}) {
  const cleanReply = sanitizePrayer(replyText);
  if (!cleanReply) {
    throw new Error("Teks balasan doa tidak boleh kosong.");
  }

  try {
    const updated = await prisma.donation.update({
      where: { id: donationId },
      data: {
        prayerReply: cleanReply,
        prayerReplyAt: new Date(),
      },
      select: { id: true, invoiceId: true, prayerReply: true, prayerReplyAt: true },
    });

    return updated;
  } catch (error) {
    console.error("Error replyPrayer:", error.message);
    throw new Error("Gagal menyimpan balasan doa.");
  }
}

/**
 * Mengambil daftar riwayat doa donatur yang bersangkutan.
 */
export async function getDonorPrayers({ userEmail, userName, page = 1, limit = 10 }) {
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const pageLimit = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
  const skip = (currentPage - 1) * pageLimit;

  try {
    const orConditions = [];
    if (userEmail && typeof userEmail === "string") {
      orConditions.push({ donorEmail: { equals: userEmail.trim(), mode: "insensitive" } });
    }
    if (userName && typeof userName === "string") {
      orConditions.push({ donorName: { equals: userName.trim(), mode: "insensitive" } });
    }

    if (orConditions.length === 0) {
      return { prayers: [], total: 0, totalPages: 1, currentPage: 1 };
    }

    const where = {
      OR: orConditions,
      status: "PAID",
      prayer: { not: null },
      AND: [{ prayer: { not: "" } }],
    };

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageLimit,
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      }),
      prisma.donation.count({ where }),
    ]);

    const formatted = donations.map((d) => ({
      id: d.id,
      invoiceId: d.invoiceId,
      campaignTitle: d.campaign?.title || "Donasi Umum Yayasan",
      campaignSlug: d.campaign?.slug || "",
      prayer: d.prayer,
      aminCount: d.aminCount || 0,
      prayerReply: d.prayerReply || null,
      prayerReplyAt: d.prayerReplyAt instanceof Date ? d.prayerReplyAt.toISOString() : d.prayerReplyAt,
      amount: Number(d.amount || 0),
      createdAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : d.createdAt,
    }));

    return {
      prayers: formatted,
      total,
      totalPages: Math.ceil(total / pageLimit) || 1,
      currentPage,
    };
  } catch (error) {
    console.warn("Prisma getDonorPrayers fallback:", error.message);
    return { prayers: [], total: 0, totalPages: 1, currentPage: 1 };
  }
}
