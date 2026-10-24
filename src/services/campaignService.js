import prisma from "@/lib/prisma";
import { isCampaignClosed } from "@/lib/formatters";
import { formatCampaignFromDb } from "./campaignFormatter";

export async function getCampaigns({ category = "all", search = "", sort = "terbaru", status } = {}) {
  try {
    const where = {};
    if (status) {
      where.status = status;
    }

    if (category && category !== "all" && category !== "semua") {
      where.OR = [
        { categoryId: category },
        { category: { slug: category } },
        { category: { name: { contains: category, mode: "insensitive" } } },
      ];
    }

    if (search && search.trim().length >= 2) {
      where.title = { contains: search.trim(), mode: "insensitive" };
    }

    let orderBy = { endDate: "desc" };
    if (sort === "mendesak") {
      orderBy = [{ isUrgent: "desc" }, { endDate: "asc" }];
    } else if (sort === "terpopuler") {
      orderBy = { donorCount: "desc" };
    } else if (sort === "dana-terbanyak") {
      orderBy = { collectedAmount: "desc" };
    }

    const dbCampaigns = await prisma.campaign.findMany({
      where,
      orderBy,
      include: {
        category: true,
        updates: { orderBy: { date: "desc" } },
        donations: {
          where: { status: "PAID" },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (dbCampaigns && dbCampaigns.length > 0) {
      return dbCampaigns.map(formatCampaignFromDb);
    }
  } catch (error) {
    console.warn("Prisma getCampaigns fallback:", error.message);
  }

  // Fallback to static data
  let filtered = [...CAMPAIGNS];

  if (status) {
    filtered = filtered.filter((c) => (c.status || "ACTIVE") === status);
  }

  if (category && category !== "all" && category !== "semua") {
    filtered = filtered.filter(
      (c) => c.categoryId === category || c.categoryName.toLowerCase().includes(category.toLowerCase())
    );
  }

  if (search && search.trim().length >= 2) {
    const query = search.toLowerCase().trim();
    filtered = filtered.filter((c) => c.title.toLowerCase().includes(query));
  }

  if (sort === "mendesak") {
    filtered.sort((a, b) => (b.isUrgent ? 1 : 0) - (a.isUrgent ? 1 : 0));
  } else if (sort === "terpopuler") {
    filtered.sort((a, b) => b.donorCount - a.donorCount);
  } else if (sort === "dana-terbanyak") {
    filtered.sort((a, b) => b.collectedAmount - a.collectedAmount);
  } else {
    filtered.sort((a, b) => new Date(b.endDate) - new Date(a.endDate));
  }

  return filtered;
}

export async function getFeaturedCampaigns() {
  try {
    const dbFeatured = await prisma.campaign.findMany({
      where: { isFeatured: true, status: "ACTIVE" },
      include: {
        category: true,
        updates: true,
        donations: { where: { status: "PAID" }, take: 5, orderBy: { createdAt: "desc" } },
      },
    });
    if (dbFeatured && dbFeatured.length > 0) {
      return dbFeatured.map(formatCampaignFromDb);
    }
  } catch (error) {
    console.warn("Prisma getFeaturedCampaigns fallback:", error.message);
  }
  return CAMPAIGNS.filter((c) => c.isFeatured);
}

export async function getUrgentCampaigns() {
  try {
    const dbUrgent = await prisma.campaign.findMany({
      where: { isUrgent: true, status: "ACTIVE" },
      include: {
        category: true,
        updates: true,
        donations: { where: { status: "PAID" }, take: 5, orderBy: { createdAt: "desc" } },
      },
    });
    if (dbUrgent && dbUrgent.length > 0) {
      return dbUrgent.map(formatCampaignFromDb);
    }
  } catch (error) {
    console.warn("Prisma getUrgentCampaigns fallback:", error.message);
  }
  return CAMPAIGNS.filter((c) => c.isUrgent);
}

export async function getCampaignBySlug(slug) {
  if (!slug) return null;
  try {
    const dbCampaign = await prisma.campaign.findUnique({
      where: { slug },
      include: {
        category: true,
        updates: { orderBy: { date: "desc" } },
        donations: {
          where: { status: "PAID" },
          orderBy: { paidAt: "desc" },
          take: 30, // Batasi 30 donasi mutasi awal untuk efisiensi render SSR
        },
      },
    });
    if (dbCampaign) {
      return formatCampaignFromDb(dbCampaign);
    }
  } catch (error) {
    console.warn("Prisma getCampaignBySlug fallback:", error.message);
  }
  const found = CAMPAIGNS.find((c) => c.slug === slug) || null;
  if (!found) return null;
  return {
    ...found,
    recentDonors: (found.recentDonors || []).map((d) => ({
      ...d,
      name: d.isAnonymous ? "Hamba Allah" : d.name,
      avatar: d.isAnonymous ? null : d.avatar,
      email: maskEmail(d.email),
    })),
  };
}

export { getCampaignDonationsPaginated } from "./campaignFeedService";


export { getCampaignDonationStats } from "./campaignStatsService";


export async function getCategories() {
  try {
    const dbCats = await prisma.category.findMany({
      where: {
        campaigns: {
          some: {},
        },
      },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { campaigns: true },
        },
      },
    });
    if (dbCats && dbCats.length > 0) {
      return [
        { id: "all", name: "Semua Program", slug: "all", count: 0 },
        ...dbCats
          .filter((c) => (c._count?.campaigns || 0) > 0)
          .map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            count: c._count?.campaigns || 0,
          })),
      ];
    }
  } catch (error) {
    console.warn("Prisma getCategories fallback:", error.message);
  }
  return [
    { id: "all", name: "Semua Program", slug: "semua" },
    { id: "pendidikan", name: "Pendidikan & Santri", slug: "pendidikan" },
    { id: "bencana", name: "Tanggap Bencana", slug: "bencana" },
    { id: "zakat", name: "ZISWAF", slug: "zakat" },
    { id: "yatim", name: "Kemandirian Yatim", slug: "yatim" },
    { id: "ekonomi", name: "Pemberdayaan Umat", slug: "ekonomi" },
  ];
}

