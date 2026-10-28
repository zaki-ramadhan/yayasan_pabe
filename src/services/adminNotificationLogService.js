import prisma from "@/lib/prisma";

/**
 * Service khusus untuk membaca riwayat dan log pengiriman WhatsApp untuk Admin Dashboard.
 */

/**
 * Mengambil riwayat pengiriman notifikasi dengan filter dan paginasi.
 *
 * @param {object} [params]
 * @param {string} [params.search=""]
 * @param {string} [params.status="ALL"]
 * @param {number} [params.page=1]
 * @param {number} [params.limit=10]
 * @returns {Promise<{ items: Array, total: number, page: number, totalPages: number }>}
 */
export async function getAdminNotificationLogs({
  search = "",
  status = "ALL",
  page = 1,
  limit = 10,
} = {}) {
  const skip = (Math.max(1, page) - 1) * limit;

  const where = {};
  if (status && status !== "ALL") {
    where.status = status;
  }

  if (search && search.trim()) {
    where.OR = [
      { recipientPhone: { contains: search.trim() } },
      { errorMessage: { contains: search.trim(), mode: "insensitive" } },
      { providerMessageId: { contains: search.trim() } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.notificationLog.count({ where }),
    prisma.notificationLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { sentAt: "desc" },
      include: {
        queue: {
          select: {
            type: true,
            attempts: true,
            maxAttempts: true,
            status: true,
          },
        },
      },
    }),
  ]);

  return {
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}
