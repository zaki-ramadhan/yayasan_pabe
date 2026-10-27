import prisma from "@/lib/prisma";
import { maskEmail, maskPhone, sanitizeSearchQuery } from "@/lib/security";

function normalizePhone(phone) {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("62")) return "0" + cleaned.slice(2);
  return cleaned;
}

function normalizeEmail(email) {
  if (!email || typeof email !== "string") return "";
  return email.trim().toLowerCase();
}

/**
 * Mengambil daftar agregasi donatur unik dari donasi dan akun terdaftar.
 */
export async function getAdminDonors({
  search = "",
  page = 1,
  limit = 10,
} = {}) {
  try {
    const [donations, registeredUsers] = await Promise.all([
      prisma.donation.findMany({
        where: { status: "PAID" },
        select: {
          id: true,
          invoiceId: true,
          donorName: true,
          donorEmail: true,
          donorPhone: true,
          donorAvatar: true,
          isAnonymous: true,
          totalAmount: true,
          paidAt: true,
          createdAt: true,
          campaign: { select: { title: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findMany({
        where: { role: "DONOR" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          createdAt: true,
        },
      }),
    ]);

    const donorMap = new Map();

    for (const u of registeredUsers) {
      const email = normalizeEmail(u.email);
      const phone = normalizePhone(u.phone);
      const key = email ? `email:${email}` : phone ? `phone:${phone}` : `uid:${u.id}`;

      donorMap.set(key, {
        id: key,
        name: u.name,
        rawName: u.name,
        email: u.email || null,
        phone: u.phone || "",
        avatar: u.avatar || null,
        totalPaidAmount: 0,
        paidCount: 0,
        lastDonatedAt: null,
        firstDonatedAt: u.createdAt ? u.createdAt.toISOString() : null,
        lastCampaignTitle: "",
      });
    }

    for (const d of donations) {
      const email = normalizeEmail(d.donorEmail);
      const phone = normalizePhone(d.donorPhone);
      const name = d.isAnonymous ? "Hamba Allah" : d.donorName;

      let key = null;
      if (email && donorMap.has(`email:${email}`)) key = `email:${email}`;
      else if (phone && donorMap.has(`phone:${phone}`)) key = `phone:${phone}`;
      else if (email) key = `email:${email}`;
      else if (phone) key = `phone:${phone}`;
      else key = `name:${d.donorName.trim().toLowerCase()}`;

      if (!donorMap.has(key)) {
        donorMap.set(key, {
          id: key,
          name,
          rawName: d.donorName,
          email: d.donorEmail || null,
          phone: d.donorPhone || "",
          avatar: d.donorAvatar || null,
          totalPaidAmount: 0,
          paidCount: 0,
          lastDonatedAt: null,
          firstDonatedAt: null,
          lastCampaignTitle: d.campaign?.title || "Donasi Umum",
        });
      }

      const donor = donorMap.get(key);
      const amount = Number(d.totalAmount || 0);
      donor.totalPaidAmount += amount;
      donor.paidCount += 1;

      const txDate = (d.paidAt || d.createdAt).toISOString();
      if (!donor.lastDonatedAt || new Date(txDate) > new Date(donor.lastDonatedAt)) {
        donor.lastDonatedAt = txDate;
        donor.lastCampaignTitle = d.campaign?.title || "Donasi Umum";
      }
      if (!donor.firstDonatedAt || new Date(txDate) < new Date(donor.firstDonatedAt)) {
        donor.firstDonatedAt = txDate;
      }
      if (!donor.avatar && d.donorAvatar) {
        donor.avatar = d.donorAvatar;
      }
      if (!d.isAnonymous && d.donorName) {
        donor.name = d.donorName;
      }
    }

    let allDonors = Array.from(donorMap.values());

    const cleanSearch = sanitizeSearchQuery(search || "").toLowerCase();
    if (cleanSearch) {
      allDonors = allDonors.filter((d) => {
        const matchName = (d.name || "").toLowerCase().includes(cleanSearch);
        const matchEmail = (d.email || "").toLowerCase().includes(cleanSearch);
        const matchPhone = (d.phone || "").toLowerCase().includes(cleanSearch);
        return matchName || matchEmail || matchPhone;
      });
    }

    allDonors.sort((a, b) => {
      if (b.totalPaidAmount !== a.totalPaidAmount) {
        return b.totalPaidAmount - a.totalPaidAmount;
      }
      return new Date(b.lastDonatedAt || 0) - new Date(a.lastDonatedAt || 0);
    });

    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
    const total = allDonors.length;
    const start = (safePage - 1) * safeLimit;

    return {
      items: allDonors.slice(start, start + safeLimit),
      totalCount: total,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit) || 1,
      },
    };
  } catch (error) {
    console.warn("Prisma getAdminDonors error:", error.message);
    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
    return {
      items: [],
      totalCount: 0,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total: 0,
        totalPages: 1,
      },
    };
  }
}


export async function getAdminDonorDetail({ email, phone, name, page = 1, limit = 8 } = {}) {
  try {
    const cleanEmail = normalizeEmail(email);
    const cleanPhone = normalizePhone(phone);

    const orConditions = [];
    if (cleanEmail) orConditions.push({ donorEmail: { equals: cleanEmail, mode: "insensitive" } });
    if (cleanPhone) orConditions.push({ donorPhone: { contains: cleanPhone } });
    if (name && !cleanEmail && !cleanPhone) {
      orConditions.push({ donorName: { equals: name, mode: "insensitive" } });
    }

    if (orConditions.length === 0) {
      return {
        donations: [],
        pagination: { page: 1, limit, totalCount: 0, hasMore: false },
      };
    }

    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.max(1, Math.min(50, parseInt(limit, 10) || 8));
    const skip = (safePage - 1) * safeLimit;

    const [totalCount, donations] = await Promise.all([
      prisma.donation.count({
        where: { OR: orConditions },
      }),
      prisma.donation.findMany({
        where: { OR: orConditions },
        orderBy: { createdAt: "desc" },
        skip,
        take: safeLimit,
        include: {
          campaign: { select: { title: true, slug: true } },
        },
      }),
    ]);

    return {
      donations: donations.map((d) => ({
        id: d.id,
        invoiceId: d.invoiceId,
        amount: Number(d.amount),
        totalAmount: Number(d.totalAmount),
        status: d.status,
        paymentChannel: d.paymentChannel,
        campaignTitle: d.campaign?.title || "Donasi Umum",
        isAnonymous: Boolean(d.isAnonymous),
        createdAt: d.createdAt.toISOString(),
        paidAt: d.paidAt ? d.paidAt.toISOString() : null,
      })),
      pagination: {
        page: safePage,
        limit: safeLimit,
        totalCount,
        hasMore: skip + donations.length < totalCount,
      },
    };
  } catch (error) {
    console.warn("Prisma getAdminDonorDetail error:", error.message);
    return {
      donations: [],
      pagination: { page: 1, limit: 8, totalCount: 0, hasMore: false },
    };
  }
}

