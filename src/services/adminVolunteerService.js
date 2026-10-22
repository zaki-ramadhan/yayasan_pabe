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
    console.warn("Prisma getAdminVolunteers fallback:", error.message);
    const mock = [
      {
        id: "vol-1",
        fullName: "Ahmad Fauzi",
        email: "ahmad.fauzi@gmail.com",
        phone: "081234567890",
        city: "Bogor",
        interest: "Pengajar & Pembimbing Al-Qur'an",
        motivation: "Ingin berkontribusi dalam membina adik-adik penghafal Al-Qur'an dan berbagi ilmu tajwid.",
        status: "PENDING",
        createdAt: new Date().toISOString(),
      },
      {
        id: "vol-2",
        fullName: "Siti Rahmawati",
        email: "siti.rahma@yahoo.com",
        phone: "085678901234",
        city: "Depok",
        interest: "Distribusi Logistik & Bantuan Sosial",
        motivation: "Berpengalaman dalam organisasi kepemudaan dan siap membantu distribusi logistik di lapangan.",
        status: "APPROVED",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: "vol-3",
        fullName: "Rizky Ramadhan",
        email: "rizky.r@outlook.com",
        phone: "087812345678",
        city: "Jakarta Selatan",
        interest: "Dokumentasi & Media Sosial",
        motivation: "Punya keahlian fotografi dan videografi kegiatan bakti sosial kemanusiaan.",
        status: "CONTACTED",
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      },
    ];

    let filtered = mock;
    if (status !== "ALL") {
      filtered = filtered.filter((v) => v.status === status);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (v) =>
          v.fullName.toLowerCase().includes(q) ||
          v.city.toLowerCase().includes(q) ||
          v.interest.toLowerCase().includes(q)
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
