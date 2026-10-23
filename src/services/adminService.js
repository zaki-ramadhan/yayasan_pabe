import prisma from "@/lib/prisma";
import { CAMPAIGNS } from "@/data/campaigns";
import { RECENT_TRANSACTIONS } from "@/data/adminMockData";
import { sanitizeInput, maskEmail } from "@/lib/security";

/**
 * Mengambil ringkasan metrik statistik operasional admin yayasan.
 */
export async function getAdminOverviewStats() {
  try {
    const [donationAgg, campaignCount, donorCount, disbursedAgg] = await Promise.all([
      prisma.donation.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.campaign.count({ where: { status: "ACTIVE" } }),
      prisma.donation.groupBy({
        by: ["donorEmail"],
        where: { status: "PAID", donorEmail: { not: null } },
      }),
      prisma.campaignUpdate.aggregate({
        _sum: { disbursedAmount: true },
      }),
    ]);

    const totalCollected = donationAgg._sum.amount || 0;
    const totalTransactions = donationAgg._count.id || 0;
    const totalDisbursed = disbursedAgg._sum.disbursedAmount || 0;
    const activeDonors = donorCount.length || 0;

    return {
      totalCollected,
      totalTransactions,
      totalDisbursed,
      activeDonors,
      activeCampaigns: campaignCount,
    };
  } catch (error) {
    console.warn("Prisma getAdminOverviewStats fallback:", error.message);
    const mockTotalCollected = CAMPAIGNS.reduce((acc, c) => acc + (c.collectedAmount || 0), 0);
    return {
      totalCollected: mockTotalCollected,
      totalTransactions: 124,
      totalDisbursed: Math.round(mockTotalCollected * 0.72),
      activeDonors: 85,
      activeCampaigns: CAMPAIGNS.filter((c) => c.status === "ACTIVE").length,
    };
  }
}

/**
 * Mengambil daftar program kampanye untuk tabel manajemen admin.
 */
export async function getAdminCampaigns({ search = "", status = "", page = 1, limit = 10 } = {}) {
  const skip = (Math.max(1, page) - 1) * limit;

  try {
    const where = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, items, categories] = await Promise.all([
      prisma.campaign.count({ where }),
      prisma.campaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          updates: { select: { disbursedAmount: true } },
          _count: { select: { donations: true, updates: true } },
        },
      }),
      prisma.category.findMany({ select: { id: true, name: true, slug: true } }),
    ]);

    return {
      items: items.map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        category: c.category?.name || "Program Umum",
        categoryId: c.categoryId,
        targetAmount: Number(c.targetAmount || 0),
        collectedAmount: Number(c.collectedAmount || 0),
        disbursedAmount: c.updates?.reduce((acc, u) => acc + Number(u.disbursedAmount || 0), 0) || 0,
        updatesCount: c._count?.updates || c.updates?.length || 0,
        donorCount: c._count?.donations || c.donorCount || 0,
        endDate: c.endDate ? c.endDate.toISOString() : null,
        status: c.status,
        isUrgent: c.isUrgent,
        isFeatured: c.isFeatured,
        location: c.location || "Nasional",
        bannerUrl: c.bannerUrl || "/img/hero_card_1.jpeg",
        createdAt: c.createdAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      categories,
    };
  } catch (error) {
    console.warn("Prisma getAdminCampaigns fallback:", error.message);
    const filtered = CAMPAIGNS.filter((c) => {
      if (status && status !== "ALL" && c.status !== status) return false;
      if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    return {
      items: filtered.slice(skip, skip + limit).map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        category: c.category || "Program Umum",
        categoryId: c.categoryId || "cat-1",
        targetAmount: Number(c.targetAmount || 0),
        collectedAmount: Number(c.collectedAmount || 0),
        disbursedAmount: c.updates?.reduce((acc, u) => acc + Number(u.disbursedAmount || 0), 0) || 0,
        updatesCount: c.updates?.length || 0,
        donorCount: c.donorCount || 0,
        endDate: c.endDate || null,
        status: c.status || "ACTIVE",
        isUrgent: Boolean(c.isUrgent),
        isFeatured: Boolean(c.isFeatured),
        location: c.location || "Nasional",
        bannerUrl: c.bannerUrl || "/img/hero_card_1.jpeg",
        createdAt: new Date().toISOString(),
      })),
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit) || 1,
      },
      categories: [
        { id: "cat-1", name: "Pendidikan & Santri", slug: "pendidikan" },
        { id: "cat-2", name: "Kesehatan Dhuafa", slug: "kesehatan" },
        { id: "cat-3", name: "Pemberdayaan Ekonomi", slug: "ekonomi" },
        { id: "cat-4", name: "Tanggap Bencana", slug: "bencana" },
      ],
    };
  }
}

