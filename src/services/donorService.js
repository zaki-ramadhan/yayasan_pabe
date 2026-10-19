import crypto from "crypto";
import prisma from "@/lib/prisma";
import { sanitizeInput } from "@/lib/security";
import { DEMO_USERS } from "@/services/authService";

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  if (!password || !storedHash) return false;
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;
  try {
    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

function buildUserWhereClause(userEmail, userName) {
  const orConditions = [];

  if (userEmail && typeof userEmail === "string") {
    orConditions.push({ donorEmail: { equals: userEmail.trim(), mode: "insensitive" } });
  }

  if (userName && typeof userName === "string") {
    const cleanName = userName.trim();
    orConditions.push({ donorName: { equals: cleanName, mode: "insensitive" } });

    const withoutHonorific = cleanName.replace(/^(H\.|Hj\.|Drs\.|Ust\.|dr\.|Prof\.)\s*/i, "").trim();
    if (withoutHonorific && withoutHonorific !== cleanName) {
      orConditions.push({ donorName: { contains: withoutHonorific, mode: "insensitive" } });
    }
  }

  return orConditions.length > 0 ? { OR: orConditions } : null;
}

export async function getDonorHistory({
  userEmail,
  userName,
  search = "",
  sortBy = "date",
  sortOrder = "desc",
  page = 1,
  limit = 25,
}) {
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const pageLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 25));
  const skip = (currentPage - 1) * pageLimit;
  const normalizedSortOrder = sortOrder === "asc" ? "asc" : "desc";

  const userCondition = buildUserWhereClause(userEmail, userName);
  if (!userCondition) {
    return {
      metrics: {
        totalNominal: 0,
        totalTransactions: 0,
        totalPrograms: 0,
      },
      items: [],
      pagination: {
        total: 0,
        totalPages: 0,
        currentPage,
        limit: pageLimit,
      },
    };
  }

  const basePaidWhere = {
    status: "PAID",
    ...userCondition,
  };

  try {
    const [aggregates, distinctCampaigns] = await Promise.all([
      prisma.donation.aggregate({
        where: basePaidWhere,
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.donation.findMany({
        where: basePaidWhere,
        select: { campaignId: true, donationType: true },
        distinct: ["campaignId", "donationType"],
      }),
    ]);

    const totalNominal = aggregates._sum.amount || 0;
    const totalTransactions = aggregates._count.id || 0;
    const totalPrograms = distinctCampaigns.length;

    const filterConditions = [{ status: "PAID" }, userCondition];

    if (search && typeof search === "string" && search.trim().length > 0) {
      const q = search.trim();
      filterConditions.push({
        OR: [
          { invoiceId: { contains: q, mode: "insensitive" } },
          { donorName: { contains: q, mode: "insensitive" } },
          { paymentChannel: { contains: q, mode: "insensitive" } },
          { campaign: { title: { contains: q, mode: "insensitive" } } },
        ],
      });
    }

    const finalWhere = { AND: filterConditions };

    let orderByClause = { paidAt: normalizedSortOrder };
    if (sortBy === "nominal" || sortBy === "amount") {
      orderByClause = { amount: normalizedSortOrder };
    } else if (sortBy === "program") {
      orderByClause = { campaign: { title: normalizedSortOrder } };
    } else if (sortBy === "payment" || sortBy === "channel") {
      orderByClause = { paymentChannel: normalizedSortOrder };
    } else if (sortBy === "name") {
      orderByClause = { donorName: normalizedSortOrder };
    }

    const [filteredCount, donations] = await Promise.all([
      prisma.donation.count({ where: finalWhere }),
      prisma.donation.findMany({
        where: finalWhere,
        include: {
          campaign: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
        orderBy: orderByClause,
        skip,
        take: pageLimit,
      }),
    ]);

    const items = donations.map((d, index) => {
      const effectiveProgramTitle =
        d.campaign?.title ||
        (d.donationType === "ZAKAT"
          ? "Zakat Penghasilan & Mal"
          : d.donationType === "INFAK_SUBUH"
          ? "Sedekah Subuh Berkah"
          : d.donationType === "WAKAF"
          ? "Wakaf Produktif PABE"
          : "Sedekah Umum PABE");

      return {
        id: d.id,
        no: skip + index + 1,
        invoiceId: d.invoiceId,
        donorName: d.isAnonymous ? "Hamba Allah" : d.donorName,
        amount: d.amount,
        programTitle: effectiveProgramTitle,
        campaignSlug: d.campaign?.slug || "",
        paymentChannel: d.paymentChannel || "QRIS",
        date: (d.paidAt || d.createdAt).toISOString(),
        status: d.status,
      };
    });

    const totalPages = Math.ceil(filteredCount / pageLimit);

    return {
      metrics: {
        totalNominal,
        totalTransactions,
        totalPrograms,
      },
      items,
      pagination: {
        total: filteredCount,
        totalPages,
        currentPage,
        limit: pageLimit,
      },
    };
  } catch (error) {
    console.error("Error getDonorHistory in donorService:", error);
    throw error;
  }
}

export async function getDonorProfile({ userEmail, userId }) {
  if (!userEmail && !userId) {
    throw new Error("Identitas pengguna tidak ditemukan.");
  }

  try {
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(userEmail ? [{ email: userEmail.trim().toLowerCase() }] : []),
          ...(userId ? [{ id: userId }] : []),
        ],
      },
    });

    if (!user && userEmail) {
      const demoMatch = DEMO_USERS.find(
        (u) => u.email.toLowerCase() === userEmail.trim().toLowerCase()
      );

      if (demoMatch) {
        user = await prisma.user.create({
          data: {
            id: demoMatch.id,
            name: demoMatch.name,
            email: demoMatch.email,
            username: demoMatch.username,
            role: demoMatch.role,
            title: demoMatch.title,
            phone: demoMatch.phone,
            avatar: demoMatch.avatar,
            salutation: demoMatch.salutation || "Bpk.",
            bio: "Mewujudkan generasi qur'ani mandiri dan berdaya saing.",
            city: "Bandung",
            address: "Jl. Riau No. 45, Bandung, Jawa Barat",
            coverImage:
              "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80",
            bankName: "BSI (Bank Syariah Indonesia)",
            bankAccount: "7123456789",
            bankAccountName: "Hendra Wijaya",
          },
        });
      }
    }

    if (!user) {
      throw new Error("Pengguna tidak ditemukan di database.");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      title: user.title || "Donatur Terdaftar",
      salutation: user.salutation || "Bpk.",
      phone: user.phone || "",
      avatar: user.avatar || "",
      bio: user.bio || "",
      city: user.city || "",
      address: user.address || "",
      coverImage: user.coverImage || "",
      bankName: user.bankName || "",
      bankAccount: user.bankAccount || "",
      bankAccountName: user.bankAccountName || "",
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Error getDonorProfile in donorService:", error);
    throw error;
  }
}

