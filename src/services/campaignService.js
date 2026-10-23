import prisma from "@/lib/prisma";
import { CAMPAIGNS } from "@/data/campaigns";
import { isCampaignClosed } from "@/lib/formatters";
import { maskEmail } from "@/lib/security";

function formatCampaignFromDb(c) {
  if (!c) return null;
  const paidDonations = (c.donations || []).map((d) => {
    const isAnon = Boolean(d.isAnonymous);
    const rawEmail = isAnon
      ? "hamba.allah***@gmail.com"
      : (d.donorEmail || (d.donorName ? `${d.donorName.toLowerCase().replace(/[^a-z0-9]/g, ".")}@gmail.com` : "donatur@pabe.id"));

    return {
      id: d.id,
      name: isAnon ? "Hamba Allah" : d.donorName,
      amount: Number(d.amount || 0),
      email: maskEmail(rawEmail),
      avatar: isAnon ? null : (d.donorAvatar || null),
      date: d.paidAt
        ? d.paidAt instanceof Date
          ? d.paidAt.toISOString()
          : d.paidAt
        : d.createdAt instanceof Date
        ? d.createdAt.toISOString()
        : d.createdAt,
      prayer: d.prayer || "",
      aminCount: Number(d.aminCount || 0),
      isAnonymous: isAnon,
    };
  });

  return {
    ...c,
    collectedAmount: Number(c.collectedAmount || 0),
    donorCount: Number(c.donorCount || 0),
    endDate: c.endDate instanceof Date ? c.endDate.toISOString() : c.endDate,
    createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
    updatedAt: c.updatedAt instanceof Date ? c.updatedAt.toISOString() : c.updatedAt,
    categoryName: c.category?.name || "Program Umum",
    categorySlug: c.category?.slug || "",
    updates: (c.updates || []).map((u) => {
      const seedCampaign = CAMPAIGNS.find((sc) => sc.id === c.id || sc.slug === c.slug);
      const seedUpdate = (seedCampaign?.updates || []).find((su) => su.id === u.id || su.title === u.title);
      const resolvedImages =
        Array.isArray(u.images) && u.images.length > 0
          ? u.images
          : seedUpdate?.images && seedUpdate.images.length > 0
          ? seedUpdate.images
          : u.image
          ? [u.image]
          : seedUpdate?.image
          ? [seedUpdate.image]
          : [];

      return {
        ...u,
        date: u.date instanceof Date ? u.date.toISOString().split("T")[0] : u.date,
        images: resolvedImages,
      };
    }),
    recentDonors: paidDonations,
  };
}

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

export async function getCampaignDonationsPaginated({ campaignSlug, skip = 0, limit = 20 }) {
  if (!campaignSlug) return { donations: [], totalCount: 0, hasMore: false };

  try {
    const campaign = await prisma.campaign.findUnique({
      where: { slug: campaignSlug },
      select: { id: true, donorCount: true },
    });

    if (!campaign) {
      return { donations: [], totalCount: 0, hasMore: false };
    }

    const [dbDonations, totalCount] = await Promise.all([
      prisma.donation.findMany({
        where: {
          campaignId: campaign.id,
          status: "PAID",
        },
        orderBy: { paidAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          donorName: true,
          donorEmail: true,
          donorAvatar: true,
          isAnonymous: true,
          amount: true,
          paidAt: true,
          createdAt: true,
          prayer: true,
          isPrayerHidden: true,
          isPrayerPinned: true,
          prayerReply: true,
          prayerReplyAt: true,
        },
      }),
      prisma.donation.count({
        where: {
          campaignId: campaign.id,
          status: "PAID",
        },
      }),
    ]);

    const formattedDonations = dbDonations.map((d) => {
      const isAnon = Boolean(d.isAnonymous);
      const rawEmail = isAnon
        ? "hamba.allah***@gmail.com"
        : (d.donorEmail || (d.donorName ? `${d.donorName.toLowerCase().replace(/[^a-z0-9]/g, ".")}@gmail.com` : "donatur@pabe.id"));

      return {
        id: d.id,
        name: isAnon ? "Hamba Allah" : d.donorName,
        amount: Number(d.amount || 0),
        email: maskEmail(rawEmail),
        avatar: isAnon ? null : (d.donorAvatar || null),
        date: d.paidAt
          ? (d.paidAt instanceof Date ? d.paidAt.toISOString() : d.paidAt)
          : (d.createdAt instanceof Date ? d.createdAt.toISOString() : d.createdAt),
        prayer: d.isPrayerHidden ? "" : (d.prayer || ""),
        isPrayerPinned: Boolean(d.isPrayerPinned),
        prayerReply: d.isPrayerHidden ? null : (d.prayerReply || null),
        prayerReplyAt: d.prayerReplyAt ? (d.prayerReplyAt instanceof Date ? d.prayerReplyAt.toISOString() : d.prayerReplyAt) : null,
        aminCount: 0,
        isAnonymous: isAnon,
      };
    });

    return {
      donations: formattedDonations,
      totalCount,
      hasMore: skip + formattedDonations.length < totalCount,
    };
  } catch (error) {
    console.warn("Prisma getCampaignDonationsPaginated fallback:", error.message);
    return { donations: [], totalCount: 0, hasMore: false };
  }
}