/**
 * Membuat kategori program baru dan menghasilkan slug unik.
 */
export async function createAdminCategory(name) {
  const sanitizedName = sanitizeInput(name || "").trim();
  if (!sanitizedName) {
    throw new Error("Nama kategori program wajib diisi.");
  }

  const baseSlug = sanitizedName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const uniqueSlug = `${baseSlug || "kategori"}-${Date.now().toString().slice(-4)}`;

  try {
    return await prisma.category.create({
      data: {
        name: sanitizedName,
        slug: uniqueSlug,
      },
    });
  } catch (error) {
    console.warn("Prisma createAdminCategory fallback:", error.message);
    return {
      id: `cat-${Date.now()}`,
      name: sanitizedName,
      slug: uniqueSlug,
    };
  }
}

/**
 * Membuat program kampanye baru dengan whitelisting atribut ketat (OWASP).
 */
export async function createAdminCampaign(payload) {
  const title = sanitizeInput(payload.title || "").trim();
  const location = sanitizeInput(payload.location || "Indonesia").trim();
  const story = sanitizeInput(payload.story || "").trim();
  const excerpt = sanitizeInput(payload.excerpt || story.slice(0, 160)).trim();
  const targetAmount = Math.max(0, parseInt(payload.targetAmount, 10) || 0);
  const isUrgent = Boolean(payload.isUrgent);
  const isFeatured = Boolean(payload.isFeatured);
  const bannerUrl = sanitizeInput(payload.bannerUrl || "/img/hero_card_1.jpeg").trim();
  let categoryId = payload.categoryId;
  const newCategoryName = payload.newCategoryName ? sanitizeInput(payload.newCategoryName).trim() : null;
  const endDate = payload.endDate ? new Date(payload.endDate) : null;

  // Auto-generate clean unique slug
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

  // If a new category is requested on-the-fly, create it atomically with the campaign
  if (!categoryId && newCategoryName) {
    return prisma.$transaction(async (tx) => {
      let category = await tx.category.findFirst({
        where: { name: { equals: newCategoryName, mode: "insensitive" } },
      });

      if (!category) {
        const catSlug = newCategoryName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        category = await tx.category.create({
          data: {
            name: newCategoryName,
            slug: `${catSlug || "kategori"}-${Date.now().toString().slice(-4)}`,
          },
        });
      }

      return tx.campaign.create({
        data: {
          title,
          slug: uniqueSlug,
          categoryId: category.id,
          targetAmount,
          collectedAmount: 0,
          donorCount: 0,
          endDate,
          isUrgent,
          isFeatured,
          location,
          excerpt,
          story,
          bannerUrl,
          status: "ACTIVE",
        },
        include: { category: true },
      });
    });
  }

  return prisma.campaign.create({
    data: {
      title,
      slug: uniqueSlug,
      categoryId,
      targetAmount,
      collectedAmount: 0,
      donorCount: 0,
      endDate,
      isUrgent,
      isFeatured,
      location,
      excerpt,
      story,
      bannerUrl,
      status: "ACTIVE",
    },
    include: { category: true },
  });
}

/**
 * Memperbarui program kampanye yang ada (OWASP Mass Assignment Protection).
 */
