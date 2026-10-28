import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
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
      "video/mp4": "mp4",
      "video/webm": "webm",
      "video/quicktime": "mov",
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

  // Gunakan proxy lokal /api/media/ jika publicUrl menggunakan *.r2.dev bawaan yang diblokir ISP Indonesia
  const isBlockedDevDomain = publicUrl.includes(".r2.dev");
  const finalUrl = isBlockedDevDomain || !publicUrl ? `/api/media/${key}` : `${publicUrl}/${key}`;

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

/**
 * Membaca daftar objek di Cloudflare R2 berdasarkan prefix folder.
 *
 * @param {{
 *   prefix?: string,
 *   maxKeys?: number,
 *   continuationToken?: string,
 * }} [options]
 * @returns {Promise<{
 *   objects: Array<{ key: string, size: number, lastModified: Date, etag: string, url: string }>,
 *   isTruncated: boolean,
 *   nextContinuationToken?: string,
 * }>}
 */
export async function listR2Objects({ prefix = "", maxKeys = 1000, continuationToken } = {}) {
  if (!isR2Configured()) {
    return { objects: [], isTruncated: false };
  }

  try {
    const client = getR2Client();
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
      MaxKeys: maxKeys,
      ContinuationToken: continuationToken,
    });

    const response = await client.send(command);
    const isBlockedDevDomain = publicUrl.includes(".r2.dev");

    const contents = (response.Contents || []).map((item) => ({
      key: item.Key,
      size: item.Size || 0,
      lastModified: item.LastModified || new Date(),
      etag: item.ETag || "",
      url: isBlockedDevDomain || !publicUrl ? `/api/media/${item.Key}` : `${publicUrl}/${item.Key}`,
    }));

    return {
      objects: contents,
      isTruncated: Boolean(response.IsTruncated),
      nextContinuationToken: response.NextContinuationToken,
    };
  } catch (err) {
    console.error("Gagal membaca daftar objek Cloudflare R2:", err.message);
    return { objects: [], isTruncated: false };
  }
}

/**
 * Menghapus banyak berkas sekaligus dari Cloudflare R2 (Batch Delete).
 *
 * @param {string[]} keysOrUrls
 * @returns {Promise<{ success: boolean, deletedCount: number, errors: string[] }>}
 */
export async function deleteMultipleFromR2(keysOrUrls) {
  if (!Array.isArray(keysOrUrls) || keysOrUrls.length === 0) {
    return { success: true, deletedCount: 0, errors: [] };
  }

  const validKeys = Array.from(
    new Set(
      keysOrUrls
        .map((target) => extractR2Key(target, publicUrl) || (target.includes("/") && !target.startsWith("http") ? target : null))
        .filter(Boolean)
    )
  );

  if (validKeys.length === 0) {
    return { success: true, deletedCount: 0, errors: [] };
  }

  try {
    const client = getR2Client();
    const command = new DeleteObjectsCommand({
      Bucket: bucketName,
      Delete: {
        Objects: validKeys.map((Key) => ({ Key })),
        Quiet: false,
      },
    });

    const response = await client.send(command);
    const deletedCount = response.Deleted?.length || validKeys.length;
    const errors = (response.Errors || []).map((err) => `${err.Key}: ${err.Message}`);

    return {
      success: errors.length === 0,
      deletedCount,
      errors,
    };
  } catch (err) {
    console.error("Gagal menghapus batch berkas di R2:", err.message);
    // Fallback: hapus satuan jika batch command gagal
    let successCount = 0;
    const fallbackErrors = [];
    for (const key of validKeys) {
      try {
        await deleteFromR2(key);
        successCount++;
      } catch (singleErr) {
        fallbackErrors.push(`${key}: ${singleErr.message}`);
      }
    }
    return {
      success: fallbackErrors.length === 0,
      deletedCount: successCount,
      errors: fallbackErrors,
    };
  }
}
