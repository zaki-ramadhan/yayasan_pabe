import prisma from "@/lib/prisma";
import { sanitizeInput } from "@/lib/security";
import { VALID_ROUTINE_STATUSES } from "@/lib/routineDonationConstants";

const VALID_STATUSES = VALID_ROUTINE_STATUSES;

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
    // Update nomor testing ke donatur Dewi Lestari jika belum diset
    await prisma.routineDonation.updateMany({
      where: {
        donorName: { contains: "Dewi", mode: "insensitive" },
        donorPhone: { not: "081214772370" },
      },
      data: { donorPhone: "081214772370" },
    }).catch(() => {});

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
    console.error("Error fetching admin routine donations:", error);
    return {
      items: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 1,
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
