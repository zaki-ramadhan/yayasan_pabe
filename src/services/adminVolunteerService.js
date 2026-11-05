import { formatVolunteerId } from "@/lib/volunteerUtils";
import { sendVolunteerApprovedEmail } from "@/services/emailService";
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

  const updated = await prisma.volunteer.update({
    where: { id },
    data: { status },
  });

  if (status === "APPROVED" && updated?.email) {
    try {
      const formattedId = formatVolunteerId(updated.id, updated.createdAt);
      const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://payungberkah.org").replace(/\/+$/, "");
      await sendVolunteerApprovedEmail({
        to: updated.email,
        name: updated.fullName,
        volunteerId: formattedId,
        validationUrl: `${appUrl}/relawan/validasi/${updated.id}`,
      });
    } catch (emailErr) {
      console.warn("Gagal mengirim email persetujuan relawan:", emailErr?.message);
    }
  }

  return updated;
}

/**
 * Menghapus data pendaftar relawan dari database.
 */
export async function deleteVolunteer(id) {
  return prisma.volunteer.delete({
    where: { id },
  });
}

/**
 * Menghapus banyak data pendaftar relawan sekaligus dari database.
 */
export async function deleteVolunteersBatch(ids) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("Daftar ID relawan tidak boleh kosong.");
  }
  const result = await prisma.volunteer.deleteMany({
    where: { id: { in: ids } },
  });
  return { count: result.count };
}

/**
 * Memperbarui status banyak relawan sekaligus (misal APPROVED / REJECTED).
 */
export async function updateVolunteersStatusBatch(ids, newStatus) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("Daftar ID relawan tidak boleh kosong.");
  }
  const status = sanitizeInput(newStatus || "").toUpperCase();
  if (!VALID_STATUSES.includes(status)) {
    throw new Error("Status pendaftar relawan tidak valid.");
  }

  const result = await prisma.volunteer.updateMany({
    where: { id: { in: ids } },
    data: { status },
  });

  if (status === "APPROVED") {
    try {
      const volunteers = await prisma.volunteer.findMany({
        where: { id: { in: ids }, email: { not: null } },
        select: { id: true, fullName: true, email: true, createdAt: true },
      });
      const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://payungberkah.org").replace(/\/+$/, "");
      await Promise.allSettled(
        volunteers.map((v) =>
          sendVolunteerApprovedEmail({
            to: v.email,
            name: v.fullName,
            volunteerId: formatVolunteerId(v.id, v.createdAt),
            validationUrl: `${appUrl}/relawan/validasi/${v.id}`,
          })
        )
      );
    } catch (batchEmailErr) {
      console.warn("Gagal mengirim email persetujuan relawan batch:", batchEmailErr?.message);
    }
  }

  return { count: result.count, status };
}
