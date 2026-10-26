import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { validateUploadFile, FILE_UPLOAD_LIMITS } from "./fileValidator";
import { getStorageContext } from "./storageConstants";
import { generateR2Key, extractR2Key } from "./r2KeyUtils";
import { optimizeImageIfNeeded } from "./imageOptimizer";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME || "ypabe-storage";
const publicUrl = (process.env.R2_PUBLIC_URL || "").replace(/\/+$/, "");

/**
 * Memeriksa kelengkapan konfigurasi Cloudflare R2 di environment server.
 * @returns {boolean}
 */
export function isR2Configured() {
  return Boolean(accountId && accessKeyId && secretAccessKey && publicUrl);
}

/**
 * Singleton client S3 untuk koneksi Cloudflare R2.
 */
let r2ClientInstance = null;

function getR2Client() {
  if (!r2ClientInstance) {
    if (!isR2Configured()) {
      throw new Error(
        "Kredensial Cloudflare R2 belum lengkap di .env (periksa R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_PUBLIC_URL)."
      );
    }

    r2ClientInstance = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  return r2ClientInstance;
}

/**
 * Mengunggah data buffer/Uint8Array ke Cloudflare R2.
 * Mengorkestrasi validasi magic bytes, kompresi gambar, dan penamaan kunci terstandarisasi.
 *
 * @param {{
 *   data: Uint8Array|ArrayBuffer|Buffer,
 *   originalName?: string,
 *   declaredType?: string,
 *   context?: string,
 *   identifier?: string,
 *   folder?: string,
 *   maxBytes?: number,
 *   allowedTypes?: string[],
 *   optimize?: boolean,
 *   maxWidth?: number,
 *   quality?: number
 * }} options
 * @returns {Promise<{
 *   success: boolean,
 *   url: string,
 *   key: string,
 *   mimeType: string,
 *   size: number,
 *   originalSize: number,
 *   savingsPercent: number
 * }>}
 */
export async function uploadToR2({
  data,
  originalName = "berkas",
  declaredType,
  context,
  identifier = "",
  folder,
  maxBytes,
  allowedTypes,
  optimize,
  maxWidth,
  quality,
}) {
  const uint8 = data instanceof Uint8Array ? data : new Uint8Array(data);
  const originalSize = uint8.byteLength;

  // Resolusi profil konteks penyimpanan jika disediakan
  let resolvedContext = null;
  if (context) {
    resolvedContext = getStorageContext(context);
  }

  const effectiveAllowedTypes =
    allowedTypes || (resolvedContext ? resolvedContext.allowedTypes : FILE_UPLOAD_LIMITS.ALLOWED_DOCUMENT_TYPES);
  const effectiveMaxBytes =
    maxBytes || (resolvedContext ? resolvedContext.maxBytes : FILE_UPLOAD_LIMITS.DEFAULT_MAX_BYTES);
  const effectiveOptimize =
    optimize !== undefined ? optimize : (resolvedContext ? resolvedContext.optimize : true);
  const effectiveMaxWidth =
    maxWidth || (resolvedContext ? resolvedContext.maxWidth : 1920);
  const effectiveQuality =
    quality || (resolvedContext ? resolvedContext.quality : 85);

  // 1. Validasi Magic Bytes & Integritas File Mentah
  const validation = validateUploadFile({
    data: uint8,
    size: originalSize,
    declaredType,
    maxBytes: effectiveMaxBytes,
    allowedTypes: effectiveAllowedTypes,
  });

  if (!validation.valid) {
    throw new Error(validation.error || "Berkas tidak valid.");
  }

  const verifiedMime = validation.verifiedMime;

  // 2. Optimasi Gambar melalui Image Optimizer Service
  let uploadBuffer = Buffer.isBuffer(uint8) ? uint8 : Buffer.from(uint8);
  let finalMime = verifiedMime;
  let finalExtension = "bin";

  if (effectiveOptimize) {
    const optResult = await optimizeImageIfNeeded(uploadBuffer, verifiedMime, {
      maxWidth: effectiveMaxWidth,
      quality: effectiveQuality,
    });
    uploadBuffer = optResult.buffer;
    finalMime = optResult.mimeType;
    finalExtension = optResult.extension;
  } else {
    const EXT_MAP = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "application/pdf": "pdf",
    };
    finalExtension = EXT_MAP[verifiedMime] || "bin";
  }

  const finalSize = uploadBuffer.byteLength;
  const savingsPercent =
    originalSize > 0 && finalSize < originalSize
      ? Math.round(((originalSize - finalSize) / originalSize) * 100)
      : 0;

  // 3. Bangun Kunci R2 Unik (Delegasi ke Key Utils)
  let key = "";
  if (context) {
    key = generateR2Key({
      contextKey: context,
      identifier,
      originalName,
      extension: finalExtension,
    });
  } else {
    const safeBase = originalName
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .slice(0, 32);

    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const cleanFolder = (folder || "uploads").replace(/^\/+|\/+$/g, "");
    key = `${cleanFolder}/${timestamp}_${safeBase}_${randomSuffix}.${finalExtension}`;
  }

  // 4. Kirim Objek ke Cloudflare R2 S3 API
  const client = getR2Client();
  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: uploadBuffer,
      ContentType: finalMime,
      CacheControl: "public, max-age=31536000, immutable", // Cache 1 tahun di CDN edge
    })
  );

  const finalUrl = `${publicUrl}/${key}`;

  return {
    success: true,
    url: finalUrl,
    key,
    mimeType: finalMime,
    size: finalSize,
    originalSize,
    savingsPercent,
  };
}

/**
 * Menghapus berkas dari Cloudflare R2 menggunakan key relatif atau URL lengkap CDN.
 * Secara otomatis mengekstrak key internal dan mengabaikan URL luar (misal Unsplash).
 *
 * @param {string} urlOrKey
 */
export async function deleteFromR2(urlOrKey) {
  if (!urlOrKey || typeof urlOrKey !== "string") return;

  const key = extractR2Key(urlOrKey, publicUrl) || (urlOrKey.includes("/") && !urlOrKey.startsWith("http") ? urlOrKey : null);
  if (!key) return;

  try {
    const client = getR2Client();
    await client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );
  } catch (err) {
    console.warn(`Peringatan: Gagal menghapus berkas R2 [${key}]:`, err?.message);
  }
}