export async function updateAdminCampaign(id, payload) {
  const updateData = {};

  if (payload.title !== undefined) updateData.title = sanitizeInput(payload.title).trim();
  if (payload.targetAmount !== undefined) updateData.targetAmount = Math.max(0, parseInt(payload.targetAmount, 10) || 0);
  if (payload.location !== undefined) updateData.location = sanitizeInput(payload.location).trim();
  if (payload.story !== undefined) updateData.story = sanitizeInput(payload.story).trim();
  if (payload.excerpt !== undefined) updateData.excerpt = sanitizeInput(payload.excerpt).trim();
  if (payload.status !== undefined && ["ACTIVE", "PAUSED", "COMPLETED"].includes(payload.status)) {
    updateData.status = payload.status;
  }
  if (payload.isUrgent !== undefined) updateData.isUrgent = Boolean(payload.isUrgent);
  if (payload.isFeatured !== undefined) updateData.isFeatured = Boolean(payload.isFeatured);
  if (payload.bannerUrl !== undefined) updateData.bannerUrl = sanitizeInput(payload.bannerUrl).trim();

  if (!payload.categoryId && payload.newCategoryName) {
    const newCatName = sanitizeInput(payload.newCategoryName).trim();
    if (newCatName) {
      let category = await prisma.category.findFirst({
        where: { name: { equals: newCatName, mode: "insensitive" } },
      });
      if (!category) {
        const catSlug = newCatName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        category = await prisma.category.create({
          data: {
            name: newCatName,
            slug: `${catSlug || "kategori"}-${Date.now().toString().slice(-4)}`,
          },
        });
      }
      updateData.categoryId = category.id;
    }
  } else if (payload.categoryId !== undefined) {
    updateData.categoryId = payload.categoryId;
  }

  if (payload.endDate !== undefined) updateData.endDate = payload.endDate ? new Date(payload.endDate) : null;

  return prisma.campaign.update({
    where: { id },
    data: updateData,
  });
}

/**
 * Mengambil daftar mutasi transaksi donasi dengan filter kanal dan status.
 */