export async function updateDonorProfile({ userEmail, profileData }) {
  if (!userEmail) {
    throw new Error("Email pengguna diperlukan.");
  }

  const cleanEmail = userEmail.trim().toLowerCase();

  const updatePayload = {};

  if (profileData.salutation !== undefined) {
    updatePayload.salutation = sanitizeInput(profileData.salutation);
  }
  if (profileData.name !== undefined) {
    const cleanName = sanitizeInput(profileData.name);
    if (!cleanName) throw new Error("Nama lengkap tidak boleh kosong.");
    updatePayload.name = cleanName;
  }
  if (profileData.bio !== undefined) {
    updatePayload.bio = sanitizeInput(profileData.bio);
  }
  if (profileData.city !== undefined) {
    updatePayload.city = sanitizeInput(profileData.city);
  }
  if (profileData.address !== undefined) {
    updatePayload.address = sanitizeInput(profileData.address);
  }
  if (profileData.phone !== undefined) {
    updatePayload.phone = sanitizeInput(profileData.phone);
  }
  if (profileData.bankName !== undefined) {
    updatePayload.bankName = sanitizeInput(profileData.bankName);
  }
  if (profileData.bankAccount !== undefined) {
    updatePayload.bankAccount = sanitizeInput(profileData.bankAccount);
  }
  if (profileData.bankAccountName !== undefined) {
    updatePayload.bankAccountName = sanitizeInput(profileData.bankAccountName);
  }
  if (profileData.coverImage !== undefined) {
    updatePayload.coverImage = sanitizeInput(profileData.coverImage);
  }
  if (profileData.avatar !== undefined) {
    updatePayload.avatar = sanitizeInput(profileData.avatar);
  }

  try {
    const updated = await prisma.user.update({
      where: { email: cleanEmail },
      data: updatePayload,
    });

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      username: updated.username,
      role: updated.role,
      title: updated.title,
      salutation: updated.salutation,
      phone: updated.phone,
      avatar: updated.avatar,
      bio: updated.bio,
      city: updated.city,
      address: updated.address,
      coverImage: updated.coverImage,
      bankName: updated.bankName,
      bankAccount: updated.bankAccount,
      bankAccountName: updated.bankAccountName,
      updatedAt: updated.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Error updateDonorProfile in donorService:", error);
    throw error;
  }
}

