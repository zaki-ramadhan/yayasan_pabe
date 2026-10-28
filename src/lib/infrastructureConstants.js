/**
 * Whitelist email pengembang / pemilik infrastruktur yang berhak mengakses
 * relay console teknis (Cloudflare R2, Google Cloud OAuth, Meta Developers OAuth).
 */
export const INFRASTRUCTURE_EMAILS = [
  "zakiram4dhan@gmail.com",
  "piscokpiscok2610@gmail.com",
];

/**
 * Validasi apakah email tertentu terdaftar dalam whitelist infrastruktur.
 * @param {string} email
 * @returns {boolean}
 */
export function isInfrastructureEmail(email) {
  if (!email || typeof email !== "string") return false;
  return INFRASTRUCTURE_EMAILS.includes(email.toLowerCase().trim());
}
