import crypto from "crypto";
import {
  getMidtransSnapApiUrl,
  getMidtransCoreApiChargeUrl,
  getMidtransCoreApiStatusUrl,
  getMidtransAuthHeader,
  getMidtransServerKey,
  mapMidtransStatusToDomain,
} from "@/lib/midtransConfig";

/**
 * Service Adapter for Midtrans Payment Gateway
 * Decoupled from Database/Prisma and UI layers.
 */

/**
 * Direct Core API Charge for the 3 foundation-supported channels: QRIS, BRI VA, and Mandiri Bill
 * @param {object} params
 * @param {string} params.orderId
 * @param {number} params.amount
 * @param {string} params.channelId - "qris" | "bri_va" | "mandiri_va"
 * @param {string} [params.donorName]
 * @param {string} [params.donorEmail]
 * @param {string} [params.donorPhone]
 * @returns {Promise<{ channelId: string, vaNumber?: string, billerCode?: string, billKey?: string, qrCodeUrl?: string, qrString?: string, transactionId?: string }>}
 */
export async function createCoreApiCharge({
  orderId,
  amount,
  channelId = "qris",
  donorName = "Hamba Allah",
  donorEmail = "",
  donorPhone = "",
}) {
  if (!orderId || !amount || amount <= 0) {
    throw new Error("Parameter orderId dan nominal donasi valid diperlukan untuk Midtrans Core API.");
  }

  const authHeader = getMidtransAuthHeader();
  if (!authHeader) {
    throw new Error("MIDTRANS_SERVER_KEY belum dikonfigurasi di environment server.");
  }

  const grossAmount = Math.round(Number(amount));
  const channel = String(channelId).toLowerCase();

  const payload = {
    transaction_details: {
      order_id: orderId,
      gross_amount: grossAmount,
    },
    customer_details: {
      first_name: donorName.slice(0, 50),
      ...(donorEmail ? { email: donorEmail } : {}),
      ...(donorPhone ? { phone: donorPhone } : {}),
    },
  };

  if (channel === "bri_va") {
    payload.payment_type = "bank_transfer";
    payload.bank_transfer = {
      bank: "bri",
    };
  } else if (channel === "mandiri_va") {
    payload.payment_type = "echannel";
    payload.echannel = {
      bill_info1: "Donasi Yayasan",
      bill_info2: "Payung Berkah",
    };
  } else {
    // Default: QRIS
    payload.payment_type = "qris";
    payload.qris = {
      acquirer: "gopay",
    };
  }

  const response = await fetch(getMidtransCoreApiChargeUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: authHeader,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || (data.status_code && !["200", "201"].includes(data.status_code))) {
    const errorMsg = data.status_message || data.error_messages?.join(", ") || `HTTP ${response.status}`;
    console.error("Midtrans Core API charge error:", { status: response.status, data });
    throw new Error(`Midtrans Core API gagal: ${errorMsg}`);
  }

  const result = {
    channelId: channel,
    transactionId: data.transaction_id || "",
    statusCode: data.status_code || "",
    transactionStatus: data.transaction_status || "pending",
  };

  if (channel === "bri_va") {
    result.vaNumber = data.va_numbers?.[0]?.va_number || "";
  } else if (channel === "mandiri_va") {
    result.billerCode = data.biller_code || "";
    result.billKey = data.bill_key || "";
  } else {
    const qrAction = data.actions?.find((a) => a.name === "generate-qr-code");
    result.qrCodeUrl = qrAction?.url || "";
    result.qrString = data.qr_string || "";
  }

  return result;
}

/**
 * Creates a Snap transaction token and redirect URL via Midtrans REST API.
 * @param {object} params
 * @param {string} params.orderId - Unique invoice ID (e.g. INV-20261029-1234)
 * @param {number} params.amount - Total amount in IDR
 * @param {string} [params.donorName] - Name of the donor
 * @param {string} [params.donorEmail] - Email address of the donor
 * @param {string} [params.donorPhone] - Phone number of the donor
 * @param {string} [params.campaignTitle] - Title of the campaign/program
 * @returns {Promise<{ token: string, redirectUrl: string }>}
 */
