import { formatVolunteerId } from "@/lib/volunteerUtils";
import {
  sendVolunteerApprovedEmail,
  sendVolunteerRejectionEmail,
} from "@/services/emailService";
import prisma from "@/lib/prisma";
import { sanitizeInput } from "@/lib/security";
import { shouldSendStatusEmail, resetStatusEmailCooldown } from "@/lib/emailDispatchGuard";

const VALID_STATUSES = ["PENDING", "APPROVED", "REJECTED"];

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

    const rawEmails = items.map((v) => v.email?.trim().toLowerCase()).filter(Boolean);
    const uniqueEmails = Array.from(new Set(rawEmails));
    const userMap = new Map();

    if (uniqueEmails.length > 0) {
      try {
        const users = await prisma.user.findMany({
          where: { email: { in: uniqueEmails, mode: "insensitive" } },
          select: { email: true, avatar: true, customAvatar: true, providerAvatar: true },
        });
        for (const u of users) {
          if (u.email) {
            userMap.set(
              u.email.toLowerCase(),
              u.avatar || u.customAvatar || u.providerAvatar || null
            );
          }
        }
      } catch (userErr) {
        console.warn("Prisma user avatar lookup fallback:", userErr?.message);
      }
    }

    return {
      items: items.map((v) => {
        const cleanEmail = v.email?.trim().toLowerCase();
        return {
          id: v.id,
          fullName: v.fullName,
          email: v.email,
          phone: v.phone,
          city: v.city,
          interest: v.interest,
          motivation: v.motivation,
          status: v.status,
          avatarUrl: cleanEmail ? userMap.get(cleanEmail) || null : null,
          createdAt: v.createdAt.toISOString(),
        };
      }),
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

  const existing = await prisma.volunteer.findUnique({
    where: { id },
  });
  if (!existing) {
    throw new Error("Data pendaftar relawan tidak ditemukan.");
  }

  if (existing.status === status) {
    return existing;
  }

  const updated = await prisma.volunteer.update({
    where: { id },
    data: { status },
  });

  if (status === "APPROVED" && updated?.email && shouldSendStatusEmail(updated.email, "APPROVED")) {
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
      resetStatusEmailCooldown(updated.email, "APPROVED");
      console.warn("Gagal mengirim email persetujuan relawan:", emailErr?.message);
    }
  } else if (status === "REJECTED" && updated?.email && shouldSendStatusEmail(updated.email, "REJECTED")) {
    try {
      await sendVolunteerRejectionEmail({
        to: updated.email,
        name: updated.fullName,
        interest: updated.interest,
      });
    } catch (emailErr) {
      resetStatusEmailCooldown(updated.email, "REJECTED");
      console.warn("Gagal mengirim email penolakan relawan:", emailErr?.message);
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
      const eligible = volunteers.filter((v) => shouldSendStatusEmail(v.email, "APPROVED"));
      const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://payungberkah.org").replace(/\/+$/, "");
      await Promise.allSettled(
        eligible.map(async (v) => {
          try {
            await sendVolunteerApprovedEmail({
              to: v.email,
              name: v.fullName,
              volunteerId: formatVolunteerId(v.id, v.createdAt),
              validationUrl: `${appUrl}/relawan/validasi/${v.id}`,
            });
          } catch (err) {
            resetStatusEmailCooldown(v.email, "APPROVED");
            throw err;
          }
        })
      );
    } catch (batchEmailErr) {
      console.warn("Gagal mengirim email persetujuan relawan batch:", batchEmailErr?.message);
    }
  } else if (status === "REJECTED") {
    try {
      const volunteers = await prisma.volunteer.findMany({
        where: { id: { in: ids }, email: { not: null } },
        select: { id: true, fullName: true, email: true, interest: true },
      });
      const eligible = volunteers.filter((v) => shouldSendStatusEmail(v.email, "REJECTED"));
      await Promise.allSettled(
        eligible.map(async (v) => {
          try {
            await sendVolunteerRejectionEmail({
              to: v.email,
              name: v.fullName,
              interest: v.interest,
            });
          } catch (err) {
            resetStatusEmailCooldown(v.email, "REJECTED");
            throw err;
          }
        })
      );
    } catch (batchEmailErr) {
      console.warn("Gagal mengirim email penolakan relawan batch:", batchEmailErr?.message);
    }
  }

  return { count: result.count, status };
}
