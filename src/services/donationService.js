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

  const cleanDonorName = isAnonymous ? "Hamba Allah" : validateName(donorName);
  const cleanDonorPhone = validatePhone(donorPhone);
  const cleanDonorEmail = donorEmail ? validateEmail(donorEmail) : "";
  const cleanPrayer = sanitizePrayer(prayer);

  const channel =
    PAYMENT_CHANNELS.find((p) => p.id === paymentChannelId) || PAYMENT_CHANNELS[0];

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const invoiceId = `INV-${dateStr}-${randomSuffix}`;

  const uniqueCode = channel.type === "QRIS" || channel.type === "EWALLET" ? Math.floor(100 + Math.random() * 900) : 0;
  const totalAmount = Number(amount) + uniqueCode + (channel.fee || 0);

  const secretSalt = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "pabe_inv_secure_salt_key";
  const accessToken = crypto
    .createHash("sha256")
    .update(`${invoiceId}_${secretSalt}`)
    .digest("hex")
    .slice(0, 32);

  const expiredAtDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

  let virtualAccountNumber = "";
  if (channel.type === "VA") {
    const bankPrefix = {
      bca_va: "80777",
      mandiri_va: "89508",
      bsi_va: "90088",
      bri_va: "12800",
    }[channel.id] || "88000";
    virtualAccountNumber = `${bankPrefix}${cleanDonorPhone.slice(-8)}`;
  }

  const donationData = {
    invoiceId,
    accessToken,
    campaignId,
    campaignTitle,
    campaignSlug,
    donationType,
    amount: Number(amount),
    uniqueCode,
    adminFee: channel.fee || 0,
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
    createdAt: now.toISOString(),
    expiredAt: expiredAtDate.toISOString(),
  };

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
    console.error("Prisma createDonation error:", error);
    throw new Error("Gagal memproses pembuatan transaksi donasi ke sistem database.");
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
        const secretSalt = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "pabe_inv_secure_salt_key";
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
    console.error("Prisma getDonationByInvoiceId error:", error);
  }

  return null;
}

import {
  updateDonationPrayer as updateDonationPrayerImpl,
  getRecentDonations,
} from "./donationPrayerService";

export async function updateDonationPrayer({ invoiceId, prayer, isAnonymous }) {
  return updateDonationPrayerImpl({ invoiceId, prayer, isAnonymous });
}

export { getRecentDonations };
