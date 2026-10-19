import crypto from "crypto";
import prisma from "@/lib/prisma";
import {
  validateDonationAmount,
  validateName,
  validatePhone,
  validateEmail,
  sanitizePrayer,
  sanitizeInput,
} from "@/lib/security";
import { PAYMENT_CHANNELS } from "@/data/paymentChannels";

// Fallback in-memory donation store for offline/demo sessions
const donationStore = new Map();

donationStore.set("INV-2026-DEMO", {
  id: "don-demo",
  invoiceId: "INV-2026-DEMO",
  campaignId: "camp-001",
  campaignTitle: "Beasiswa Pendidikan Santri Penghafal Al-Qur'an 30 Juz",
  campaignSlug: "beasiswa-santri-penghafal-quran",
  campaignImage: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80",
  donationType: "CAMPAIGN",
  amount: 100000,
  uniqueCode: 124,
  adminFee: 0,
  totalAmount: 100124,
  paymentChannelId: "qris",
  paymentChannelName: "QRIS (Semua Bank & E-Wallet)",
  paymentChannelType: "QRIS",
  virtualAccountNumber: "",
  donorName: "Hamba Allah",
  donorEmail: "donatur@example.com",
  donorPhone: "081234567890",
  isAnonymous: true,
  prayer: "Semoga santri menjadi penghafal Al-Qur'an yang amanah dan berkah untuk umat.",
  status: "PENDING",
  createdAt: new Date().toISOString(),
  expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
});

