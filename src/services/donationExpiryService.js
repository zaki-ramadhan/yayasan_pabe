import prisma from "@/lib/prisma";
import {
  checkMidtransOrderStatus,
  expireMidtransOrder,
} from "@/services/midtransService";
import { settleDonationStatus, buildAdminDonationEventPayload } from "@/services/donationService";
import { getMidtransServerKey } from "@/lib/midtransConfig";
import { DONATION_STATUS } from "@/lib/donationExpiryConstants";
import { buildUserWhereClause } from "@/services/donorAnalyticsHelper";
import { broadcastAdminEvent } from "@/lib/sseBroadcast";

/**
 * Service khusus pengelolaan siklus kedaluwarsa donasi (Expiry & Active Invoices).
 * Mematuhi Single Responsibility Principle (SRP) dan arsitektur database ACID.
 */

/**
 * Menandai satu donasi berstatus PENDING menjadi EXPIRED secara atomik.
 * @param {string} invoiceId
 * @param {string} [reason="EXPIRED_BY_SYSTEM"]
 * @returns {Promise<object|null>}
 */
export async function expireDonationRecord(invoiceId, reason = "EXPIRED_BY_SYSTEM") {
  if (!invoiceId) return null;

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.donation.findUnique({
        where: { invoiceId },
        select: { id: true, status: true, invoiceId: true },
      });

      // Hanya ubah jika masih PENDING (mencegah overwrite transaksi PAID)
      if (!existing || existing.status !== DONATION_STATUS.PENDING) {
        return null;
      }

      return await tx.donation.update({
        where: { invoiceId },
        data: {
          status: DONATION_STATUS.EXPIRED,
        },
        include: {
          campaign: { select: { id: true, title: true, slug: true } },
        },
      });
    });

    if (updated) {
      try {
        broadcastAdminEvent("DONATION_UPDATED", buildAdminDonationEventPayload(updated));
      } catch (sseErr) {
        console.warn("Peringatan: Gagal broadcast SSE DONATION_UPDATED saat expireDonationRecord:", sseErr?.message);
      }

      if (getMidtransServerKey() && process.env.NODE_ENV !== "test") {
        expireMidtransOrder(invoiceId).catch((err) => {
          console.warn("Midtrans background expire warning for", invoiceId, err?.message);
        });
      }
    }

    return updated;
  } catch (error) {
    console.error("Gagal mengubah status donasi ke EXPIRED:", error);
    return null;
  }
}

/**
 * Mengambil daftar invoice donasi PENDING yang masih aktif milik donatur.
 * Dilengkapi auto-reconcile jika ada invoice yang sudah melewati batas waktu saat diambil.
 *
 * @param {object} params
 * @param {string} [params.userEmail]
 * @param {string} [params.userName]
 * @param {string} [params.campaignId]
 * @param {number} [params.limit=5]
 * @returns {Promise<Array<object>>}
 */
export async function getPendingInvoicesForUser({
  userEmail = "",
  userName = "",
  userPhone = "",
  campaignId = null,
  limit = 5,
}) {
  const identityFilter = buildUserWhereClause(userEmail, userName, userPhone);

  if (!identityFilter) {
    return [];
  }

  const where = {
    status: DONATION_STATUS.PENDING,
    ...identityFilter,
    ...(campaignId ? { campaignId } : {}),
  };

  try {
    const candidateInvoices = await prisma.donation.findMany({
      where,
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            slug: true,
            bannerUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: Math.min(20, Math.max(1, limit * 2)),
    });

    const now = new Date();
    const activeInvoices = [];

    for (const item of candidateInvoices) {
      const isPastExpiry = item.expiredAt && new Date(item.expiredAt) <= now;

      // Jika sudah melewati batas waktu, lakukan pengecekan langsung ke Midtrans sebelum ditandai kedaluwarsa
      if (isPastExpiry) {
        if (getMidtransServerKey() && process.env.NODE_ENV !== "test") {
          try {
            const midtransStatus = await checkMidtransOrderStatus(item.invoiceId);
            if (midtransStatus.isPaid) {
              await settleDonationStatus(
                item.invoiceId,
                midtransStatus.settlementTime ? new Date(midtransStatus.settlementTime) : now
              );
              continue; // Sudah lunas, jangan masukkan ke daftar tagihan tertunda
            }
          } catch (reconcileErr) {
            console.warn("Reconcile error for candidate invoice:", reconcileErr?.message);
          }
        }

        // Tandai sebagai EXPIRED di database
        await expireDonationRecord(item.invoiceId, "EXPIRED_ON_READ");
        continue;
      }

      // Masih aktif dalam batas waktu
      const remainingMs = Math.max(0, new Date(item.expiredAt).getTime() - now.getTime());
      const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
      const remainingHours = Math.floor(remainingMinutes / 60);

      activeInvoices.push({
        id: item.id,
        invoiceId: item.invoiceId,
        accessToken: item.accessToken,
        amount: item.amount,
        totalAmount: item.totalAmount,
        paymentChannel: item.paymentChannel,
        createdAt: item.createdAt,
        expiredAt: item.expiredAt,
        campaignId: item.campaignId,
        campaignTitle: item.campaign?.title || "Donasi Kebaikan",
        campaignSlug: item.campaign?.slug || "",
        campaignBannerUrl: item.campaign?.bannerUrl || null,
        remainingMinutes,
        remainingHours,
        remainingLabel:
          remainingHours > 0
            ? `${remainingHours} jam ${remainingMinutes % 60} menit`
            : `${remainingMinutes} menit`,
      });

      if (activeInvoices.length >= limit) {
        break;
      }
    }

    return activeInvoices;
  } catch (error) {
    console.error("Gagal memuat invoice pending donatur:", error);
    return [];
  }
}

