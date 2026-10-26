import sharp from "sharp";

/**
 * Pipeline pemrosesan dan optimasi gambar menggunakan Sharp.
 * - Auto-orientasi sensor kamera (EXIF rotate)
 * - Skala proporsional tanpa pembesaran paksa (withoutEnlargement)
 * - Kompresi Google WebP efisien (kualitas tinggi, ukuran hemat)
 * - Penanganan berkas non-gambar (misal dokumen PDF murni apa adanya)
 *
 * @param {Uint8Array|Buffer} buffer
 * @param {string} mimeType
 * @param {{ maxWidth?: number, quality?: number }} [options]
 * @returns {Promise<{ buffer: Buffer, mimeType: string, extension: string, isOptimized: boolean }>}
 */
export async function optimizeImageIfNeeded(
  buffer,
  mimeType,
  { maxWidth = 1920, quality = 85 } = {}
) {
  const isImage =
    mimeType === "image/jpeg" || mimeType === "image/png" || mimeType === "image/webp";

  // Pertahankan dokumen PDF dan berkas non-gambar murni apa adanya
  if (!isImage) {
    return {
      buffer: Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer),
      mimeType,
      extension: mimeType === "application/pdf" ? "pdf" : "bin",
      isOptimized: false,
    };
  }

  try {
    const rawBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
    const optimizedBuffer = await sharp(rawBuffer)
      .rotate() // Auto-orient berdasarkan EXIF sensor kamera ponsel
      .resize({
        width: maxWidth,
        withoutEnlargement: true, // Cegah gambar kecil dipaksa pecah/buram
        fit: "inside",
      })
      .webp({
        quality,
        effort: 4,
      })
      .toBuffer();

    return {
      buffer: optimizedBuffer,
      mimeType: "image/webp",
      extension: "webp",
      isOptimized: true,
    };
  } catch {
    // Fallback aman: jika stream gambar rusak, pertahankan buffer asli
    const EXT_MAP = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    return {
      buffer: Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer),
      mimeType,
      extension: EXT_MAP[mimeType] || "jpg",
      isOptimized: false,
    };
  }
}
