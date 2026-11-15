/**
 * Single Source of Truth (SSOT) pemetaan otorisasi rute halaman Admin berdasarkan Role.
 * Digunakan oleh middleware/proxy dan komponen navigasi UI.
 */

export const SUPER_ADMIN_ONLY_PREFIXES = [
  "/admin/pengguna",
  "/admin/pengaturan",
  "/admin/penyimpanan",
];

export const STAFF_ALLOWED_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "FINANCE",
  "VOLUNTEER",
];

/**
 * Memeriksa apakah suatu role berwenang mengakses pathname halaman admin tertentu.
 * @param {string} pathname
 * @param {string|null|undefined} role
 * @returns {boolean}
 */
export function canAccessAdminPath(pathname, role) {
  if (!pathname || !role || !STAFF_ALLOWED_ROLES.includes(role)) {
    return false;
  }

  const cleanPath = pathname.replace(/\/+$/, "") || "/admin";

  const requiresSuperAdmin = SUPER_ADMIN_ONLY_PREFIXES.some(
    (prefix) => cleanPath === prefix || cleanPath.startsWith(`${prefix}/`)
  );

  if (requiresSuperAdmin) {
    return role === "SUPER_ADMIN";
  }

  return true;
}

