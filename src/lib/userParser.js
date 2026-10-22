import { USER_ROLES } from "@/services/authService";

/**
 * Format nomor telepon Indonesia menjadi standar tampilan yang rapi (contoh: 0812-3456-7890).
 * @param {string} phone
 * @returns {string}
 */
export function formatPhoneNumber(phone) {
  if (!phone || typeof phone !== "string") return "-";
  const cleaned = phone.replace(/\D/g, "");

  let normalized = cleaned;
  if (normalized.startsWith("62")) {
    normalized = "0" + normalized.slice(2);
  }

  if (normalized.length >= 10 && normalized.length <= 13) {
    if (normalized.length === 10) {
      return `${normalized.slice(0, 4)}-${normalized.slice(4, 7)}-${normalized.slice(7)}`;
    }
    if (normalized.length === 11) {
      return `${normalized.slice(0, 4)}-${normalized.slice(4, 7)}-${normalized.slice(7)}`;
    }
    if (normalized.length === 12) {
      return `${normalized.slice(0, 4)}-${normalized.slice(4, 8)}-${normalized.slice(8)}`;
    }
    return `${normalized.slice(0, 4)}-${normalized.slice(4, 8)}-${normalized.slice(8)}`;
  }

  return phone.trim();
}

/**
 * Sanitasi dan normalisasi nomor telepon input murni angka berawalan 08.
 * @param {string} phone
 * @returns {string}
 */
export function sanitizePhoneInput(phone) {
  if (!phone || typeof phone !== "string") return "";
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("62")) {
    digits = "0" + digits.slice(2);
  }
  return digits;
}

/**
 * Normalisasi email murni (lowercase & auto-trim).
 * @param {string} email
 * @returns {string}
 */
export function sanitizeEmail(email) {
  if (!email || typeof email !== "string") return "";
  return email.trim().toLowerCase();
}

/**
 * Sanitasi teks umum (nama, gelar) tanpa spasi ganda.
 * @param {string} text
 * @returns {string}
 */
export function sanitizeText(text) {
  if (!text || typeof text !== "string") return "";
  return text.trim().replace(/\s+/g, " ");
}

/**
 * Daftar opsi role untuk pemilihan pengurus yayasan.
 */
export const MANAGEABLE_ROLES = [
  { value: USER_ROLES.ADMIN, label: "Admin yayasan" },
  { value: USER_ROLES.FINANCE, label: "Admin keuangan" },
  { value: USER_ROLES.VOLUNTEER, label: "Relawan lapangan" },
  { value: USER_ROLES.SUPER_ADMIN, label: "Super admin" },
];