export async function createDonation({
  campaignId = null,
  campaignTitle = "Sedekah Umum PABE",
  campaignSlug = "",
  donationType = "CAMPAIGN",
  amount,
  paymentChannelId = "qris",
  donorName = "Hamba Allah",
  donorEmail = "",
  donorPhone = "",
  isAnonymous = false,
  prayer = "",
  idempotencyKey = "",
}) {
  const validation = validateDonationAmount(amount);
  if (!validation.isValid) {
    throw new Error(validation.message);
  }

  const nameVal = validateName(donorName, isAnonymous);
  if (!nameVal.isValid) {
    throw new Error(nameVal.message);
  }

  const phoneVal = validatePhone(donorPhone);
  if (!phoneVal.isValid) {
    throw new Error(phoneVal.message);
  }

  let cleanDonorEmail = "";
  if (donorEmail) {
    const emailVal = validateEmail(donorEmail);
    if (!emailVal.isValid) {
      throw new Error(emailVal.message);
    }
    cleanDonorEmail = emailVal.sanitized;
  }

  const channel = PAYMENT_CHANNELS.find((p) => p.id === paymentChannelId) || PAYMENT_CHANNELS[0];
  const uniqueCode = channel.type === "QRIS" ? 0 : Math.floor(100 + Math.random() * 900);
  const adminFee = channel.fee || 0;
  const totalAmount = Number(amount) + uniqueCode + adminFee;
  const invoiceId = `INV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
  const accessToken = crypto.randomBytes(16).toString("hex");

  let virtualAccountNumber = "";
  if (channel.type === "VA") {
    virtualAccountNumber = `${channel.accountNumberPrefix || "88"}${
      phoneVal.sanitized.slice(-8)
    }`;
  }

  const cleanDonorName = nameVal.sanitized;
  const cleanDonorPhone = phoneVal.sanitized;
  const cleanPrayer = sanitizePrayer(prayer);
  const expiredAtDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const donationData = {
    id: `don-${Date.now()}`,
    invoiceId,
    accessToken,
    campaignId: campaignId || null,
    campaignTitle,
    campaignSlug,
    donationType,
    amount: Number(amount),
    uniqueCode,
    adminFee,
    totalAmount,
    paymentChannelId: channel.id,
    paymentChannelName: channel.name,
    paymentChannelType: channel.type,
    virtualAccountNumber,
    donorName: cleanDonorName,
    donorEmail: cleanDonorEmail,
    donorPhone: cleanDonorPhone,
    isAnonymous: Boolean(isAnonymous),
    prayer: cleanPrayer,
    status: "PENDING",
    idempotencyKey: idempotencyKey || null,
    createdAt: new Date().toISOString(),
    expiredAt: expiredAtDate.toISOString(),
  };

  // Always keep in fallback cache
  donationStore.set(invoiceId, donationData);

  // Save to PostgreSQL via Prisma
  try {
    const createdDb = await prisma.donation.create({
      data: {
        invoiceId,
        accessToken,
        campaignId: campaignId || undefined,
        donationType,
        amount: Number(amount),
        uniqueCode,
        totalAmount,
        paymentChannel: channel.id,
        paymentRef: virtualAccountNumber || null,
        donorName: cleanDonorName,
        donorEmail: cleanDonorEmail || null,
        donorPhone: cleanDonorPhone,
        isAnonymous: Boolean(isAnonymous),
        prayer: cleanPrayer || null,
        status: "PENDING",
        expiredAt: expiredAtDate,
        idempotencyKey: idempotencyKey || null,
      },
      include: {
        campaign: true,
      },
    });

    if (createdDb) {
      donationData.id = createdDb.id;
    }
  } catch (error) {
    console.warn("Prisma createDonation fallback:", error.message);
  }

  return donationData;
}

export async function getDonationByInvoiceId(invoiceId, token = null, sessionUser = null) {
  if (!invoiceId) return null;

  try {
    const dbDonation = await prisma.donation.findUnique({
      where: { invoiceId },
      include: {
        campaign: true,
      },
    });

    if (dbDonation) {
      const channel =
        PAYMENT_CHANNELS.find((p) => p.id === dbDonation.paymentChannel) || PAYMENT_CHANNELS[0];

      let effectiveAccessToken = dbDonation.accessToken;
      if (!effectiveAccessToken) {
        const secretSalt = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "ygsm_inv_secure_salt_key";
        effectiveAccessToken = crypto
          .createHash("sha256")
          .update(`${dbDonation.invoiceId}_${secretSalt}`)
          .digest("hex")
          .slice(0, 32);

        try {
          await prisma.donation.update({
            where: { id: dbDonation.id },
            data: { accessToken: effectiveAccessToken },
          });
        } catch {
          // Ignore if update fails
        }
      }

      const isOwner = Boolean(
        sessionUser?.email &&
        dbDonation.donorEmail &&
        sessionUser.email.toLowerCase() === dbDonation.donorEmail.toLowerCase()
      );
      const isStaff = Boolean(sessionUser?.role && sessionUser.role !== "DONOR");
      const isAuthorized = Boolean((token && token === effectiveAccessToken) || isOwner || isStaff);

      return {
        id: dbDonation.id,
        invoiceId: dbDonation.invoiceId,
        accessToken: effectiveAccessToken,
        isAuthorized,
        campaignId: dbDonation.campaignId,
        campaignTitle: dbDonation.campaign?.title || "Sedekah Umum PABE",
        campaignSlug: dbDonation.campaign?.slug || "",
        campaignImage: dbDonation.campaign?.bannerUrl || null,
        donationType: dbDonation.donationType,
        amount: dbDonation.amount,
        uniqueCode: dbDonation.uniqueCode,
        adminFee: channel.fee || 0,
        totalAmount: dbDonation.totalAmount,
        paymentChannelId: channel.id,
        paymentChannelName: channel.name,
        paymentChannelType: channel.type,
        virtualAccountNumber: dbDonation.paymentRef || "",
        donorName: dbDonation.donorName,
        donorEmail: dbDonation.donorEmail || "",
        donorPhone: dbDonation.donorPhone,
        isAnonymous: dbDonation.isAnonymous,
        prayer: dbDonation.prayer || "",
        status: dbDonation.status,
        createdAt: dbDonation.createdAt.toISOString(),
        expiredAt: dbDonation.expiredAt.toISOString(),
      };
    }
  } catch (error) {
    console.warn("Prisma getDonationByInvoiceId fallback:", error.message);
  }

  const fallbackDonation = donationStore.get(invoiceId);
  if (fallbackDonation) {
    let effectiveAccessToken = fallbackDonation.accessToken;
    if (!effectiveAccessToken) {
      const secretSalt = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "ygsm_inv_secure_salt_key";
      effectiveAccessToken = crypto
        .createHash("sha256")
        .update(`${fallbackDonation.invoiceId}_${secretSalt}`)
        .digest("hex")
        .slice(0, 32);
      fallbackDonation.accessToken = effectiveAccessToken;
    }

    const isOwner = Boolean(
      sessionUser?.email &&
      fallbackDonation.donorEmail &&
      sessionUser.email.toLowerCase() === fallbackDonation.donorEmail.toLowerCase()
    );
    const isStaff = Boolean(sessionUser?.role && sessionUser.role !== "DONOR");
    const isAuthorized = Boolean((token && token === effectiveAccessToken) || isOwner || isStaff);
    return {
      ...fallbackDonation,
      accessToken: effectiveAccessToken,
      isAuthorized,
    };
  }

  return null;
}

export async function updateDonationPrayer({ invoiceId, prayer, isAnonymous }) {
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
