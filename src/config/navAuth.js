/**
 * Konfigurasi dan SSOT Label Tombol Masuk / Login
 * Menggunakan teks seragam "Masuk Akun" yang jelas, simpel, dan profesional di semua halaman
 */

export const DEFAULT_NAV_AUTH_CONFIG = {
  label: "Masuk Akun",
  shortLabel: "Masuk Akun",
  mobileLabel: "Masuk Akun",
  ariaLabel: "Masuk ke akun Yayasan PABE",
};

/**
 * Menghasilkan konfigurasi teks tombol login berdasarkan pathname saat ini
 * @param {string|null|undefined} pathname - Path URL aktif
 * @returns {object} Konfigurasi label, ariaLabel, dan target redirect login
 */
export function getNavAuthButtonConfig(pathname) {
  const currentPath = typeof pathname === "string" ? pathname.toLowerCase() : "";

  const isAuthPage =
    currentPath.startsWith("/login") ||
    currentPath.startsWith("/register") ||
    currentPath.startsWith("/reset-password");

  const redirectParam =
    !isAuthPage && currentPath && currentPath !== "/"
      ? `?redirect=${encodeURIComponent(pathname)}`
      : "";

  return {
    ...DEFAULT_NAV_AUTH_CONFIG,
    href: `/login${redirectParam}`,
  };
}