export async function createSnapTransaction({
  orderId,
  amount,
  donorName = "Hamba Allah",
  donorEmail = "",
  donorPhone = "",
  campaignTitle = "Donasi Yayasan Payung Berkah",
}) {
  if (!orderId || !amount || amount <= 0) {
    throw new Error("Parameter orderId dan nominal donasi valid diperlukan untuk Midtrans.");
  }

  const authHeader = getMidtransAuthHeader();
  if (!authHeader) {
    throw new Error("MIDTRANS_SERVER_KEY belum dikonfigurasi di environment server.");
  }

  const grossAmount = Math.round(Number(amount));
  const sanitizedTitle = String(campaignTitle || "Donasi PABE").slice(0, 50);

  const payload = {
    transaction_details: {
      order_id: orderId,
      gross_amount: grossAmount,
    },
    customer_details: {
      first_name: donorName.slice(0, 50),
      ...(donorEmail ? { email: donorEmail } : {}),
      ...(donorPhone ? { phone: donorPhone } : {}),
    },
    item_details: [
      {
        id: "DONATION_ITEM",
        price: grossAmount,
        quantity: 1,
        name: sanitizedTitle,
      },
    ],
  };

  const response = await fetch(getMidtransSnapApiUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: authHeader,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.token) {
    const errorMsg = data.error_messages?.join(", ") || data.message || `HTTP ${response.status}`;
    console.error("Midtrans Snap error response:", { status: response.status, data });
    throw new Error(`Gagal membuat sesi pembayaran Midtrans: ${errorMsg}`);
  }

  return {
    token: data.token,
    redirectUrl: data.redirect_url || "",
  };
}

/**
 * Validates Midtrans SHA-512 notification signature
 * Formula: SHA512(order_id + status_code + gross_amount + ServerKey)
 * @param {object} params
 * @param {string} params.orderId
 * @param {string} params.statusCode
 * @param {string|number} params.grossAmount
 * @param {string} params.signatureKey
 * @returns {boolean}
 */
export function verifyMidtransSignature({ orderId, statusCode, grossAmount, signatureKey }) {
  if (!orderId || !statusCode || !grossAmount || !signatureKey) {
    return false;
  }

  const serverKey = getMidtransServerKey();
  if (!serverKey) {
    return false;
  }

  const payload = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  const computedHash = crypto.createHash("sha512").update(payload).digest("hex");

  try {
    const a = Buffer.from(computedHash, "utf8");
    const b = Buffer.from(signatureKey, "utf8");
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Parses and verifies an incoming Midtrans Webhook payload
 * @param {object} payload
 * @returns {{ isValid: boolean, orderId: string, status: string, isPaid: boolean, rawStatus: string, paymentType: string }}
 */
export function parseMidtransNotification(payload = {}) {
  const orderId = payload.order_id || payload.invoiceId || "";
  const statusCode = String(payload.status_code || "");
  const grossAmount = payload.gross_amount || "";
  const signatureKey = payload.signature_key || "";
  const rawStatus = payload.transaction_status || "";
  const fraudStatus = payload.fraud_status || "";
  const paymentType = payload.payment_type || "";

  const isValidSignature = verifyMidtransSignature({
    orderId,
    statusCode,
    grossAmount,
    signatureKey,
  });

  const mappedStatus = mapMidtransStatusToDomain(rawStatus, fraudStatus);
  const isPaid = mappedStatus === "PAID";

  return {
    isValid: isValidSignature,
    orderId,
    status: mappedStatus,
    rawStatus,
    isPaid,
    paymentType,
    grossAmount: Number(grossAmount) || 0,
  };
}

/**
 * Checks live transaction status directly from Midtrans Core API
 * @param {string} orderId
 * @returns {Promise<{ isFound: boolean, isPaid: boolean, status: string, rawStatus: string, settlementTime?: string }>}
 */
export async function checkMidtransOrderStatus(orderId) {
  if (!orderId) return { isFound: false, isPaid: false, status: "PENDING", rawStatus: "" };
  const authHeader = getMidtransAuthHeader();
  if (!authHeader) return { isFound: false, isPaid: false, status: "PENDING", rawStatus: "" };

  try {
    const res = await fetch(getMidtransCoreApiStatusUrl(orderId), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: authHeader,
      },
    });

    if (!res.ok) {
      return { isFound: false, isPaid: false, status: "PENDING", rawStatus: "" };
    }

    const data = await res.json();
    const domainStatus = mapMidtransStatusToDomain(data.transaction_status, data.fraud_status);

    return {
      isFound: true,
      orderId: data.order_id,
      status: domainStatus,
      rawStatus: data.transaction_status || "",
      isPaid: domainStatus === "PAID",
      grossAmount: Number(data.gross_amount) || 0,
      settlementTime: data.settlement_time || data.transaction_time || null,
    };
  } catch (err) {
    console.warn("Midtrans checkOrderStatus error:", err.message);
    return { isFound: false, isPaid: false, status: "PENDING", rawStatus: "" };
  }
}