export async function updateDonorPassword({ userEmail, oldPassword, newPassword }) {
  if (!userEmail) {
    throw new Error("Email pengguna diperlukan.");
  }
  if (!newPassword || newPassword.length < 6) {
    throw new Error("Kata sandi baru minimal 6 karakter.");
  }

  const cleanEmail = userEmail.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });

  if (!user) {
    throw new Error("Pengguna tidak ditemukan.");
  }

  if (user.passwordHash) {
    if (!oldPassword) {
      throw new Error("Kata sandi saat ini wajib diisi untuk mengubah kata sandi.");
    }
    const isValid = verifyPassword(oldPassword, user.passwordHash);
    if (!isValid) {
      throw new Error("Kata sandi saat ini tidak cocok.");
    }
  }

  const newHash = hashPassword(newPassword);

  await prisma.user.update({
    where: { email: cleanEmail },
    data: { passwordHash: newHash },
  });

  return { success: true, message: "Kata sandi berhasil diperbarui." };
}

export async function getDonorDashboardOverview({ userEmail, userName, year }) {
  const currentYear = parseInt(year, 10) || new Date().getFullYear();
  const userCondition = buildUserWhereClause(userEmail, userName);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const defaultMonthly = monthNames.map((m) => ({ month: m, donasi: 0 }));

  if (!userCondition) {
    return {
      metrics: { totalNominal: 0, totalTransactions: 0, totalPrograms: 0 },
      monthlyTrend: defaultMonthly,
      categoryDistribution: [],
      currentMonthAchieved: 0,
      currentMonthTarget: 1000000,
      recentReports: [],
      recentItems: [],
      routineDonations: [],
    };
  }

  const basePaidWhere = {
    status: "PAID",
    AND: [userCondition],
  };

  try {
    const startOfYear = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0));
    const endOfYear = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59, 999));

    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999));

    const [
      aggregates,
      distinctCampaigns,
      donationsInYear,
      allUserDonations,
      monthAggregate,
      recentReportsData,
      recentDonationsData,
      routineDonationsData,
    ] = await Promise.all([
      prisma.donation.aggregate({
        where: {
          status: "PAID",
          AND: [userCondition],
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.donation.findMany({
        where: {
          status: "PAID",
          AND: [userCondition],
        },
        select: { campaignId: true, donationType: true },
        distinct: ["campaignId", "donationType"],
      }),
      prisma.donation.findMany({
        where: {
          status: "PAID",
          AND: [
            userCondition,
            {
              OR: [
                { paidAt: { gte: startOfYear, lte: endOfYear } },
                { AND: [{ paidAt: null }, { createdAt: { gte: startOfYear, lte: endOfYear } }] },
              ],
            },
          ],
        },
        select: { amount: true, paidAt: true, createdAt: true },
      }),
      prisma.donation.findMany({
        where: {
          status: "PAID",
          AND: [userCondition],
        },
        select: {
          amount: true,
          donationType: true,
          campaign: {
            select: {
              title: true,
              category: { select: { name: true } },
            },
          },
        },
      }),
      prisma.donation.aggregate({
        where: {
          status: "PAID",
          AND: [
            userCondition,
            {
              OR: [
                { paidAt: { gte: startOfMonth, lte: endOfMonth } },
                { AND: [{ paidAt: null }, { createdAt: { gte: startOfMonth, lte: endOfMonth } }] },
              ],
            },
          ],
        },
        _sum: { amount: true },
      }),
      prisma.campaignUpdate.findMany({
        where: {
          campaign: {
            donations: {
              some: {
                status: "PAID",
                AND: [userCondition],
              },
            },
          },
        },
        orderBy: { date: "desc" },
        take: 3,
        select: {
          id: true,
          title: true,
          content: true,
          disbursedAmount: true,
          date: true,
          campaign: {
            select: {
              title: true,
              slug: true,
              category: { select: { name: true } },
            },
          },
        },
      }),
      prisma.donation.findMany({
        where: basePaidWhere,
        include: {
          campaign: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
        orderBy: { paidAt: "desc" },
        take: 5,
      }),
      prisma.routineDonation.findMany({
        where: {
          AND: [userCondition],
        },
        include: {
          campaign: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
    ]);

    const totalNominal = aggregates._sum.amount || 0;
    const totalTransactions = aggregates._count.id || 0;
    const totalPrograms = distinctCampaigns.length;

    const monthlyMap = {};
    for (let i = 0; i < 12; i++) monthlyMap[i] = 0;
    donationsInYear.forEach((d) => {
      const dateObj = d.paidAt || d.createdAt;
      if (dateObj) {
        const m = new Date(dateObj).getMonth();
        if (m >= 0 && m < 12) {
          monthlyMap[m] += d.amount;
        }
      }
    });
    const monthlyTrend = monthNames.map((m, idx) => ({
      month: m,
      donasi: monthlyMap[idx],
    }));

    const catMap = {};
    allUserDonations.forEach((d) => {
      let catName = d.campaign?.category?.name || "";
      if (!catName || catName.toUpperCase().includes("ZISWAF")) {
        if (d.donationType === "ZAKAT") catName = "Zakat Maal & Fitrah";
        else if (d.donationType === "INFAK_SUBUH") catName = "Sedekah Subuh";
        else if (d.donationType === "WAKAF") catName = "Wakaf Produktif";
        else catName = "Program Kemanusiaan";
      }
      catMap[catName] = (catMap[catName] || 0) + d.amount;
    });

    const categoryDistribution = Object.entries(catMap)
      .map(([name, value]) => ({
        name,
        value,
        percentage: totalNominal > 0 ? Math.round((value / totalNominal) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value);

    const recentItems = recentDonationsData.map((d, index) => {
      const effectiveProgramTitle =
        d.campaign?.title ||
        (d.donationType === "ZAKAT"
          ? "Zakat Maal & Fitrah"
          : d.donationType === "INFAK_SUBUH"
          ? "Sedekah Subuh"
          : d.donationType === "WAKAF"
          ? "Wakaf Produktif"
          : "Program Kemanusiaan");

      return {
        id: d.id,
        no: index + 1,
        invoiceId: d.invoiceId,
        donorName: d.isAnonymous ? "Hamba Allah" : d.donorName,
        amount: d.amount,
        programTitle: effectiveProgramTitle,
        campaignSlug: d.campaign?.slug || "",
        paymentChannel: d.paymentChannel || "QRIS",
        date: (d.paidAt || d.createdAt).toISOString(),
        status: d.status,
      };
    });

    const recentReports = recentReportsData.map((rep) => ({
      id: rep.id,
      title: rep.title,
      content: rep.content,
      disbursedAmount: rep.disbursedAmount,
      date: rep.date.toISOString(),
      categoryName: rep.campaign?.category?.name || "Program Kebaikan",
      campaignTitle: rep.campaign?.title || "",
      campaignSlug: rep.campaign?.slug || "",
    }));

    const currentMonthAchieved = monthAggregate._sum.amount || 0;
    const currentMonthTarget = 1000000;

    const routineDonations = (routineDonationsData || []).map((r) => ({
      id: r.id,
      programTitle: r.campaign?.title || r.programTitle || "Program Kebaikan Rutin",
      amount: r.amount,
      frequency: r.frequency,
      routineType: r.routineType,
      status: r.status,
      reminderTime: r.reminderTime || "05:00",
      createdAt: r.createdAt.toISOString(),
    }));

    return {
      metrics: {
        totalNominal,
        totalTransactions,
        totalPrograms,
      },
      monthlyTrend,
      categoryDistribution,
      currentMonthAchieved,
      currentMonthTarget,
      recentReports,
      recentItems,
      routineDonations,
    };
  } catch (error) {
    console.error("Error getDonorDashboardOverview:", error);
    throw error;
  }
}

export async function getDonorMonthlyTrend({ userEmail, userName, year }) {
  const currentYear = parseInt(year, 10) || new Date().getFullYear();
  const userCondition = buildUserWhereClause(userEmail, userName);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const defaultMonthly = monthNames.map((m) => ({ month: m, donasi: 0 }));

  if (!userCondition) {
    return { monthlyTrend: defaultMonthly };
  }

  try {
    const startOfYear = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0));
    const endOfYear = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59, 999));

    const donationsInYear = await prisma.donation.findMany({
      where: {
        status: "PAID",
        AND: [
          userCondition,
          {
            OR: [
              { paidAt: { gte: startOfYear, lte: endOfYear } },
              { AND: [{ paidAt: null }, { createdAt: { gte: startOfYear, lte: endOfYear } }] },
            ],
          },
        ],
      },
      select: { amount: true, paidAt: true, createdAt: true },
    });

    const monthlyMap = {};
    for (let i = 0; i < 12; i++) monthlyMap[i] = 0;
    donationsInYear.forEach((d) => {
      const dateObj = d.paidAt || d.createdAt;
      if (dateObj) {
        const m = new Date(dateObj).getMonth();
        if (m >= 0 && m < 12) {
          monthlyMap[m] += d.amount;
        }
      }
    });

    const monthlyTrend = monthNames.map((m, idx) => ({
      month: m,
      donasi: monthlyMap[idx],
    }));

    return { monthlyTrend };
  } catch (error) {
    console.error("Error getDonorMonthlyTrend in donorService:", error);
    throw error;
  }
}

