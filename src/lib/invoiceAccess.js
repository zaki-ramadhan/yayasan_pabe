import crypto from "crypto";

const LEGACY_WEAK_SALTS = ["pabe_inv_secure_salt_key"];

/**
 * Menghasilkan nomor invoice unik menggunakan CSPRNG (crypto.randomInt).
 * Format: INV-YYYYMMDD-MMMM-RRRRRR
 * @param {Date} [now]
 * @returns {string}
 */
export function generateInvoiceId(now = new Date()) {
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const microTime = String(now.getTime()).slice(-4);
  const randomSuffix = crypto.randomInt(100000, 1000000);
  return `INV-${dateStr}-${microTime}-${randomSuffix}`;
}

/**
 * Menghasilkan token akses invoice kriptografis acak (48 karakter hex / 192-bit entropy).
 * Tidak diturunkan dari invoiceId sehingga kebal terhadap serangan enumerasi/prediksi.
 * @returns {string}
 */
export function generateInvoiceToken() {
  return crypto.randomBytes(24).toString("hex");
}

/**
 * Mendeteksi apakah token yang tersimpan di database merupakan token deterministik lama
 * yang dibuat dengan salt lemah/hardcoded.
 * @param {string} invoiceId
 * @param {string} storedToken
 * @returns {boolean}
 */
export function isWeakDeterministicToken(invoiceId, storedToken) {
  if (!invoiceId || !storedToken || typeof storedToken !== "string") return false;
  for (const salt of LEGACY_WEAK_SALTS) {
    const derived = crypto
      .createHash("sha256")
      .update(`${invoiceId}_${salt}`)
      .digest("hex")
      .slice(0, 32);
    if (storedToken === derived) {
      return true;
    }
  }
  return false;
}

/**
 * Memverifikasi kecocokan token akses invoice secara timing-safe.
 * @param {string|null|undefined} providedToken
 * @param {string|null|undefined} expectedToken
 * @returns {boolean}
 */
export function verifyInvoiceToken(providedToken, expectedToken) {
  if (
    !providedToken ||
    !expectedToken ||
    typeof providedToken !== "string" ||
    typeof expectedToken !== "string"
  ) {
    return false;
  }

  const cleanProvided = providedToken.trim();
  const cleanExpected = expectedToken.trim();

  if (cleanProvided.length < 16 || cleanProvided.length !== cleanExpected.length) {
    return false;
  }

  try {
    const bufA = Buffer.from(cleanProvided, "utf-8");
    const bufB = Buffer.from(cleanExpected, "utf-8");
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

