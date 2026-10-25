import prisma from "@/lib/prisma";
import { sanitizeInput } from "@/lib/security";

const VALID_STATUSES = ["PENDING", "APPROVED", "CONTACTED", "REJECTED"];

/**
 * Mengambil daftar pendaftar relawan dengan paginasi dan filter pencarian.
 */
export async function getAdminVolunteers({
  search = "",
  status = "ALL",
  page = 1,
  limit = 10,
} = {}) {
  const skip = (Math.max(1, page) - 1) * limit;

  try {
    const where = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { fullName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
        { interest: { contains: q, mode: "insensitive" } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.volunteer.count({ where }),
      prisma.volunteer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      items: items.map((v) => ({
        id: v.id,
        fullName: v.fullName,
        email: v.email,
        phone: v.phone,
        city: v.city,
        interest: v.interest,
        motivation: v.motivation,
        status: v.status,
        createdAt: v.createdAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  } catch (error) {
    console.warn("Prisma getAdminVolunteers error:", error.message);
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
 * Memperbarui status pendaftar relawan (PENDING, APPROVED, CONTACTED, REJECTED).
 */
export async function updateVolunteerStatus(id, newStatus) {
  const status = sanitizeInput(newStatus || "").toUpperCase();
  if (!VALID_STATUSES.includes(status)) {
    throw new Error("Status pendaftar relawan tidak valid.");
  }

  return prisma.volunteer.update({
    where: { id },
    data: { status },
  });
}

/**
 * Menghapus data pendaftar relawan dari database.
 */
export async function deleteVolunteer(id) {
  return prisma.volunteer.delete({
    where: { id },
  });
}
