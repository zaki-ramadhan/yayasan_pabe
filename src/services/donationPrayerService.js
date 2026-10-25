import prisma from "@/lib/prisma";
import { sanitizePrayer } from "@/lib/security";

/**
 * Memperbarui doa atau pesan donatur setelah pembayaran invoice terverifikasi
 */
export async function updateDonationPrayer({ invoiceId, prayer, isAnonymous }) {
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
      throw new Error("Transaksi donasi tidak ditemukan.");
    }

    const updatePayload = {
      prayer: cleanPrayer,
    };

    if (typeof isAnonymous === "boolean") {
      updatePayload.isAnonymous = isAnonymous;
      if (isAnonymous) {
        updatePayload.donorName = "Hamba Allah";
      }
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
      donorName: updatedDb.donorName,
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
 * Mengambil daftar transaksi donasi terkini untuk widget publik
 */
export async function getRecentDonations(limit = 10) {
  try {
    const dbDonations = await prisma.donation.findMany({
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
      id: d.invoiceId,
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
