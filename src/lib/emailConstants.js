/**
 * Single Source of Truth (SSOT) untuk konfigurasi, domain tepercaya,
 * blacklist email sementara (disposable), dan filter email peran organisasi.
 * Didesain modular agar dapat dipakai berulang (REUSABLE) di registrasi, checkout donasi, dan kontak.
 */

export const TRUSTED_EMAIL_DOMAINS = Object.freeze([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.id",
  "ymail.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "proton.me",
  "protonmail.com",
  "mail.com",
  "zoho.com",
  "pabe.id",
  "pabe.or.id",
  "payungberkah.id",
]);

export const DISPOSABLE_EMAIL_DOMAINS = Object.freeze(
  new Set([
    "mailinator.com",
    "yopmail.com",
    "yopmail.fr",
    "yopmail.net",
    "guerrillamail.com",
    "guerrillamailblock.com",
    "guerrillamail.net",
    "guerrillamail.org",
    "sharklasers.com",
    "tempmail.com",
    "temp-mail.org",
    "temp-mail.io",
    "10minutemail.com",
    "10minutemail.net",
    "throwawaymail.com",
    "dispostable.com",
    "trashmail.com",
    "trashmail.net",
    "trashmail.me",
    "getairmail.com",
    "mytemp.email",
    "mohmal.com",
    "crazymailing.com",
    "burnermail.io",
    "fakeinbox.com",
    "inboxkitten.com",
    "tempinbox.com",
    "emailondeck.com",
    "generator.email",
    "mailpoof.com",
    "nada.ltd",
    "getnada.com",
    "dropmail.me",
    "maildrop.cc",
    "fakemailgenerator.com",
  ])
);

export const ROLE_BASED_PREFIXES = Object.freeze(
  new Set([
    "admin",
    "administrator",
    "info",
    "support",
    "helpdesk",
    "contact",
    "kontak",
    "sales",
    "billing",
    "keuangan",
    "noreply",
    "no-reply",
    "postmaster",
    "webmaster",
    "marketing",
  ])
);

/**
 * Ekstraksi domain dari string alamat email
 * @param {string} email
 * @returns {string} Domain dalam format huruf kecil tanpa spasi
 */
export function extractEmailDomain(email) {
  if (!email || typeof email !== "string") return "";
  const parts = email.trim().toLowerCase().split("@");
  return parts.length === 2 ? parts[1] : "";
}

/**
 * Mengecek apakah sebuah email menggunakan layanan email sementara (disposable)
 * @param {string} email
 * @returns {boolean}
 */
export function isDisposableEmail(email) {
  const domain = extractEmailDomain(email);
  return Boolean(domain && DISPOSABLE_EMAIL_DOMAINS.has(domain));
}

/**
 * Mengecek apakah sebuah email adalah akun peran fungsional organisasi
 * @param {string} email
 * @returns {boolean}
 */
export function isRoleBasedEmail(email) {
  if (!email || typeof email !== "string") return false;
  const parts = email.trim().toLowerCase().split("@");
  if (parts.length !== 2) return false;
  return ROLE_BASED_PREFIXES.has(parts[0]);
}