/**
 * Membatalkan tagihan lama milik donatur (misal saat memilih buat donasi baru).
 * Melindungi dari IDOR dengan memverifikasi kepemilikan email/nama donatur.
 *
 * @param {string} invoiceId
 * @param {object} authUser
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function cancelAndExpirePendingDonation(invoiceId, authUser) {
  if (!invoiceId) {
    return { success: false, message: "Nomor invoice tidak valid." };
  }

  try {
    const donation = await prisma.donation.findUnique({
      where: { invoiceId },
      include: {
        campaign: { select: { id: true, title: true, slug: true } },
      },
    });

    if (!donation) {
      return { success: false, message: "Data donasi tidak ditemukan." };
    }

    // Verifikasi kepemilikan ketat (Anti-IDOR & Zero Trust)
    const isAdmin = authUser?.role && authUser.role !== "DONOR";
    const hasDonationEmail = Boolean(donation.donorEmail);
    const matchesEmail =
      authUser?.email &&
      hasDonationEmail &&
      authUser.email.toLowerCase() === donation.donorEmail.toLowerCase();
    const matchesNameOnly =
      !hasDonationEmail &&
      authUser?.name &&
      donation.donorName &&
      authUser.name.toLowerCase() === donation.donorName.toLowerCase();

    if (!isAdmin && !matchesEmail && !matchesNameOnly) {
      return { success: false, message: "Anda tidak berhak membatalkan tagihan ini." };
    }

    if (donation.status === DONATION_STATUS.PAID) {
      return { success: false, message: "Donasi yang sudah terbayar tidak dapat dibatalkan." };
    }

    // Mutasi atomik status PENDING -> CANCELLED (mencegah menimpa transaksi yang baru saja dibayar)
    const result = await prisma.donation.updateMany({
      where: { invoiceId, status: DONATION_STATUS.PENDING },
      data: { status: DONATION_STATUS.CANCELLED },
    });

    if (result.count === 0) {
      return {
        success: false,
        message: "Tagihan tidak dapat dibatalkan (sudah terbayar atau status telah berubah).",
      };
    }

    try {
      broadcastAdminEvent(
        "DONATION_UPDATED",
        buildAdminDonationEventPayload({ ...donation, status: DONATION_STATUS.CANCELLED })
      );
    } catch (sseErr) {
      console.warn("Peringatan: Gagal broadcast SSE DONATION_UPDATED saat cancelAndExpirePendingDonation:", sseErr?.message);
    }

    if (getMidtransServerKey() && process.env.NODE_ENV !== "test") {
      expireMidtransOrder(invoiceId).catch((err) => {
        console.warn("Midtrans cancel expire warning for", invoiceId, err?.message);
      });
    }

    return {
      success: true,
      message: "Tagihan donasi sebelumnya berhasil dibatalkan.",
      data: { invoiceId, status: DONATION_STATUS.CANCELLED },
    };
  } catch (error) {
    console.error("Gagal membatalkan tagihan donasi:", error);
    return { success: false, message: error.message || "Gagal membatalkan tagihan." };
  }
}

/**
 * Background cron job worker:
 * Memindai semua donasi PENDING yang sudah melewati batas waktu (expiredAt <= now),
 * merekonsiliasi dengan Midtrans (jika settled di detik terakhir, tandai PAID),
 * dan meng-expire transaksi yang tidak terbayar.
 *
 * @param {number} [batchLimit=50]
 * @returns {Promise<{ success: boolean, processedCount: number, expiredCount: number, settledCount: number }>}
 */
export async function expireStalePendingDonations(batchLimit = 50) {
  const now = new Date();
  const safeLimit = Math.min(100, Math.max(1, batchLimit));

  let processedCount = 0;
  let expiredCount = 0;
  let settledCount = 0;

  try {
    const staleInvoices = await prisma.donation.findMany({
      where: {
        status: DONATION_STATUS.PENDING,
        expiredAt: { lte: now },
      },
      select: {
        id: true,
        invoiceId: true,
        amount: true,
        paymentChannel: true,
        expiredAt: true,
      },
      take: safeLimit,
      orderBy: { expiredAt: "asc" },
    });

    processedCount = staleInvoices.length;

    for (const item of staleInvoices) {
      let isSettled = false;

      // 1. Cek status ke Midtrans terlebih dahulu jika server key aktif
      if (getMidtransServerKey() && process.env.NODE_ENV !== "test") {
        try {
          const midtransStatus = await checkMidtransOrderStatus(item.invoiceId);
          if (midtransStatus.isPaid) {
            await settleDonationStatus(
              item.invoiceId,
              midtransStatus.settlementTime ? new Date(midtransStatus.settlementTime) : now
            );
            settledCount++;
            isSettled = true;
          }
        } catch (err) {
          console.warn("Cron checkMidtransOrderStatus error for", item.invoiceId, err?.message);
        }
      }

      // 2. Jika belum terbayar, tandai EXPIRED di database & panggil expire di Midtrans
      if (!isSettled) {
        await expireDonationRecord(item.invoiceId, "CRON_EXPIRATION");
        expiredCount++;
      }
    }

    return {
      success: true,
      processedCount,
      expiredCount,
      settledCount,
    };
  } catch (error) {
    console.error("Gagal mengeksekusi expireStalePendingDonations:", error);
    return {
      success: false,
      message: error.message || "Gagal memproses kedaluwarsa donasi.",
      processedCount,
      expiredCount,
      settledCount,
    };
  }
}
