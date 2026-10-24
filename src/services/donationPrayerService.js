import prisma from "@/lib/prisma";
import { sanitizePrayer } from "@/lib/security";

/**
 * Memperbarui doa atau pesan donatur setelah pembayaran invoice terverifikasi
 */
export async function updateDonationPrayer({ invoiceId, prayer, isAnonymous, donationStore }) {
  if (!invoiceId) {
    throw new Error("Nomor invoice diperlukan.");
  }

  const cleanPrayer = sanitizePrayer(prayer);
  if (!cleanPrayer) {
    throw new Error("Pesan doa tidak boleh kosong.");
  }

  let updatedData = null;

  try {
    const existingDb = await prisma.donation.findUnique({
      where: { invoiceId },
      include: { campaign: true },
    });

    if (existingDb) {
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

      updatedData = {
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
    }
  } catch (error) {
    console.warn("Prisma updateDonationPrayer fallback:", error.message);
  }

  if (donationStore) {
    const cached = donationStore.get(invoiceId);
    if (cached) {
      cached.prayer = cleanPrayer;
      if (typeof isAnonymous === "boolean") {
        cached.isAnonymous = isAnonymous;
        if (isAnonymous) {
          cached.donorName = "Hamba Allah";
        }
      }
      donationStore.set(invoiceId, cached);

      if (!updatedData) {
        updatedData = {
          id: cached.id,
          invoiceId: cached.invoiceId,
          campaignId: cached.campaignId,
          campaignTitle: cached.campaignTitle,
          campaignSlug: cached.campaignSlug,
          amount: cached.amount,
          donorName: cached.donorName,
          isAnonymous: cached.isAnonymous,
          prayer: cached.prayer,
          status: cached.status,
        };
      }
    }
  }

  if (!updatedData) {
    updatedData = {
      id: `don-${Date.now()}`,
      invoiceId,
      donorName: isAnonymous ? "Hamba Allah" : "Donatur",
      isAnonymous: Boolean(isAnonymous),
      prayer: cleanPrayer,
    };
  }

  return updatedData;
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

    if (dbDonations && dbDonations.length > 0) {
      return dbDonations.map((d) => ({
        id: d.invoiceId,
        donor: d.isAnonymous ? "Hamba Allah" : d.donorName,
        amount: d.amount,
        channel: (d.paymentChannel || "qris").toUpperCase(),
        date: d.createdAt.toISOString(),
        status: d.status,
        campaignTitle: d.campaign?.title || "Sedekah Umum PABE",
      }));
    }
  } catch (error) {
    console.warn("Prisma getRecentDonations fallback:", error.message);
  }
  return [];
}
