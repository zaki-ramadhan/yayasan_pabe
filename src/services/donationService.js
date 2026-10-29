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
import { verifyEmailDomainDns } from "@/lib/serverDnsValidator";
import { PAYMENT_CHANNELS } from "@/data/paymentChannels";
import { createSnapTransaction } from "@/services/midtransService";
import { getMidtransServerKey } from "@/lib/midtransConfig";

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
  const cleanDonorName = isAnonymous ? "Hamba Allah" : (nameVal.sanitized || donorName || "Hamba Allah");

  const phoneVal = validatePhone(donorPhone);
  if (!phoneVal.isValid) {
    throw new Error(phoneVal.message);
  }
  const cleanDonorPhone = phoneVal.sanitized || donorPhone;

  let cleanDonorEmail = "";
  if (donorEmail && donorEmail.trim()) {
    const emailVal = await verifyEmailDomainDns(donorEmail);
    if (!emailVal.isValid) {
      throw new Error(emailVal.message);
    }
    cleanDonorEmail = emailVal.sanitized || donorEmail.trim();
  }
  const cleanPrayer = sanitizePrayer(prayer);

  const channel =
    PAYMENT_CHANNELS.find((p) => p.id === paymentChannelId) || PAYMENT_CHANNELS[0];

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const microTime = Date.now().toString().slice(-4);
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const invoiceId = `INV-${dateStr}-${microTime}-${randomSuffix}`;

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

  let snapToken = null;
  let snapRedirectUrl = null;
  if (getMidtransServerKey()) {
    try {
      const snap = await createSnapTransaction({
        orderId: invoiceId,
        amount: totalAmount,
        donorName: cleanDonorName,
        donorEmail: cleanDonorEmail,
        donorPhone: cleanDonorPhone,
        campaignTitle,
      });
      snapToken = snap.token;
      snapRedirectUrl = snap.redirectUrl;
    } catch (err) {
      console.warn("Midtrans createSnapTransaction warning (proceeding with fallback):", err.message);
    }
  }

  const effectivePaymentRef = snapToken || virtualAccountNumber || null;

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
    snapToken,
    snapRedirectUrl,
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
        paymentRef: effectivePaymentRef,
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

      let snapToken = null;
      if (dbDonation.paymentRef && dbDonation.paymentRef.includes("-")) {
        snapToken = dbDonation.paymentRef;
      }

      if (dbDonation.status === "PENDING" && !snapToken && getMidtransServerKey()) {
        try {
          const snap = await createSnapTransaction({
            orderId: dbDonation.invoiceId,
            amount: dbDonation.totalAmount,
            donorName: dbDonation.donorName,
            donorEmail: dbDonation.donorEmail || "",
            donorPhone: dbDonation.donorPhone,
            campaignTitle: dbDonation.campaign?.title || "Sedekah Umum PABE",
          });
          snapToken = snap.token;
          await prisma.donation.update({
            where: { id: dbDonation.id },
            data: { paymentRef: snapToken },
          });
        } catch (snapErr) {
          console.warn("On-demand Snap token generation error:", snapErr.message);
        }
      }

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
        virtualAccountNumber: channel.type === "VA" ? (dbDonation.paymentRef || "") : "",
        snapToken,
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
