import prisma from "@/lib/prisma";
import { RECENT_TRANSACTIONS } from "@/data/adminMockData";
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
    console.warn("Prisma getAdminDonors fallback:", error.message);
    return getMockAdminDonors({ search, page, limit });
  }
}

function getMockAdminDonors({ search = "", page = 1, limit = 10 } = {}) {
  const mockDonors = [
    {
      id: "donor-1",
      name: "Ahmad Fauzi",
      rawName: "Ahmad Fauzi",
      email: "ahmad.fauzi@example.com",
      phone: "081298765432",
      avatar: null,
      totalPaidAmount: 3750000,
      paidCount: 8,
      lastDonatedAt: "2026-09-17T14:30:00Z",
      firstDonatedAt: "2026-01-10T10:00:00Z",
      lastCampaignTitle: "Beasiswa Santri Penghafal Quran",
    },
    {
      id: "donor-2",
      name: "H. Hendra Wijaya",
      rawName: "H. Hendra Wijaya",
      email: "hendra.wijaya@example.com",
      phone: "081311223344",
      avatar: null,
      totalPaidAmount: 5500000,
      paidCount: 5,
      lastDonatedAt: "2026-09-17T10:00:00Z",
      firstDonatedAt: "2026-02-15T09:30:00Z",
      lastCampaignTitle: "Zakat Penghasilan Mustahik",
    },
    {
      id: "donor-3",
      name: "Keluarga Bpk. Sukardi",
      rawName: "Keluarga Bpk. Sukardi",
      email: "keluarga.sukardi@example.com",
      phone: "081755667788",
      avatar: null,
      totalPaidAmount: 1800000,
      paidCount: 3,
      lastDonatedAt: "2026-09-17T08:10:00Z",
      firstDonatedAt: "2026-05-01T11:00:00Z",
      lastCampaignTitle: "Sedekah Beras Pesantren",
    },
    {
      id: "donor-4",
      name: "Siti Rahma",
      rawName: "Siti Rahma",
      email: "siti.rahma@example.com",
      phone: "085612349876",
      avatar: null,
      totalPaidAmount: 450000,
      paidCount: 3,
      lastDonatedAt: "2026-09-17T11:45:00Z",
      firstDonatedAt: "2026-07-20T08:00:00Z",
      lastCampaignTitle: "Sedekah Subuh Beras",
    },
    {
      id: "donor-5",
      name: "Hamba Allah",
      rawName: "Hamba Allah",
      email: null,
      phone: "081288776655",
      avatar: null,
      totalPaidAmount: 550000,
      paidCount: 2,
      lastDonatedAt: "2026-09-17T13:15:00Z",
      firstDonatedAt: "2026-08-01T15:20:00Z",
      lastCampaignTitle: "Tanggap Darurat Banjir",
    },
  ];

  const cleanSearch = (search || "").toLowerCase().trim();
  const filtered = cleanSearch
    ? mockDonors.filter(
        (d) =>
          d.name.toLowerCase().includes(cleanSearch) ||
          (d.email && d.email.toLowerCase().includes(cleanSearch)) ||
          (d.phone && d.phone.includes(cleanSearch))
      )
    : mockDonors;

  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
  const start = (safePage - 1) * safeLimit;

  return {
    items: filtered.slice(start, start + safeLimit),
    totalCount: filtered.length,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / safeLimit) || 1,
    },
  };
}

export async function getAdminDonorDetail({ email, phone, name } = {}) {
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
      return { donations: [] };
    }

    const donations = await prisma.donation.findMany({
      where: { OR: orConditions },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        campaign: { select: { title: true, slug: true } },
      },
    });

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
    };
  } catch (error) {
    console.warn("Prisma getAdminDonorDetail fallback:", error.message);
    return {
      donations: [
        {
          id: "mock-tx-1",
          invoiceId: "INV-891023",
          amount: 250000,
          totalAmount: 250000,
          status: "PAID",
          paymentChannel: "BCA VA",
          campaignTitle: "Beasiswa Santri Penghafal Quran",
          isAnonymous: false,
          createdAt: "2026-09-17T14:30:00Z",
          paidAt: "2026-09-17T14:35:00Z",
        },
      ],
    };
  }
}
