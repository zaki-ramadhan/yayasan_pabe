import { getStorageContext, STORAGE_CONTEXTS } from "./storageConstants";

/**
 * Format tanggal ringkas (YYYYMMDD) untuk pengurutan kronologis berkas di bucket R2.
 * @param {Date} [date]
 * @returns {string}
 */
export function formatDateStamp(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

/**
 * Membersihkan string teks menjadi slug aman untuk penamaan berkas.
 * @param {string} raw
 * @param {number} [maxLength=32]
 * @returns {string}
 */
export function sanitizeFileSlug(raw = "", maxLength = 32) {
  return (raw || "")
    .replace(/\.[^/.]+$/, "") // Hapus ekstensi jika ada
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-") // Ganti karakter selain alfanumerik & underscore
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, maxLength);
}

/**
 * Menghasilkan kunci unik Cloudflare R2 dengan struktur template terstandarisasi.
 * Format: {folder}/{prefix}_{sanitizedIdentifier}_{dateStamp}_{randomHash}.{ext}
 *
 * @param {{
 *   contextKey: string,
 *   identifier?: string,
 *   originalName?: string,
 *   extension: string
 * }} options
 * @returns {string}
 */
export function generateR2Key({ contextKey, identifier = "", originalName = "berkas", extension = "webp" }) {
  const context = getStorageContext(contextKey);
  const dateStamp = formatDateStamp();

  const rawTarget = identifier || originalName || "file";
  const safeTarget = sanitizeFileSlug(rawTarget, 32) || "file";
  const randomHash = Math.random().toString(36).substring(2, 6);
  const cleanExt = extension.replace(/^\.+/, "").toLowerCase();

  return `${context.folder}/${context.prefix}_${safeTarget}_${dateStamp}_${randomHash}.${cleanExt}`;
}

/**
 * Mengekstrak relative key R2 dari URL lengkap CDN atau string key lokal.
 * Mengembalikan null jika URL berasal dari domain pihak ketiga (misal Unsplash).
 *
 * @param {string|null|undefined} urlOrKey
 * @param {string} [publicUrlEnv]
 * @returns {string|null}
 */
export function extractR2Key(urlOrKey, publicUrlEnv = process.env.R2_PUBLIC_URL) {
  if (!urlOrKey || typeof urlOrKey !== "string") return null;

  const trimmed = urlOrKey.trim();
  const validFolders = Object.values(STORAGE_CONTEXTS).map((c) => c.folder);

  // 1. Cek apakah sudah berupa relative key lokal yang valid atau melalui proxy /api/media/
  if (trimmed.startsWith("/api/media/")) {
    const extracted = trimmed.replace(/^\/api\/media\//, "");
    for (const folder of validFolders) {
      if (extracted.startsWith(`${folder}/`)) {
        return extracted;
      }
    }
  }

  for (const folder of validFolders) {
    if (trimmed.startsWith(`${folder}/`)) {
      return trimmed;
    }
  }

  // 2. Cek apakah berupa URL CDN kustom dari konfigurasi .env
  const configuredDomain = (publicUrlEnv || "").replace(/\/+$/, "");
  if (configuredDomain && trimmed.startsWith(configuredDomain)) {
    const extracted = trimmed.slice(configuredDomain.length).replace(/^\/+/, "");
    for (const folder of validFolders) {
      if (extracted.startsWith(`${folder}/`)) {
        return extracted;
      }
    }
  }

  // 3. Cek subdomain bawaan Cloudflare R2 (*.r2.dev atau *.r2.cloudflarestorage.com)
  if (trimmed.includes(".r2.dev/") || trimmed.includes(".r2.cloudflarestorage.com/")) {
    for (const folder of validFolders) {
      const folderMarker = `/${folder}/`;
      const markerIndex = trimmed.indexOf(folderMarker);
      if (markerIndex !== -1) {
        return trimmed.slice(markerIndex + 1);
      }
    }
  }

  return null;
}
