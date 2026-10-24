export * from "./sanitizer";
export * from "./validator";

/**
 * Generate cryptographic or unique idempotency key for transactions
 */
export function generateIdempotencyKey() {
  return "idemp_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 9);
}

/**
 * Sensor email untuk tampilan publik (contoh: budisantoso@gmail.com -> bu***so@gmail.com).
 * Mempertahankan domain agar tetap kredibel dan transparan bagi publik.
 */
export function maskEmail(email) {
  if (!email || typeof email !== "string") return "-";
  const trimmed = email.trim();
  const atIndex = trimmed.indexOf("@");
  if (atIndex === -1) return trimmed;

  const user = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1);

  if (!domain) return trimmed;

  if (user.length <= 2) {
    return `${user[0] || "*"}***@${domain}`;
  }
  if (user.length <= 4) {
    return `${user.slice(0, 1)}***${user.slice(-1)}@${domain}`;
  }
  return `${user.slice(0, 2)}***${user.slice(-2)}@${domain}`;
}

/**
 * Sensor nomor HP/WhatsApp untuk privasi publik (contoh: 081234567890 -> 0812-****-7890).
 */
export function maskPhone(phone) {
  if (!phone || typeof phone !== "string") return "-";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return digits;
  return `${digits.slice(0, 4)}-****-${digits.slice(-4)}`;
}
