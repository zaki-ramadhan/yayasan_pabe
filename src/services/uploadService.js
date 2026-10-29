/**
 * Layanan komunikasi klien untuk pengunggahan berkas ke API /api/upload.
 * Memisahkan logika jaringan, pembuatan FormData, dan sanitasi respon dari komponen UI.
 */
import { safeFetch } from "@/lib/safeFetch";

/**
 * Mengunggah berkas ke server R2 melalui endpoint /api/upload.
 *
 * @param {{
 *   file: File,
 *   context: string,
 *   identifier?: string
 * }} params
 * @returns {Promise<{
 *   url: string,
 *   key: string,
 *   mimeType: string,
 *   size: number,
 *   originalSize: number,
 *   savingsPercent: number
 * }>}
 */
export async function uploadFileToServer({ file, context, identifier = "" }) {
  if (!file) {
    throw new Error("Berkas tidak boleh kosong.");
  }

  if (!context) {
    throw new Error("Konteks pengunggahan (context) wajib disertakan.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("context", context);

  if (identifier && typeof identifier === "string") {
    formData.append("identifier", identifier.trim());
  }

  const isLargeOrVideo = Boolean(
    file &&
    (file.size > 5 * 1024 * 1024 || (file.type && file.type.startsWith("video/")))
  );
  const timeoutMs = isLargeOrVideo ? 90000 : 30000;

  const response = await safeFetch("/api/upload", {
    method: "POST",
    body: formData,
  }, timeoutMs);

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal mengunggah berkas ke server.");
  }

  return result.data;
}

/**
 * Mengunduh gambar dari tautan web eksternal dan menyimpannya ke Cloudflare R2 via API /api/upload.
 *
 * @param {{
 *   imageUrl: string,
 *   context: string,
 *   identifier?: string
 * }} params
 * @returns {Promise<{
 *   url: string,
 *   key: string,
 *   mimeType: string,
 *   size: number,
 *   originalSize: number,
 *   savingsPercent: number
 * }>}
 */
export async function uploadImageUrlToServer({ imageUrl, context, identifier = "" }) {
  if (!imageUrl || typeof imageUrl !== "string") {
    throw new Error("Tautan gambar tidak boleh kosong.");
  }

  if (!context) {
    throw new Error("Konteks pengunggahan (context) wajib disertakan.");
  }

  const formData = new FormData();
  formData.append("imageUrl", imageUrl.trim());
  formData.append("context", context);

  if (identifier && typeof identifier === "string") {
    formData.append("identifier", identifier.trim());
  }

  const response = await safeFetch("/api/upload", {
    method: "POST",
    body: formData,
  }, 30000);

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal mengunduh gambar dari tautan.");
  }

  return result.data;
}
