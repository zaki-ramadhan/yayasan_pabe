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

  // WebM / EBML signature: 1A 45 DF A3
  if (
    bytes[0] === 0x1a &&
    bytes[1] === 0x45 &&
    bytes[2] === 0xdf &&
    bytes[3] === 0xa3
  ) {
    return "video/webm";
  }

  // MP4 / MOV signature: ....ftyp (offset 4)
  if (
    bytes.length >= 8 &&
    bytes[4] === 0x66 && // f
    bytes[5] === 0x74 && // t
    bytes[6] === 0x79 && // y
    bytes[7] === 0x70 // p
  ) {
    if (
      bytes.length >= 12 &&
      bytes[8] === 0x71 && // q
      bytes[9] === 0x74 // t
    ) {
      return "video/quicktime";
    }
    return "video/mp4";
  }

  // QuickTime classic moov signature: ....moov
  if (
    bytes.length >= 8 &&
    bytes[4] === 0x6d && // m
    bytes[5] === 0x6f && // o
    bytes[6] === 0x6f && // o
    bytes[7] === 0x76 // v
  ) {
    return "video/quicktime";
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
      error: "Format berkas tidak dikenali atau rusak. Hanya format JPEG, PNG, WebP, PDF, dan Video (MP4/WebM/MOV) yang didukung.",
    };
  }

  if (!allowedTypes.includes(detectedMime)) {
    return {
      valid: false,
      error: `Format berkas (${detectedMime}) tidak diizinkan.`,
    };
  }

  // Jika declaredType ada, pastikan tidak bertentangan secara ekstrim (misal mengklaim image tapi isinya video)
  if (declaredType && declaredType !== detectedMime && declaredType !== "application/octet-stream") {
    // Normalisasi image/jpg vs image/jpeg
    const isJpgMismatch =
      (declaredType === "image/jpg" && detectedMime === "image/jpeg") ||
      (declaredType === "image/pjpeg" && detectedMime === "image/jpeg");

    // Normalisasi video/mp4 vs video/quicktime (kontainer MP4/MOV serupa)
    const isVideoCrossFormat =
      (declaredType === "video/quicktime" && detectedMime === "video/mp4") ||
      (declaredType === "video/mp4" && detectedMime === "video/quicktime");

    if (!isJpgMismatch && !isVideoCrossFormat) {
      return {
        valid: false,
        error: "Isi berkas tidak sesuai dengan tipe berkas yang diunggah.",
      };
    }
  }

  return { valid: true, verifiedMime: detectedMime };
}
