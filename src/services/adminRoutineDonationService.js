import prisma from "@/lib/prisma";
import { sanitizeInput } from "@/lib/security";

const VALID_STATUSES = ["ACTIVE", "PAUSED", "CANCELLED"];

/**
 * Mengambil daftar komitmen donasi rutin untuk admin dengan filter dan paginasi.
 */
export async function getAdminRoutineDonations({
  search = "",
  status = "ALL",
  frequency = "ALL",
  routineType = "ALL",
  page = 1,
  limit = 10,
} = {}) {
  const skip = (Math.max(1, page) - 1) * limit;

  try {
    const where = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (frequency && frequency !== "ALL") {
      where.frequency = frequency;
    }
    if (routineType && routineType !== "ALL") {
      where.routineType = routineType;
    }
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { donorName: { contains: q, mode: "insensitive" } },
        { donorEmail: { contains: q, mode: "insensitive" } },
        { donorPhone: { contains: q, mode: "insensitive" } },
        { programTitle: { contains: q, mode: "insensitive" } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.routineDonation.count({ where }),
      prisma.routineDonation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
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
    ]);

    return {
      items: items.map((r) => ({
        id: r.id,
        programTitle: r.programTitle,
        campaignId: r.campaignId,
        campaignTitle: r.campaign?.title || null,
        campaignSlug: r.campaign?.slug || null,
        amount: r.amount,
        frequency: r.frequency,
        routineType: r.routineType,
        status: r.status,
        selectedDay: r.selectedDay,
        monthlyDate: r.monthlyDate ? r.monthlyDate.toISOString() : null,
        reminderTime: r.reminderTime || "05:00",
        donorName: r.donorName,
        donorEmail: r.donorEmail,
        donorPhone: r.donorPhone,
        isAnonymous: r.isAnonymous,
        createdAt: r.createdAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  } catch (error) {
    console.warn("Prisma getAdminRoutineDonations fallback:", error.message);
    const mock = [
      {
        id: "rout-1",
        programTitle: "Sedekah Subuh Yatim & Dhuafa",
        campaignId: "camp-1",
        campaignTitle: "Sedekah Subuh Yatim & Dhuafa",
        campaignSlug: "sedekah-subuh-yatim-dhuafa",
        amount: 25000,
        frequency: "DAILY",
        routineType: "AUTO_DONATION",
        status: "ACTIVE",
        selectedDay: null,
        monthlyDate: null,
        reminderTime: "04:30",
        donorName: "Budi Santoso",
        donorEmail: "budi.santoso@gmail.com",
        donorPhone: "081234567891",
        isAnonymous: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "rout-2",
        programTitle: "Beasiswa Tahfidz Qur'an Berasrama",
        campaignId: "camp-2",
        campaignTitle: "Beasiswa Tahfidz Qur'an Berasrama",
        campaignSlug: "beasiswa-tahfidz-quran",
        amount: 150000,
        frequency: "MONTHLY",
        routineType: "REMINDER_ONLY",
        status: "ACTIVE",
        selectedDay: null,
        monthlyDate: new Date(2026, 9, 25).toISOString(),
        reminderTime: "07:00",
        donorName: "Hamba Allah",
        donorEmail: "donatur.dermawan@yahoo.com",
        donorPhone: "085712345678",
        isAnonymous: true,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: "rout-3",
        programTitle: "Pangan & Nutrisi Harian Lansia Dhuafa",
        campaignId: "camp-3",
        campaignTitle: "Pangan & Nutrisi Harian Lansia Dhuafa",
        campaignSlug: "pangan-nutrisi-lansia",
        amount: 50000,
        frequency: "WEEKLY",
        routineType: "AUTO_DONATION",
        status: "PAUSED",
        selectedDay: "Jumat",
        monthlyDate: null,
        reminderTime: "05:00",
        donorName: "Dewi Lestari",
        donorEmail: "dewi.lestari@gmail.com",
        donorPhone: "081987654321",
        isAnonymous: false,
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      },
    ];

    let filtered = mock;
    if (status !== "ALL") {
      filtered = filtered.filter((r) => r.status === status);
    }
    if (frequency !== "ALL") {
      filtered = filtered.filter((r) => r.frequency === frequency);
    }
    if (routineType !== "ALL") {
      filtered = filtered.filter((r) => r.routineType === routineType);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (r) =>
          r.donorName.toLowerCase().includes(q) ||
          r.programTitle.toLowerCase().includes(q) ||
          (r.donorEmail && r.donorEmail.toLowerCase().includes(q))
      );
    }

    return {
      items: filtered.slice(skip, skip + limit),
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit) || 1,
      },
    };
  }
}

/**
 * Memperbarui status komitmen donasi rutin (ACTIVE, PAUSED, CANCELLED).
 */
export async function updateRoutineDonationStatus(id, newStatus) {
  const status = sanitizeInput(newStatus || "").toUpperCase();
  if (!VALID_STATUSES.includes(status)) {
    throw new Error("Status donasi rutin tidak valid.");
  }

  return prisma.routineDonation.update({
    where: { id },
    data: { status },
  });
}

/**
 * Menghapus data komitmen donasi rutin dari database.
 */
export async function deleteRoutineDonation(id) {
  return prisma.routineDonation.delete({
    where: { id },
  });
}
