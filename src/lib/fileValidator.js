/**
 * Reusable File Upload Validator.
 * Pure Node.js & Web standard Buffer inspection.
 * Zero external library, zero overhead (< 0.1ms execution).
 */

export const FILE_UPLOAD_LIMITS = {
  DEFAULT_MAX_BYTES: 3 * 1024 * 1024, // 3 Megabytes
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
  ALLOWED_DOCUMENT_TYPES: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
};

/**
 * Checks file magic bytes (file signature) to prevent malicious files disguised with fake extensions.
 * @param {Uint8Array} bytes
 * @returns {string|null} Detected MIME type or null if unrecognized
 */
export function detectMagicBytesMime(bytes) {
  if (!bytes || bytes.length < 4) return null;

  // JPEG signature: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }

  // PNG signature: 89 50 4E 47 (0x89 'P' 'N' 'G')
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }

  // PDF signature: 25 50 44 46 ('%PDF')
  if (
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46
  ) {
    return "application/pdf";
  }

  // WebP signature: 'RIFF' .... 'WEBP'
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 && // R
    bytes[1] === 0x49 && // I
    bytes[2] === 0x46 && // F
    bytes[3] === 0x46 && // F
    bytes[8] === 0x57 && // W
    bytes[9] === 0x45 && // E
    bytes[10] === 0x42 && // B
    bytes[11] === 0x50 // P
  ) {
    return "image/webp";
  }

  return null;
}

/**
 * Validates an uploaded file (Blob / File / Uint8Array).
 * @param {{
 *   data: Uint8Array|ArrayBuffer,
 *   size: number,
 *   declaredType?: string,
 *   maxBytes?: number,
 *   allowedTypes?: string[]
 * }} options
 * @returns {{ valid: boolean, error?: string, verifiedMime?: string }}
 */
export function validateUploadFile({
  data,
  size,
  declaredType,
  maxBytes = FILE_UPLOAD_LIMITS.DEFAULT_MAX_BYTES,
  allowedTypes = FILE_UPLOAD_LIMITS.ALLOWED_DOCUMENT_TYPES,
}) {
  if (!data || size === undefined || size === null) {
    return { valid: false, error: "File tidak ditemukan atau kosong." };
  }

  if (size <= 0) {
    return { valid: false, error: "Ukuran file tidak valid (0 bytes)." };
  }

  if (size > maxBytes) {
    const maxMb = Math.round(maxBytes / (1024 * 1024));
    return {
      valid: false,
      error: `Ukuran file melebihi batas maksimal ${maxMb}MB.`,
    };
  }

  const uint8 = data instanceof Uint8Array ? data : new Uint8Array(data);
  const detectedMime = detectMagicBytesMime(uint8);

  if (!detectedMime) {
    return {
      valid: false,
      error: "Format file tidak dikenali atau rusak. Hanya format JPEG, PNG, WebP, dan PDF yang diizinkan.",
    };
  }

  if (!allowedTypes.includes(detectedMime)) {
    return {
      valid: false,
      error: `Format berkas (${detectedMime}) tidak diizinkan.`,
    };
  }

  // Jika declaredType ada, pastikan tidak bertentangan secara ekstrim (misal mengklaim image tapi isinya pdf)
  if (declaredType && declaredType !== detectedMime && declaredType !== "application/octet-stream") {
    // Normalisasi image/jpg vs image/jpeg
    const isJpgMismatch =
      (declaredType === "image/jpg" && detectedMime === "image/jpeg") ||
      (declaredType === "image/pjpeg" && detectedMime === "image/jpeg");

    if (!isJpgMismatch) {
      return {
        valid: false,
        error: "Isi file tidak sesuai dengan ekstensi berkas yang diunggah.",
      };
    }
  }

  return { valid: true, verifiedMime: detectedMime };
}
