/**
 * Utility client-safe untuk format identitas relawan yayasan
 */

/**
 * Format nomor registrasi resmi relawan yayasan
 * Contoh: REL-2026-0042
 */
export function formatVolunteerId(id = "", dateInput = null) {
  const year = dateInput ? new Date(dateInput).getFullYear() : new Date().getFullYear();
  const cleanId = String(id).replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const suffix = cleanId.slice(-4).padStart(4, "0");
  return `REL-${year}-${suffix}`;
}
