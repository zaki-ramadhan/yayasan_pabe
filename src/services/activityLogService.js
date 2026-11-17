import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/rateLimit";

export { getClientIp };

/**
 * Mencatat aktivitas audit internal yayasan secara terstandar ke database.
 * Bersifat fail-safe agar kegagalan log tidak mengganggu jalannya transaksi bisnis utama.
 *
 * @param {object} params
 * @param {string} [params.userId]
 * @param {string} [params.userName]
 * @param {string} [params.userRole]
 * @param {string} params.action - Nama aksi (contoh: CREATE_PROGRAM, UPDATE_ARTICLE, APPROVE_LPJ)
 * @param {string} [params.targetType] - Jenis entitas (contoh: Campaign, Article, Volunteer)
 * @param {string} [params.targetId] - ID entitas yang dimutasi
 * @param {string} [params.description] - Penjelasan detail mutasi
 * @param {Request} [params.request] - Objek request untuk ekstraksi IP otomatis
 * @param {string} [params.ipAddress] - IP manual jika tidak membawa objek request
 * @returns {Promise<object|null>}
 */
export async function logActivity({
  userId = null,
  userName = null,
  userRole = null,
  action,
  targetType = null,
  targetId = null,
  description = null,
  request = null,
  ipAddress = null,
}) {
  if (!action) return null;

  try {
    const resolvedIp = ipAddress || getClientIp(request);

    return await prisma.activityLog.create({
      data: {
        userId,
        userName,
        userRole,
        action,
        targetType,
        targetId,
        description,
        ipAddress: resolvedIp,
      },
    });
  } catch (error) {
    console.error("[ActivityLog] Gagal menyimpan log aktivitas:", error.message);
    return null;
  }
}