export async function getAdminTransactions({
  search = "",
  status = "",
  paymentChannel = "",
  page = 1,
  limit = 10,
} = {}) {
  const skip = (Math.max(1, page) - 1) * limit;

  try {
    const where = {};
    if (status && status !== "ALL") where.status = status;
    if (paymentChannel && paymentChannel !== "ALL") where.paymentChannel = paymentChannel;
    if (search) {
      where.OR = [
        { invoiceId: { contains: search, mode: "insensitive" } },
        { donorName: { contains: search, mode: "insensitive" } },
        { donorEmail: { contains: search, mode: "insensitive" } },
        { donorPhone: { contains: search } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.donation.count({ where }),
      prisma.donation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          campaign: { select: { id: true, title: true, slug: true } },
        },
      }),
    ]);

    return {
      items: items.map((d) => ({
        id: d.id,
        invoiceId: d.invoiceId,
        donorName: d.isAnonymous ? "Hamba Allah" : d.donorName,
        rawDonorName: d.donorName,
        donorEmail: d.donorEmail ? maskEmail(d.donorEmail) : "",
        donorPhone: d.donorPhone,
        donorAvatar: d.donorAvatar || null,
        isAnonymous: Boolean(d.isAnonymous),
        amount: Number(d.amount),
        totalAmount: Number(d.totalAmount),
        paymentChannel: d.paymentChannel,
        status: d.status,
        campaignTitle: d.campaign?.title || "Donasi Umum",
        campaignSlug: d.campaign?.slug || "",
        createdAt: d.createdAt.toISOString(),
        paidAt: d.paidAt ? d.paidAt.toISOString() : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  } catch (error) {
    console.warn("Prisma getAdminTransactions fallback:", error.message);
    const mock = RECENT_TRANSACTIONS.map((t, idx) => ({
      id: `mock-${idx + 1}`,
      invoiceId: t.id,
      donorName: t.donor,
      rawDonorName: t.donor,
      donorEmail: maskEmail(`${t.donor.toLowerCase().replace(/[^a-z0-9]/g, ".")}@gmail.com`),
      donorPhone: "08123456789",
      donorAvatar: null,
      isAnonymous: t.donor === "Hamba Allah",
      amount: t.amount,
      totalAmount: t.amount,
      paymentChannel: t.channel,
      status: t.status === "Sukses" ? "PAID" : "PENDING",
      campaignTitle: t.campaign,
      campaignSlug: "beasiswa-santri",
      createdAt: t.time ? new Date().toISOString() : new Date().toISOString(),
      paidAt: t.status === "Sukses" ? new Date().toISOString() : null,
    }));

    return {
      items: mock.slice(skip, skip + limit),
      pagination: {
        page,
        limit,
        total: mock.length,
        totalPages: Math.ceil(mock.length / limit) || 1,
      },
    };
  }
}

/**
 * Verifikasi transaksi secara atomik (ACID): update status PAID dan increment dana campaign.
 */
export async function verifyAdminTransaction(donationId) {
  return prisma.$transaction(async (tx) => {
    const donation = await tx.donation.findUnique({
      where: { id: donationId },
      include: { campaign: true },
    });

    if (!donation) {
      throw new Error("Transaksi donasi tidak ditemukan.");
    }

    if (donation.status === "PAID") {
      return donation;
    }

    const updatedDonation = await tx.donation.update({
      where: { id: donationId },
      data: {
        status: "PAID",
        paidAt: new Date(),
      },
    });

    // Jika donasi terikat pada campaign tertentu, tambahkan perolehan dana secara atomik
    if (donation.campaignId) {
      await tx.campaign.update({
        where: { id: donation.campaignId },
        data: {
          collectedAmount: { increment: donation.amount },
          donorCount: { increment: 1 },
        },
      });
    }

    return updatedDonation;
  });
}

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

/**
 * Mengambil ringkasan data tren donasi dan penyaluran untuk grafik analitik admin.
 */
export async function getAdminDonationTrends() {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    ninetyDaysAgo.setHours(0, 0, 0, 0);

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const [priorAggregate, paidDonations, disbursements] = await Promise.all([
      prisma.donation.aggregate({
        where: {
          status: "PAID",
          paidAt: { lt: ninetyDaysAgo },
        },
        _sum: { amount: true },
      }),
      prisma.donation.findMany({
        where: {
          status: "PAID",
          paidAt: { gte: twelveMonthsAgo },
        },
        select: {
          amount: true,
          paidAt: true,
          createdAt: true,
        },
        orderBy: { paidAt: "asc" },
      }),
      prisma.campaignUpdate.findMany({
        where: {
          date: { gte: twelveMonthsAgo },
          disbursedAmount: { gt: 0 },
        },
        select: {
          disbursedAmount: true,
          date: true,
        },
        orderBy: { date: "asc" },
      }),
    ]);

    const priorTotal = Number(priorAggregate?._sum?.amount || 0);

    const dailyMap = new Map();
    paidDonations.forEach((d) => {
      const rawDate = d.paidAt || d.createdAt;
      if (!rawDate) return;
      const dObj = rawDate instanceof Date ? rawDate : new Date(rawDate);
      if (dObj >= ninetyDaysAgo) {
        const dateKey = dObj.toISOString().split("T")[0];
        const existing = dailyMap.get(dateKey) || { dailyAmount: 0, donationsCount: 0, disbursedAmount: 0 };
        existing.dailyAmount += Number(d.amount || 0);
        existing.donationsCount += 1;
        dailyMap.set(dateKey, existing);
      }
    });

    disbursements.forEach((u) => {
      if (!u.date) return;
      const dObj = u.date instanceof Date ? u.date : new Date(u.date);
      if (dObj >= ninetyDaysAgo) {
        const dateKey = dObj.toISOString().split("T")[0];
        const existing = dailyMap.get(dateKey) || { dailyAmount: 0, donationsCount: 0, disbursedAmount: 0 };
        existing.disbursedAmount += Number(u.disbursedAmount || 0);
        dailyMap.set(dateKey, existing);
      }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyTrend = [];
    let runningCumulative = priorTotal;
    const cursor = new Date(ninetyDaysAgo);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const fullMonthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];

    while (cursor <= today) {
      const dateKey = cursor.toISOString().split("T")[0];
      const dayData = dailyMap.get(dateKey) || { dailyAmount: 0, donationsCount: 0, disbursedAmount: 0 };
      runningCumulative += dayData.dailyAmount;

      dailyTrend.push({
        date: dateKey,
        label: `${cursor.getDate()} ${monthNames[cursor.getMonth()]}`,
        dailyAmount: dayData.dailyAmount,
        cumulativeAmount: runningCumulative,
        donationsCount: dayData.donationsCount,
        disbursedAmount: dayData.disbursedAmount,
      });

      cursor.setDate(cursor.getDate() + 1);
    }

    const monthlyMap = new Map();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap.set(mKey, {
        key: mKey,
        month: monthNames[d.getMonth()],
        fullMonth: `${fullMonthNames[d.getMonth()]} ${d.getFullYear()}`,
        inflow: 0,
        outflow: 0,
        count: 0,
      });
    }

    paidDonations.forEach((d) => {
      const rawDate = d.paidAt || d.createdAt;
      if (!rawDate) return;
      const dObj = rawDate instanceof Date ? rawDate : new Date(rawDate);
      const mKey = `${dObj.getFullYear()}-${String(dObj.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyMap.has(mKey)) {
        const item = monthlyMap.get(mKey);
        item.inflow += Number(d.amount || 0);
        item.count += 1;
      }
    });

    disbursements.forEach((u) => {
      if (!u.date) return;
      const dObj = u.date instanceof Date ? u.date : new Date(u.date);
      const mKey = `${dObj.getFullYear()}-${String(dObj.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyMap.has(mKey)) {
        const item = monthlyMap.get(mKey);
        item.outflow += Number(u.disbursedAmount || 0);
      }
    });

    const monthlyTrend = Array.from(monthlyMap.values());

    return {
      dailyTrend,
      monthlyTrend,
    };
  } catch (error) {
    console.warn("Prisma getAdminDonationTrends fallback:", error.message);
    return generateFallbackAdminDonationTrends();
  }
}

function generateFallbackAdminDonationTrends() {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const fullMonthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthlyTrend = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const mIdx = d.getMonth();
    const baseInflow = 320000000 + ((mIdx * 37) % 180) * 1000000;
    const baseOutflow = Math.round(baseInflow * 0.82);
    monthlyTrend.push({
      key: `${d.getFullYear()}-${String(mIdx + 1).padStart(2, "0")}`,
      month: monthNames[mIdx],
      fullMonth: `${fullMonthNames[mIdx]} ${d.getFullYear()}`,
      inflow: baseInflow,
      outflow: baseOutflow,
      count: 140 + (mIdx * 12),
    });
  }

  const ninetyDaysAgo = new Date(today);
  ninetyDaysAgo.setDate(today.getDate() - 89);
  const dailyTrend = [];
  let runningCumulative = 2850000000;
  const cursor = new Date(ninetyDaysAgo);

  while (cursor <= today) {
    const day = cursor.getDate();
    const isWeekend = cursor.getDay() === 0 || cursor.getDay() === 5;
    const multiplier = isWeekend ? 1.6 : 1.0;
    const daily = Math.round((12000000 + ((day * 7919) % 25000000)) * multiplier);
    const count = Math.max(3, Math.round(daily / 250000));
    const disbursed = day % 7 === 0 ? Math.round(daily * 1.8) : 0;
    runningCumulative += daily;

    dailyTrend.push({
      date: cursor.toISOString().split("T")[0],
      label: `${day} ${monthNames[cursor.getMonth()]}`,
      dailyAmount: daily,
      cumulativeAmount: runningCumulative,
      donationsCount: count,
      disbursedAmount: disbursed,
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  return { dailyTrend, monthlyTrend };
}

