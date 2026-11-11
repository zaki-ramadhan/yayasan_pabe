import prisma from "@/lib/prisma";
import { isCampaignClosed } from "@/lib/formatters";
import { formatCampaignFromDb } from "./campaignFormatter";
import { DEFAULT_ZAKAT_SPEC } from "@/constants/zakatProgram";
import { ZIS_CAMPAIGN_WHERE } from "@/lib/zisFilter";

export async function getCampaigns({ category = "all", search = "", sort = "terbaru", status, excludeZakat = false } = {}) {
  try {
    const where = {};
    if (status) {
      where.status = status;
    }

    if (excludeZakat) {
      where.AND = [
        ...(where.AND || []),
        { NOT: ZIS_CAMPAIGN_WHERE },
      ];
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
    if (sort === "terpopuler") {
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

    return dbCampaigns.map(formatCampaignFromDb);
  } catch (error) {
    console.error("Prisma getCampaigns error:", error.message);
    return [];
  }
}

export async function getZisCampaigns({ search = "", sort = "terbaru", status } = {}) {
  try {
    const where = {
      ...ZIS_CAMPAIGN_WHERE,
    };
    if (status) {
      where.status = status;
    }
    if (search && search.trim().length >= 2) {
      where.title = { contains: search.trim(), mode: "insensitive" };
    }

    let orderBy = { endDate: "desc" };
    if (sort === "terpopuler") {
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

    const formatted = dbCampaigns.map(formatCampaignFromDb);
    if (formatted.length === 0) {
      const defaultZakat = await getOrCreateDefaultZakatCampaign();
      return defaultZakat ? [defaultZakat] : [];
    }
    return formatted;
  } catch (error) {
    console.error("Prisma getZisCampaigns error:", error.message);
    const defaultZakat = await getOrCreateDefaultZakatCampaign();
    return defaultZakat ? [defaultZakat] : [];
  }
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
    return dbFeatured.map(formatCampaignFromDb);
  } catch (error) {
    console.error("Prisma getFeaturedCampaigns error:", error);
    return [];
  }
}

export async function getOrCreateDefaultZakatCampaign() {
  try {
    const directZakat = await prisma.campaign.findUnique({
      where: { slug: "zakat" },
      include: {
        category: true,
        updates: { orderBy: { date: "desc" } },
        donations: {
          where: { status: "PAID" },
          orderBy: { paidAt: "desc" },
          take: 10,
        },
      },
    });
    if (directZakat) {
      return formatCampaignFromDb(directZakat);
    }

    const existingActive = await prisma.campaign.findFirst({
      where: {
        status: "ACTIVE",
        OR: [
          { category: { slug: "zakat" } },
          { slug: { contains: "zakat", mode: "insensitive" } },
        ],
      },
      include: {
        category: true,
        updates: { orderBy: { date: "desc" } },
        donations: {
          where: { status: "PAID" },
          orderBy: { paidAt: "desc" },
          take: 10,
        },
      },
    });
    if (existingActive) {
      return formatCampaignFromDb(existingActive);
    }

    const created = await prisma.campaign.upsert({
      where: { slug: "zakat" },
      update: {},
      create: {
        title: DEFAULT_ZAKAT_SPEC.title,
        slug: DEFAULT_ZAKAT_SPEC.slug,
        targetAmount: null,
        collectedAmount: 0,
        donorCount: 0,
        isFeatured: true,
        location: DEFAULT_ZAKAT_SPEC.location,
        bannerUrl: DEFAULT_ZAKAT_SPEC.bannerUrl,
        excerpt: DEFAULT_ZAKAT_SPEC.excerpt,
        story: DEFAULT_ZAKAT_SPEC.story,
        status: "ACTIVE",
        category: {
          connectOrCreate: {
            where: { slug: "zakat" },
            create: {
              name: "ZISWAF",
              slug: "zakat",
              iconName: "HeartHandshake",
            },
          },
        },
      },
      include: {
        category: true,
        updates: true,
        donations: true,
      },
    });
    return formatCampaignFromDb(created);
  } catch (error) {
    console.warn("getOrCreateDefaultZakatCampaign fallback warning:", error?.message);
    return DEFAULT_ZAKAT_SPEC;
  }
}

export async function getCampaignBySlug(slug) {
  if (!slug) return null;
  const isZakatSlug = typeof slug === "string" && slug.toLowerCase().includes("zakat");

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
    console.error("Prisma getCampaignBySlug error:", error);
  }

  if (isZakatSlug) {
    return await getOrCreateDefaultZakatCampaign();
  }

  return null;
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
    console.error("Prisma getCategories error:", error.message);
  }
  return [{ id: "all", name: "Semua Program", slug: "all", count: 0 }];
}

export { getCampaignUpdates } from "./campaignFeedService";


/**
 * Menentukan target program untuk formulir Donasi Cepat berdasarkan hierarki kebutuhan:
 * 1. Program AKTIF dengan tenggat waktu (endDate) terdekat yang BELUM mencapai target.
 * 2. Fallback ke program aktif pertama / program default.
 */
export function getQuickDonateTargetSlug(campaigns = []) {
  if (!Array.isArray(campaigns) || campaigns.length === 0) {
    return "beasiswa-pendidikan-anak-yatim";
  }

  // 1. Filter hanya program aktif yang belum 100% mencapai target dana (atau program berkelanjutan tanpa target)
  const unfulfilled = campaigns.filter(
    (c) =>
      !isCampaignClosed(c) &&
      (!c.targetAmount || Number(c.collectedAmount || 0) < Number(c.targetAmount || 0))
  );

  const pool = unfulfilled.length > 0 ? unfulfilled : campaigns.filter((c) => !isCampaignClosed(c));

  // 2. Prioritas: Tenggat waktu (endDate) terdekat yang belum capai target
  const sortedByEndDate = [...pool].sort((a, b) => {
    const timeA = a.endDate ? new Date(a.endDate).getTime() : Infinity;
    const timeB = b.endDate ? new Date(b.endDate).getTime() : Infinity;
    return timeA - timeB;
  });

  if (sortedByEndDate[0]?.slug) {
    return sortedByEndDate[0].slug;
  }

  return "beasiswa-pendidikan-anak-yatim";
}
