/**
 * Donation Expiry Configuration & Utilities (SSOT)
 * Menstandarisasi batas waktu pembayaran donasi per saluran dan sinkronisasi dengan Midtrans.
 */

export const DONATION_STATUS = Object.freeze({
  PENDING: "PENDING",
  PAID: "PAID",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
});

/**
 * Konfigurasi batas waktu kedaluwarsa pembayaran:
 * - QRIS / E-Wallet: 15 menit (sesuai spesifikasi QRIS dinamis industri & default Midtrans)
 * - Virtual Account: 24 jam
 */
export const PAYMENT_EXPIRY_CONFIG = Object.freeze({
  QRIS: {
    duration: 15,
    unit: "minute",
    milliseconds: 15 * 60 * 1000,
    label: "15 menit",
  },
  EWALLET: {
    duration: 15,
    unit: "minute",
    milliseconds: 15 * 60 * 1000,
    label: "15 menit",
  },
  VA: {
    duration: 24,
    unit: "hour",
    milliseconds: 24 * 60 * 60 * 1000,
    label: "24 jam",
  },
  DEFAULT: {
    duration: 24,
    unit: "hour",
    milliseconds: 24 * 60 * 60 * 1000,
    label: "24 jam",
  },
});

/**
 * Resolusi konfigurasi batas waktu berdasarkan ID kanal atau tipe kanal pembayaran.
 * @param {string} channelId
 * @param {string} channelType
 * @returns {{ duration: number, unit: string, milliseconds: number, label: string }}
 */
export function getChannelExpiryConfig(channelId = "", channelType = "") {
  const normId = String(channelId).toLowerCase();
  const normType = String(channelType).toUpperCase();

  if (normId === "qris" || normId === "gopay" || normId === "shopeepay" || normType === "QRIS" || normType === "EWALLET") {
    return PAYMENT_EXPIRY_CONFIG.QRIS;
  }

  if (normId.endsWith("_va") || normType === "VA") {
    return PAYMENT_EXPIRY_CONFIG.VA;
  }

  return PAYMENT_EXPIRY_CONFIG.DEFAULT;
}

/**
 * Menghitung objek Date kedaluwarsa dari waktu acuan.
 * @param {string} channelId
 * @param {string} channelType
 * @param {Date|number} [fromDate]
 * @returns {Date}
 */
export function calculateDonationExpiryDate(channelId = "", channelType = "", fromDate = new Date()) {
  const baseTime = fromDate instanceof Date ? fromDate.getTime() : Number(fromDate) || Date.now();
  const config = getChannelExpiryConfig(channelId, channelType);
  return new Date(baseTime + config.milliseconds);
}

/**
 * Memformat waktu order ke standar Midtrans format: 'YYYY-MM-DD HH:mm:ss +0700' (WIB).
 * @param {Date} date
 * @returns {string}
 */
export function formatMidtransOrderTime(date = new Date()) {
  const wibTime = new Date(date.getTime() + (7 * 60 + date.getTimezoneOffset()) * 60000);
  const yyyy = wibTime.getFullYear();
  const mm = String(wibTime.getMonth() + 1).padStart(2, "0");
  const dd = String(wibTime.getDate()).padStart(2, "0");
  const hh = String(wibTime.getHours()).padStart(2, "0");
  const min = String(wibTime.getMinutes()).padStart(2, "0");
  const ss = String(wibTime.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss} +0700`;
}

/**
 * Membuat payload custom_expiry untuk Midtrans Core API / Snap.
 * @param {string} channelId
 * @param {string} channelType
 * @param {Date} [fromDate]
 * @returns {{ order_time: string, expiry_duration: number, unit: string }}
 */
export function buildMidtransCustomExpiry(channelId = "", channelType = "", fromDate = new Date()) {
  const config = getChannelExpiryConfig(channelId, channelType);
  return {
    order_time: formatMidtransOrderTime(fromDate),
    expiry_duration: config.duration,
    unit: config.unit,
  };
}