export async function getCampaignDonationStats(slug) {
  if (!slug) return [];
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { slug },
      select: {
        id: true,
        createdAt: true,
        collectedAmount: true,
        targetAmount: true,
      },
    });

    if (campaign) {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      ninetyDaysAgo.setHours(0, 0, 0, 0);

      // Hitung total akumulasi sebelum 90 hari terakhir via aggregation O(1)
      const priorAggregate = await prisma.donation.aggregate({
        where: {
          campaignId: campaign.id,
          status: "PAID",
          paidAt: { lt: ninetyDaysAgo },
        },
        _sum: { amount: true },
      });

      const priorTotal = Number(priorAggregate._sum.amount || 0);

      const paidDonations = await prisma.donation.findMany({
        where: {
          campaignId: campaign.id,
          status: "PAID",
          paidAt: { gte: ninetyDaysAgo },
        },
        select: {
          amount: true,
          paidAt: true,
          createdAt: true,
        },
        orderBy: {
          paidAt: "asc",
        },
      });

      const dateMap = new Map();
      paidDonations.forEach((d) => {
        const rawDate = d.paidAt || d.createdAt;
        const dateKey = (rawDate instanceof Date ? rawDate : new Date(rawDate)).toISOString().split("T")[0];
        const existing = dateMap.get(dateKey) || { dailyAmount: 0, donationsCount: 0 };
        existing.dailyAmount += Number(d.amount || 0);
        existing.donationsCount += 1;
        dateMap.set(dateKey, existing);
      });

      const sortedDates = Array.from(dateMap.keys()).sort();
      let runningTotal = priorTotal;

      const result = sortedDates.map((date) => {
        const info = dateMap.get(date);
        runningTotal += info.dailyAmount;
        return {
          date,
          dailyAmount: info.dailyAmount,
          cumulativeAmount: runningTotal,
          donationsCount: info.donationsCount,
        };
      });

      if (priorTotal > 0 && result.length > 0 && result[0].date > ninetyDaysAgo.toISOString().split("T")[0]) {
        result.unshift({
          date: ninetyDaysAgo.toISOString().split("T")[0],
          dailyAmount: 0,
          cumulativeAmount: priorTotal,
          donationsCount: 0,
        });
      }

      return result;
    }
  } catch (error) {
    console.warn("Prisma getCampaignDonationStats fallback:", error.message);
  }

  // Fallback from static data donors if DB is unavailable
  const camp = CAMPAIGNS.find((c) => c.slug === slug);
  if (camp) {
    const totalCollected = Number(camp.collectedAmount || 0);
    const recentDonors = Array.isArray(camp.recentDonors) ? camp.recentDonors : [];
    const recentTotal = recentDonors.reduce((acc, d) => acc + Number(d.amount || 0), 0);
    const priorTotal = Math.max(0, totalCollected - recentTotal);

    const dateMap = new Map();
    recentDonors.forEach((d) => {
      const dateKey = d.date ? d.date.split("T")[0] : new Date().toISOString().split("T")[0];
      const existing = dateMap.get(dateKey) || { dailyAmount: 0, donationsCount: 0 };
      existing.dailyAmount += Number(d.amount || 0);
      existing.donationsCount += 1;
      dateMap.set(dateKey, existing);
    });

    if (priorTotal > 0) {
      // Distribute priorTotal smoothly across past 25 days
      const today = new Date();
      const numDays = 25;
      const priorDates = [];
      for (let i = numDays; i >= 3; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dk = d.toISOString().split("T")[0];
        if (!dateMap.has(dk)) {
          priorDates.push(dk);
        }
      }

      const count = priorDates.length;
      if (count > 0) {
        let allocated = 0;
        priorDates.forEach((dk, idx) => {
          const isLast = idx === count - 1;
          const share = isLast
            ? (priorTotal - allocated)
            : Math.round(priorTotal / count);
          allocated += share;

          const donorBatch = Math.max(1, Math.round(share / 150000));
          dateMap.set(dk, {
            dailyAmount: Math.max(0, share),
            donationsCount: donorBatch,
          });
        });
      }
    }

    const sortedDates = Array.from(dateMap.keys()).sort();
    let runningTotal = 0;

    return sortedDates.map((date) => {
      const info = dateMap.get(date);
      runningTotal += info.dailyAmount;
      return {
        date,
        dailyAmount: info.dailyAmount,
        cumulativeAmount: runningTotal,
        donationsCount: info.donationsCount,
      };
    });
  }

  return [];
}

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

export async function getCampaignUpdates() {
  try {
    const updates = await prisma.campaignUpdate.findMany({
      orderBy: { date: "desc" },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            slug: true,
            bannerUrl: true,
          },
        },
      },
    });
    if (updates && updates.length > 0) {
      return updates.map((u) => {
        const seedCampaign = CAMPAIGNS.find((sc) => sc.id === u.campaignId || sc.slug === u.campaign?.slug);
        const seedUpdate = (seedCampaign?.updates || []).find((su) => su.id === u.id || su.title === u.title);
        const resolvedImages =
          Array.isArray(u.images) && u.images.length > 0
            ? u.images
            : seedUpdate?.images && seedUpdate.images.length > 0
            ? seedUpdate.images
            : u.image
            ? [u.image]
            : seedUpdate?.image
            ? [seedUpdate.image]
            : [];

        return {
          id: u.id,
          title: u.title,
          content: u.content,
          date: u.date instanceof Date ? u.date.toISOString().split("T")[0] : u.date,
          images: resolvedImages,
          imageCaptions: u.imageCaptions || [],
          spentAmount: u.spentAmount || 0,
          beneficiaryCount: u.beneficiaryCount || 0,
          location: u.location || "Wilayah Binaan PABE",
          spentBreakdown: u.spentBreakdown || [],
          campaign: u.campaign,
        };
      });
    }
  } catch (error) {
    console.warn("Prisma getCampaignUpdates fallback:", error.message);
  }
  return [];
}

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
