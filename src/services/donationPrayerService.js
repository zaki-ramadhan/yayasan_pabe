import prisma from "@/lib/prisma";
import { sanitizePrayer } from "@/lib/security";
import { verifyDonationOwnership } from "@/lib/requestOwnership";

/**
 * Memperbarui doa atau pesan donatur setelah pembayaran invoice terverifikasi.
 * Wajib memverifikasi kepemilikan (token invoice, sesi pemilik, atau staf) jika request/token disertakan.
 */
export async function updateDonationPrayer({
  invoiceId,
  prayer,
  isAnonymous,
  request = null,
  accessToken = null,
  sessionUser = null,
  requireOwnership = false,
}) {
  if (!invoiceId) {
    throw new Error("Nomor invoice diperlukan.");
  }

  const cleanPrayer = sanitizePrayer(prayer);
  if (!cleanPrayer) {
    throw new Error("Pesan doa tidak boleh kosong.");
  }

  try {
    const existingDb = await prisma.donation.findUnique({
      where: { invoiceId },
      include: { campaign: true },
    });

    if (!existingDb) {
      const notFoundErr = new Error("Transaksi donasi tidak ditemukan.");
      notFoundErr.statusCode = 404;
      throw notFoundErr;
    }

    if (requireOwnership || request || accessToken || sessionUser) {
      const ownership = await verifyDonationOwnership({
        request,
        donation: existingDb,
        providedToken: accessToken,
        sessionUser,
      });

      if (!ownership.authorized) {
        const forbiddenErr = new Error("Akses tidak sah untuk mengubah doa pada invoice ini.");
        forbiddenErr.statusCode = 403;
        throw forbiddenErr;
      }
    }

    if (existingDb.status !== "PAID") {
      const statusErr = new Error("Doa hanya dapat diperbarui setelah pembayaran donasi berstatus lunas.");
      statusErr.statusCode = 400;
      throw statusErr;
    }

    const updatePayload = {
      prayer: cleanPrayer,
    };

    if (typeof isAnonymous === "boolean") {
      updatePayload.isAnonymous = isAnonymous;
    }

    const updatedDb = await prisma.donation.update({
      where: { invoiceId },
      data: updatePayload,
      include: { campaign: true },
    });

    return {
      id: updatedDb.id,
      invoiceId: updatedDb.invoiceId,
      campaignId: updatedDb.campaignId,
      campaignTitle: updatedDb.campaign?.title || "Sedekah Umum PABE",
      campaignSlug: updatedDb.campaign?.slug || "",
      amount: updatedDb.amount,
      donorName: updatedDb.isAnonymous ? "Hamba Allah" : updatedDb.donorName,
      isAnonymous: updatedDb.isAnonymous,
      prayer: updatedDb.prayer,
      status: updatedDb.status,
    };
  } catch (error) {
    console.error("Prisma updateDonationPrayer error:", error);
    throw error;
  }
}

/**
 * Mengambil daftar transaksi donasi terkini untuk widget publik (tanpa membocorkan invoiceId).
 */
export async function getRecentDonations(limit = 10) {
  try {
    const dbDonations = await prisma.donation.findMany({
      where: { status: "PAID" },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        campaign: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
    });

    return dbDonations.map((d) => ({
      id: d.id,
      donor: d.isAnonymous ? "Hamba Allah" : d.donorName,
      amount: d.amount,
      channel: (d.paymentChannel || "qris").toUpperCase(),
      date: d.createdAt.toISOString(),
      status: d.status,
      campaignTitle: d.campaign?.title || "Sedekah Umum PABE",
    }));
  } catch (error) {
    console.error("Prisma getRecentDonations error:", error);
    return [];
  }
}
