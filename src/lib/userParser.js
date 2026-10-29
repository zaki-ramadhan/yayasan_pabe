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

export { sanitizeEmail, sanitizeStandardText as sanitizeText } from "@/lib/sanitizer";

/**
 * Daftar opsi role untuk pemilihan pengurus yayasan.
 */
export const MANAGEABLE_ROLES = [
  { value: USER_ROLES.ADMIN, label: "Admin yayasan" },
  { value: USER_ROLES.FINANCE, label: "Admin keuangan" },
  { value: USER_ROLES.VOLUNTEER, label: "Relawan lapangan" },
  { value: USER_ROLES.SUPER_ADMIN, label: "Super admin" },
];