export { getCampaignUpdates } from "./campaignFeedService";


/**
 * Menentukan target program untuk formulir Donasi Cepat berdasarkan hierarki kebutuhan:
 * 1. Program AKTIF dengan isUrgent === true yang BELUM mencapai target (collected < target).
 * 2. Jika tidak ada, program AKTIF dengan tenggat waktu (endDate) terdekat yang BELUM mencapai target.
 * 3. Jika tidak ada yang mendesak, fallback ke program aktif pertama / program induk.
 */
export function getQuickDonateTargetSlug(campaigns = []) {
  if (!Array.isArray(campaigns) || campaigns.length === 0) {
    return "beasiswa-santri-penghafal-quran";
  }

  // 1. Filter hanya program aktif yang belum 100% mencapai target dana (atau program berkelanjutan tanpa target)
  const unfulfilled = campaigns.filter(
    (c) =>
      !isCampaignClosed(c) &&
      (!c.targetAmount || Number(c.collectedAmount || 0) < Number(c.targetAmount || 0))
  );

  const pool = unfulfilled.length > 0 ? unfulfilled : campaigns.filter((c) => !isCampaignClosed(c));

  // 2. Prioritas 1: Program Urgent yang belum capai target
  const urgent = pool.find((c) => c.isUrgent);
  if (urgent?.slug) return urgent.slug;

  // 3. Prioritas 2: Tenggat waktu (endDate) terdekat yang belum capai target
  const sortedByEndDate = [...pool].sort((a, b) => {
    const timeA = a.endDate ? new Date(a.endDate).getTime() : Infinity;
    const timeB = b.endDate ? new Date(b.endDate).getTime() : Infinity;
    return timeA - timeB;
  });

  if (sortedByEndDate[0]?.slug) {
    return sortedByEndDate[0].slug;
  }

  return "beasiswa-santri-penghafal-quran";
}
