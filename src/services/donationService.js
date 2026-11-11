import crypto from "crypto";
import prisma from "@/lib/prisma";
import {
  validateDonationAmount,
  validateName,
  validatePhone,
  validateEmail,
  sanitizePrayer,
  sanitizeInput,
  maskEmail,
} from "@/lib/security";
import { verifyEmailDomainDns } from "@/lib/serverDnsValidator";
import { PAYMENT_CHANNELS } from "@/data/paymentChannels";
import {
  createCoreApiCharge,
  createSnapTransaction,
  checkMidtransOrderStatus,
  invalidateMidtransStatusCache,
} from "@/services/midtransService";
import { getMidtransServerKey } from "@/lib/midtransConfig";
import { calculateDonationExpiryDate } from "@/lib/donationExpiryConstants";
import { broadcastAdminEvent } from "@/lib/sseBroadcast";
import { sendDonationReceiptEmail } from "@/services/emailService";
import { enqueueNotification } from "@/services/notificationQueueService";
import { NOTIFICATION_TYPE } from "@/lib/notificationConstants";

export function buildAdminDonationEventPayload(dbDonation, extra = {}) {
  if (!dbDonation) return null;
  return {
    id: dbDonation.id,
    invoiceId: dbDonation.invoiceId,
    donorName: dbDonation.isAnonymous ? "Hamba Allah" : dbDonation.donorName,
    rawDonorName: dbDonation.donorName,
    donorEmail: dbDonation.donorEmail ? maskEmail(dbDonation.donorEmail) : "",
    donorPhone: dbDonation.donorPhone || "",
    donorAvatar: dbDonation.donorAvatar || null,
    isAnonymous: Boolean(dbDonation.isAnonymous),
    amount: Number(dbDonation.amount),
    totalAmount: Number(dbDonation.totalAmount),
    paymentChannel: dbDonation.paymentChannel,
    status: dbDonation.status,
    campaignId: dbDonation.campaignId || dbDonation.campaign?.id || null,
    campaignTitle: dbDonation.campaign?.title || "Donasi Umum",
    campaignSlug: dbDonation.campaign?.slug || "",
    prayer: dbDonation.prayer || null,
    isPrayerHidden: Boolean(dbDonation.isPrayerHidden),
    isPrayerPinned: Boolean(dbDonation.isPrayerPinned),
    createdAt: dbDonation.createdAt ? new Date(dbDonation.createdAt).toISOString() : new Date().toISOString(),
    paidAt: dbDonation.paidAt ? new Date(dbDonation.paidAt).toISOString() : null,
    ...extra,
  };
}

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
  donorAvatar = null,
  isAnonymous = false,
  prayer = "",
  idempotencyKey = "",
}) {
  const validation = validateDonationAmount(amount, paymentChannelId);
  if (!validation.isValid) {
    throw new Error(validation.message);
  }

  const nameVal = validateName(donorName, isAnonymous);
  if (!nameVal.isValid) {
    throw new Error(nameVal.message);
  }
  const cleanDonorName = nameVal.sanitized || donorName || (isAnonymous ? "Hamba Allah" : "");

  const isPhoneRequired = !donorEmail || !donorEmail.trim();
  const phoneVal = validatePhone(donorPhone, { isRequired: isPhoneRequired });
  if (!phoneVal.isValid) {
    throw new Error(phoneVal.message);
  }
  const cleanDonorPhone = phoneVal.sanitized || donorPhone || "-";

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

  const uniqueCode = 0;
  const totalAmount = Number(amount) + (channel.fee || 0);

  const secretSalt = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "pabe_inv_secure_salt_key";
  const accessToken = crypto
    .createHash("sha256")
    .update(`${invoiceId}_${secretSalt}`)
    .digest("hex")
    .slice(0, 32);

  const isRoutine = Boolean(idempotencyKey && String(idempotencyKey).startsWith("ROUTINE_EXEC_"));
  const expiredAtDate = calculateDonationExpiryDate(channel.id, channel.type, now, { isRoutine });

  let virtualAccountNumber = "";
  let billerCode = "";
  let billKey = "";
  let qrCodeUrl = "";
  let qrString = "";

  if (getMidtransServerKey() && process.env.NODE_ENV !== "test") {
    try {
      const charge = await createCoreApiCharge({
        orderId: invoiceId,
        amount: totalAmount,
        channelId: channel.id,
        donorName: cleanDonorName,
        donorEmail: cleanDonorEmail,
        donorPhone: cleanDonorPhone,
        isRoutine,
      });

      if (channel.type === "VA") {
        if (channel.id === "mandiri_va") {
          billerCode = charge.billerCode || "70012";
          billKey = charge.billKey || "";
          virtualAccountNumber = billKey;
        } else {
          virtualAccountNumber = charge.vaNumber || "";
        }
      } else {
        qrCodeUrl = charge.qrCodeUrl || "";
        qrString = charge.qrString || "";
      }
    } catch (err) {
      console.warn("Midtrans Core API charge fallback:", err.message);
    }
  }

  // Fallback lokal jika sandbox offline
  if (!virtualAccountNumber && channel.type === "VA") {
    const bankPrefix = {
      bri_va: "04240",
      bca_va: "70001",
      bni_va: "88080",
      permata_va: "85280",
      mandiri_va: "70012",
    }[channel.id] || "88000";
    virtualAccountNumber = `${bankPrefix}${cleanDonorPhone.slice(-8)}`;
    if (channel.id === "mandiri_va") {
      billerCode = "70012";
      billKey = virtualAccountNumber;
    }
  }

  let effectivePaymentRef = null;
  if (channel.id === "mandiri_va") {
    effectivePaymentRef = `${billerCode || "70012"}:${billKey || virtualAccountNumber}`;
  } else if (channel.type === "VA") {
    effectivePaymentRef = virtualAccountNumber;
  } else {
    if (qrString && qrCodeUrl) {
      effectivePaymentRef = `${qrString}__QRURL__${qrCodeUrl}`;
    } else {
      effectivePaymentRef = qrString || qrCodeUrl || null;
    }
  }

  const effectiveCampaignTitle =
    donationType === "ZAKAT" && campaignTitle === "Sedekah Umum PABE"
      ? "Tunaikan Zakat Yayasan PABE"
      : campaignTitle;

  const donationData = {
    invoiceId,
    accessToken,
    campaignId,
    campaignTitle: effectiveCampaignTitle,
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
    billerCode,
    billKey,
    qrCodeUrl,
    qrString,
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
        donorAvatar: isAnonymous ? null : (donorAvatar || null),
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
      try {
        broadcastAdminEvent("DONATION_UPDATED", buildAdminDonationEventPayload(createdDb));
      } catch (sseErr) {
        console.warn("Peringatan: Gagal broadcast SSE DONATION_UPDATED saat createDonation:", sseErr?.message);
      }
    }

    if (cleanDonorEmail && cleanDonorPhone) {
      try {
        const existingDonorUser = await prisma.user.findFirst({
          where: { email: cleanDonorEmail },
          select: { id: true, phone: true },
        });
        if (existingDonorUser && (!existingDonorUser.phone || existingDonorUser.phone === "-")) {
          await prisma.user.update({
            where: { id: existingDonorUser.id },
            data: { phone: cleanDonorPhone },
          });
        }
      } catch (userSyncErr) {
        console.warn("Gagal sinkronisasi otomatis nomor WhatsApp ke profil donatur:", userSyncErr?.message);
      }
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
      if (dbDonation.status === "PENDING") {
        const isPastExpiry = dbDonation.expiredAt && new Date() > new Date(dbDonation.expiredAt);
        let didExpireOnRead = false;

        if (getMidtransServerKey() && process.env.NODE_ENV !== "test") {
          try {
            const midtransStatus = await checkMidtransOrderStatus(invoiceId);
            if (midtransStatus.isPaid) {
              const settled = await settleDonationStatus(
                invoiceId,
                midtransStatus.settlementTime ? new Date(midtransStatus.settlementTime) : new Date()
              );
              if (settled) {
                dbDonation.status = "PAID";
                dbDonation.paidAt = settled.paidAt;
              }
            } else if (midtransStatus.status === "EXPIRED" || isPastExpiry) {
              const res = await prisma.donation.updateMany({
                where: { invoiceId, status: "PENDING" },
                data: { status: "EXPIRED" },
              });
              if (res.count > 0) {
                dbDonation.status = "EXPIRED";
                didExpireOnRead = true;
              }
            }
          } catch (err) {
            console.warn("Active status reconciliation error in getDonationByInvoiceId:", err.message);
            if (isPastExpiry) {
              const res = await prisma.donation.updateMany({
                where: { invoiceId, status: "PENDING" },
                data: { status: "EXPIRED" },
              });
              if (res.count > 0) {
                dbDonation.status = "EXPIRED";
                didExpireOnRead = true;
              }
            }
          }
        } else if (isPastExpiry) {
          const res = await prisma.donation.updateMany({
            where: { invoiceId, status: "PENDING" },
            data: { status: "EXPIRED" },
          });
          if (res.count > 0) {
            dbDonation.status = "EXPIRED";
            didExpireOnRead = true;
          }
        }

        if (didExpireOnRead) {
          try {
            broadcastAdminEvent("DONATION_UPDATED", buildAdminDonationEventPayload(dbDonation));
          } catch (sseErr) {
            console.warn("Peringatan: Gagal broadcast SSE DONATION_UPDATED saat on-read expire:", sseErr?.message);
          }
        }
      }

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

      let billerCode = "";
      let billKey = "";
      let qrCodeUrl = "";
      let qrString = "";
      let virtualAccountNumber = "";

      if (channel.id === "mandiri_va") {
        if (dbDonation.paymentRef?.includes(":")) {
          const parts = dbDonation.paymentRef.split(":");
          billerCode = parts[0];
          billKey = parts[1];
          virtualAccountNumber = billKey;
        } else {
          billerCode = "70012";
          billKey = dbDonation.paymentRef || "";
          virtualAccountNumber = billKey;
        }
      } else if (channel.type === "VA") {
        virtualAccountNumber = dbDonation.paymentRef || "";
        if (!virtualAccountNumber) {
          const bankPrefix = {
            bri_va: "04240",
            bca_va: "70001",
            bni_va: "88080",
            permata_va: "85280",
          }[channel.id] || "88000";
          const cleanPhone = String(dbDonation.donorPhone || "081234567890").replace(/\D/g, "");
          virtualAccountNumber = `${bankPrefix}${cleanPhone.slice(-8)}`;
        }
      } else if (channel.type === "QRIS" || channel.type === "EWALLET") {
        if (dbDonation.paymentRef?.includes("__QRURL__")) {
          const parts = dbDonation.paymentRef.split("__QRURL__");
          qrString = parts[0] || "";
          qrCodeUrl = parts[1] || "";
        } else if (dbDonation.paymentRef?.startsWith("http")) {
          qrCodeUrl = dbDonation.paymentRef;
        } else if (dbDonation.paymentRef) {
          qrString = dbDonation.paymentRef;
        }

        if (!qrCodeUrl && dbDonation.status === "PENDING" && getMidtransServerKey()) {
          try {
            const liveStatus = await checkMidtransOrderStatus(dbDonation.invoiceId);
            if (liveStatus?.qrCodeUrl) {
              qrCodeUrl = liveStatus.qrCodeUrl;
              if (liveStatus.qrString && !qrString) {
                qrString = liveStatus.qrString;
              }
              const updatedRef = qrString ? `${qrString}__QRURL__${qrCodeUrl}` : qrCodeUrl;
              await prisma.donation.update({
                where: { invoiceId: dbDonation.invoiceId },
                data: { paymentRef: updatedRef },
              }).catch(() => {});
            }
          } catch {
            // fallback silent
          }
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
        adminFee: Math.max(0, dbDonation.totalAmount - dbDonation.amount - (dbDonation.uniqueCode || 0)),
        totalAmount: dbDonation.totalAmount,
        paymentChannelId: channel.id,
        paymentChannelName: channel.name,
        paymentChannelType: channel.type,
        virtualAccountNumber,
        billerCode,
        billKey,
        qrCodeUrl,
        qrString,
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

/**
 * Atomically settles a donation as PAID and updates campaign metrics (idempotent)
 * @param {string} invoiceId
 * @param {Date} [paidAt]
 * @param {object} [options]
 * @param {number} [options.expectedAmount] - Nominal pelunasan dari payment gateway untuk verifikasi integritas
 * @returns {Promise<object|null>}
 */
export async function settleDonationStatus(invoiceId, paidAt = new Date(), options = {}) {
  if (!invoiceId) return null;

  const expectedAmount =
    options?.expectedAmount !== undefined && options?.expectedAmount !== null
      ? Number(options.expectedAmount)
      : null;

  let broadcastPayload = null;

  const settled = await prisma.$transaction(async (tx) => {
    const donation = await tx.donation.findUnique({
      where: { invoiceId },
      include: {
        campaign: { select: { id: true, title: true, slug: true } },
      },
    });

    if (!donation) return null;

    // Verifikasi integritas nominal: selisih nominal tidak boleh melampaui toleransi pembulatan Rp 1
    if (expectedAmount !== null && !isNaN(expectedAmount) && expectedAmount > 0) {
      if (Math.abs(expectedAmount - Number(donation.totalAmount)) > 1) {
        console.error(
          `[PaymentIntegrity] Penolakan pelunasan: Nominal webhook (Rp ${expectedAmount}) tidak cocok dengan tagihan invoice ${invoiceId} (Rp ${donation.totalAmount})`
        );
        throw new Error(
          `Inkonsistensi nominal pembayaran: Diterima Rp ${expectedAmount}, tetapi tagihan invoice adalah Rp ${donation.totalAmount}.`
        );
      }
    }

    if (donation.status === "PAID") return donation;

    const previousStatus = donation.status;

    const updated = await tx.donation.update({
      where: { invoiceId },
      data: {
        status: "PAID",
        paidAt: paidAt || new Date(),
      },
    });

    if (donation.campaignId) {
      if (typeof tx.donation.aggregate === "function") {
        const agg = await tx.donation.aggregate({
          where: { campaignId: donation.campaignId, status: "PAID" },
          _sum: { amount: true },
          _count: { id: true },
        });
        await tx.campaign.update({
          where: { id: donation.campaignId },
          data: {
            collectedAmount: Number(agg._sum.amount || 0),
            donorCount: Number(agg._count.id || 0),
          },
        });
      } else {
        await tx.campaign.update({
          where: { id: donation.campaignId },
          data: {
            collectedAmount: { increment: donation.amount },
            donorCount: { increment: 1 },
          },
        });
      }
    }

    // Rekonsiliasi transaksi terlambat (Late Webhook / Expired Invoices yang akhirnya terbayar)
    if (previousStatus === "EXPIRED" || previousStatus === "CANCELLED") {
      await tx.activityLog.create({
        data: {
          action: "PAYMENT_LATE_RECONCILIATION",
          targetType: "DONATION",
          targetId: donation.id,
          description: `Rekonsiliasi pembayaran terlambat (Late Settlement) untuk invoice ${invoiceId}. Status sebelumnya ${previousStatus} diperbarui menjadi PAID (Nominal: Rp ${donation.amount.toLocaleString("id-ID")}).`,
          userName: "SYSTEM_RECONCILER",
          userRole: "SYSTEM",
        },
      });
    }

    broadcastPayload = {
      id: updated.id,
      invoiceId: updated.invoiceId,
      donorName: updated.isAnonymous ? "Hamba Allah" : updated.donorName,
      rawDonorName: updated.donorName,
      donorEmail: updated.donorEmail ? maskEmail(updated.donorEmail) : "",
      donorPhone: updated.donorPhone || "",
      donorAvatar: updated.donorAvatar || null,
      isAnonymous: Boolean(updated.isAnonymous),
      amount: Number(updated.amount),
      totalAmount: Number(updated.totalAmount),
      paymentChannel: updated.paymentChannel,
      status: "PAID",
      campaignId: donation.campaignId || null,
      campaignTitle: donation.campaign?.title || "Donasi Umum",
      campaignSlug: donation.campaign?.slug || "",
      prayer: updated.prayer || null,
      isPrayerHidden: Boolean(updated.isPrayerHidden),
      isPrayerPinned: Boolean(updated.isPrayerPinned),
      createdAt: updated.createdAt ? new Date(updated.createdAt).toISOString() : new Date().toISOString(),
      paidAt: updated.paidAt ? new Date(updated.paidAt).toISOString() : new Date().toISOString(),
    };

    return updated;
  });

  if (settled) {
    invalidateMidtransStatusCache(invoiceId);
    if (broadcastPayload) {
      try {
        broadcastAdminEvent("DONATION_PAID", broadcastPayload);
      } catch (sseErr) {
        console.warn("Peringatan: Gagal broadcast SSE admin:", sseErr?.message);
      }
    }

    // Kirim bukti donasi digital via Resend (dengan fallback antrean retry jika terjadi rate limit)
    if (settled.donorEmail && settled.donorEmail.includes("@")) {
      const appUrl = (
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.NEXTAUTH_URL ||
        "http://localhost:3000"
      ).replace(/\/+$/, "");
      const receiptUrl = `${appUrl}/invoice/${settled.invoiceId}?token=${settled.accessToken || ""}`;

      sendDonationReceiptEmail({
        to: settled.donorEmail,
        donorName: settled.isAnonymous ? "Hamba Allah" : settled.donorName,
        programTitle: broadcastPayload?.campaignTitle || "Program Kebaikan",
        amount: Number(settled.amount),
        invoiceId: settled.invoiceId,
        paidAt: settled.paidAt || new Date(),
        paymentChannelName: settled.paymentChannel || "Pembayaran Digital",
        prayer: settled.prayer || "",
        actionUrl: receiptUrl,
      }).catch((emailErr) => {
        console.warn("[DonationReceipt] Pengiriman email langsung gagal, memasukkan ke antrean retry:", emailErr?.message);
        enqueueNotification({
          type: NOTIFICATION_TYPE.DONATION_RECEIPT,
          recipientPhone: settled.donorEmail,
          payload: {
            donorEmail: settled.donorEmail,
            donorName: settled.isAnonymous ? "Hamba Allah" : settled.donorName,
            programTitle: broadcastPayload?.campaignTitle || "Program Kebaikan",
            amount: Number(settled.amount),
            invoiceId: settled.invoiceId,
            paidAt: settled.paidAt || new Date(),
            paymentChannelName: settled.paymentChannel || "Pembayaran Digital",
            prayer: settled.prayer || "",
            actionUrl: receiptUrl,
          },
          idempotencyKey: `receipt_${settled.invoiceId}`,
        }).catch((qErr) => console.error("[DonationReceipt] Gagal memasukkan ke antrean notifikasi:", qErr?.message));
      });
    }
  }

  return settled;
}

export { getRecentDonations };
