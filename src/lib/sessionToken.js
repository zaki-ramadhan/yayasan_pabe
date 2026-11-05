import crypto from "crypto";

const DEFAULT_SECRET = "pabe_secure_session_signing_secret_2026";

/**
 * Mengambil secret key untuk penandatanganan kriptografis sesi.
 * @returns {string}
 */
export function getSessionSecret() {
  return (
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.SESSION_SECRET ||
    DEFAULT_SECRET
  );
}

/**
 * Membuat token sesi terenkripsi/tervalidasi HMAC-SHA256 (Anti-Session Forgery).
 * Format: <payload_base64url>.<signature_base64url>
 *
 * @param {object} params
 * @param {string} params.id - User ID
 * @param {string} [params.email] - User email
 * @param {string} [params.role] - User role
 * @param {number} [durationSec=86400] - Masa berlaku token dalam detik
 * @returns {string}
 */
export function createSignedSessionToken({ id, email = "", role = "DONOR" }, durationSec = 86400) {
  if (!id) {
    throw new Error("User ID wajib disertakan untuk membuat token sesi.");
  }
  const secret = getSessionSecret();
  const validDuration = Number(durationSec) > 0 ? Number(durationSec) : 86400;
  const exp = Date.now() + validDuration * 1000;
  const payloadData = {
    id: String(id),
    email: email ? String(email).toLowerCase().trim() : "",
    role: String(role || "DONOR"),
    exp,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payloadData)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * Memeriksa apakah format string sesuai dengan token sesi bertanda tangan (<payload_b64>.<sig_b64>).
 * @param {string} token
 * @returns {boolean}
 */
export function isSignedSessionTokenFormat(token) {
  if (!token || typeof token !== "string") return false;
  return /^[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}$/.test(token);
}

/**
 * Memverifikasi dan mem-parsing token sesi tertanda tangan.
 * Mengembalikan objek payload jika valid dan belum kedaluwarsa, atau null jika dipalsukan/rusak.
 *
 * @param {string} token
 * @returns {{ id: string, email: string, role: string, exp: number } | null}
 */
export function verifySessionToken(token) {
  if (!isSignedSessionTokenFormat(token)) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return null;
  }

  const [payloadB64, signature] = parts;
  if (!payloadB64 || !signature) {
    return null;
  }

  const secret = getSessionSecret();

  try {
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(payloadB64)
      .digest("base64url");

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const payloadJson = Buffer.from(payloadB64, "base64url").toString("utf-8");
    const payload = JSON.parse(payloadJson);

    if (!payload?.id || !payload?.exp) {
      return null;
    }

    if (Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
