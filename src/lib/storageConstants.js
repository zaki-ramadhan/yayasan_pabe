import { USER_ROLES } from "@/services/authService";

// Batas kuota gratis Cloudflare R2 bulanan (10 Gigabytes)
export const R2_FREE_TIER_BYTES = 10 * 1024 * 1024 * 1024;

/**
 * Status kesehatan kapasitas penyimpanan Cloudflare R2.
 */
export const STORAGE_STATUS = Object.freeze({
  NORMAL: "NORMAL",
  WARNING: "WARNING",
  CRITICAL: "CRITICAL",
});

/**
 * Ambang batas persentase kuota Cloudflare R2 (Free Tier 10 GB).
 */
export const STORAGE_THRESHOLDS = Object.freeze({
  WARNING_PERCENT: 80,
  CRITICAL_PERCENT: 95,
});

/**
 * Menghitung status kesehatan kapasitas penyimpanan Cloudflare R2 secara deterministik.
 * @param {number} totalBytes - Total ukuran berkas tersimpan
 * @param {number} [limitBytes=R2_FREE_TIER_BYTES] - Batas kapasitas penyimpanan
 * @returns {{
 *   status: keyof typeof STORAGE_STATUS,
 *   usagePercent: number,
 *   isWarning: boolean,
 *   isCritical: boolean,
 *   remainingBytes: number
 * }}
 */
export function calculateStorageHealth(totalBytes = 0, limitBytes = R2_FREE_TIER_BYTES) {
  const safeTotal = Math.max(0, Number(totalBytes) || 0);
  const safeLimit = Math.max(1, Number(limitBytes) || R2_FREE_TIER_BYTES);
  const usagePercent = Math.min(100, Number(((safeTotal / safeLimit) * 100).toFixed(2)));
  const remainingBytes = Math.max(0, safeLimit - safeTotal);

  let status = STORAGE_STATUS.NORMAL;
  if (usagePercent >= STORAGE_THRESHOLDS.CRITICAL_PERCENT) {
    status = STORAGE_STATUS.CRITICAL;
  } else if (usagePercent >= STORAGE_THRESHOLDS.WARNING_PERCENT) {
    status = STORAGE_STATUS.WARNING;
  }

  return {
    status,
    usagePercent,
    isWarning: status === STORAGE_STATUS.WARNING,
    isCritical: status === STORAGE_STATUS.CRITICAL,
    remainingBytes,
  };
}

/**
 * Konfigurasi terpusat konteks penyimpanan Cloudflare R2.
 * Menentukan folder target, prefix nama berkas, profil optimasi gambar, batas ukuran berkas,
 * format yang diizinkan, serta otorisasi peran (RBAC).
 */
export const STORAGE_CONTEXTS = {
  ARTICLE_BANNER: {
    folder: "articles/banners",
    prefix: "art-banner",
    maxWidth: 1920,
    quality: 85,
    optimize: true,
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    maxBytes: 10 * 1024 * 1024, // 10MB
    allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN],
  },
  ARTICLE_CONTENT: {
    folder: "articles/content",
    prefix: "art-inline",
    maxWidth: 1400,
    quality: 82,
    optimize: true,
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    maxBytes: 8 * 1024 * 1024, // 8MB
    allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN],
  },
  CAMPAIGN_BANNER: {
    folder: "campaigns/banners",
    prefix: "prog-banner",
    maxWidth: 1920,
    quality: 85,
    optimize: true,
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    maxBytes: 10 * 1024 * 1024, // 10MB
    allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN],
  },
  CAMPAIGN_UPDATE: {
    folder: "campaigns/updates",
    prefix: "prog-lpj",
    maxWidth: 1200,
    quality: 80,
    optimize: true,
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    maxBytes: 8 * 1024 * 1024, // 8MB
    allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.VOLUNTEER],
  },
  CAMPAIGN_UPDATE_VIDEO: {
    folder: "campaigns/videos",
    prefix: "prog-vid",
    optimize: false,
    allowedTypes: ["video/mp4", "video/webm", "video/quicktime"],
    maxBytes: 25 * 1024 * 1024, // 25MB
    allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.VOLUNTEER],
  },
  AUDIT_REPORT: {
    folder: "reports/audit",
    prefix: "audit-rep",
    optimize: false,
    allowedTypes: ["application/pdf"],
    maxBytes: 15 * 1024 * 1024, // 15MB
    allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.FINANCE],
  },
  USER_AVATAR: {
    folder: "users/avatars",
    prefix: "user-avatar",
    maxWidth: 400,
    quality: 80,
    optimize: true,
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    maxBytes: 2 * 1024 * 1024, // 2MB
    allowedRoles: [], // Terbuka untuk semua user terotentikasi
  },
  CAREER_RESUME: {
    folder: "careers/resumes",
    prefix: "job-cv",
    optimize: false,
    allowedTypes: ["application/pdf"],
    maxBytes: 5 * 1024 * 1024, // 5MB
    allowedRoles: null, // Terbuka untuk umum (pelamar kerja tanpa akun)
  },
  GALLERY: {
    folder: "gallery",
    prefix: "gal-doc",
    maxWidth: 1400,
    quality: 85,
    optimize: true,
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    maxBytes: 10 * 1024 * 1024, // 10MB
    allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN],
  },
  GALLERY_VIDEO: {
    folder: "gallery/videos",
    prefix: "gal-vid",
    optimize: false,
    allowedTypes: ["video/mp4", "video/webm", "video/quicktime"],
    maxBytes: 25 * 1024 * 1024, // 25MB
    allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN],
  },
  INSTAGRAM: {
    folder: "instagram",
    prefix: "ig-media",
    maxWidth: 1400,
    quality: 85,
    optimize: true,
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    maxBytes: 10 * 1024 * 1024, // 10MB
    allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN],
  },
};

/**
 * Validasi ketat nama konteks penyimpanan untuk mencegah injeksi folder sembarangan.
 * @param {string} contextKey
 * @returns {typeof STORAGE_CONTEXTS[keyof typeof STORAGE_CONTEXTS]}
 */
export function getStorageContext(contextKey) {
  if (!contextKey || typeof contextKey !== "string") {
    throw new Error("Parameter konteks penyimpanan (context) wajib disertakan.");
  }

  const normalized = contextKey.trim().toUpperCase();
  const context = STORAGE_CONTEXTS[normalized];

  if (!context) {
    const validKeys = Object.keys(STORAGE_CONTEXTS).join(", ");
    throw new Error(`Konteks penyimpanan '${contextKey}' tidak valid. Pilihan yang diizinkan: ${validKeys}`);
  }

  return context;
}

// Re-export utilitas penamaan kunci agar modul lama tetap kompatibel tanpa duplikasi
export { generateR2Key, extractR2Key, formatDateStamp, sanitizeFileSlug } from "./r2KeyUtils";
