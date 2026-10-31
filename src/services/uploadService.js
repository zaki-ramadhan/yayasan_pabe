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
 * @param {{
 *   file: File,
 *   context: string,
 *   identifier?: string,
 *   onProgress?: (percent: number) => void,
 *   signal?: AbortSignal,
 *   timeoutMs?: number
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
export async function uploadFileToServer({
  file,
  context,
  identifier = "",
  onProgress,
  signal,
  timeoutMs: customTimeoutMs,
}) {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    throw new Error("Perangkat Anda sedang offline. Silakan periksa koneksi internet Anda.");
  }

  if (!file) {
    throw new Error("Berkas tidak boleh kosong.");
  }

  if (!context) {
    throw new Error("Konteks pengunggahan (context) wajib disertakan.");
  }

  if (signal?.aborted) {
    throw new Error("Pengunggahan berkas dibatalkan.");
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
  // Toleransi timeout diperlonggar: 60 dtk (berkas normal) dan 180 dtk (video/berkas besar)
  const timeoutMs = customTimeoutMs || (isLargeOrVideo ? 180000 : 60000);

  // Gunakan XMLHttpRequest di peramban untuk melacak transfer byte nyata
  if (typeof window !== "undefined" && typeof window.XMLHttpRequest === "function") {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload", true);
      xhr.withCredentials = true;
      xhr.timeout = timeoutMs;

      // Hubungkan pembatalan via AbortSignal jika disediakan
      if (signal) {
        signal.addEventListener("abort", () => {
          try {
            xhr.abort();
          } catch {
            // Abaikan penanganan jika request sudah tuntas
          }
        });
      }

      if (xhr.upload && typeof onProgress === "function") {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable && event.total > 0) {
            const percent = Math.min(
              100,
              Math.max(0, Math.round((event.loaded / event.total) * 100))
            );
            onProgress(percent);
          }
        });
      }

      xhr.addEventListener("load", () => {
        try {
          const result = JSON.parse(xhr.responseText || "{}");
          if (xhr.status >= 200 && xhr.status < 300 && result.success) {
            if (typeof onProgress === "function") {
              onProgress(100);
            }
            resolve(result.data);
          } else {
            reject(
              new Error(
                result.message || `Gagal mengunggah berkas ke server (Kode: ${xhr.status}).`
              )
            );
          }
        } catch {
          reject(
            new Error(
              `Respon server tidak valid saat mengunggah berkas (Kode: ${xhr.status}).`
            )
          );
        }
      });

      xhr.addEventListener("error", () => {
        reject(
          new Error("Koneksi jaringan terputus saat mengunggah berkas. Periksa internet Anda.")
        );
      });

      xhr.addEventListener("timeout", () => {
        reject(
          new Error(
            "Waktu pengunggahan habis (timeout). Berkas terlalu besar atau koneksi lambat. Silakan coba kembali."
          )
        );
      });

      xhr.addEventListener("abort", () => {
        reject(new Error("Pengunggahan berkas dibatalkan."));
      });

      xhr.send(formData);
    });
  }

  // Fallback ke safeFetch jika di luar peramban
  const response = await safeFetch("/api/upload", {
    method: "POST",
    body: formData,
    signal,
  }, timeoutMs);

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal mengunggah berkas ke server.");
  }

  if (typeof onProgress === "function") {
    onProgress(100);
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

/**
 * Menyelesaikan URL berkas untuk kebutuhan simpan data (Deferred Upload).
 * Jika nilai berupa objek File peramban, unggah ke Cloudflare R2 via uploadFileToServer.
 * Jika nilai sudah berupa string URL (atau null/kosong), kembalikan langsung tanpa transmisi jaringan.
 *
 * @param {File|string|null} fileOrUrl - Objek berkas lokal atau URL berkas yang sudah ada
 * @param {{
 *   context: string,
 *   identifier?: string,
 *   onProgress?: (percent: number) => void,
 *   signal?: AbortSignal,
 *   timeoutMs?: number
 * }} options
 * @returns {Promise<string>} URL berkas final di Cloudflare R2 atau string URL asal
 */
export async function resolveFileUrl(fileOrUrl, { context, identifier = "", onProgress, signal, timeoutMs } = {}) {
  if (typeof window !== "undefined" && fileOrUrl instanceof File) {
    const res = await uploadFileToServer({
      file: fileOrUrl,
      context,
      identifier,
      onProgress,
      signal,
      timeoutMs,
    });
    return res?.url || "";
  }

  return typeof fileOrUrl === "string" ? fileOrUrl.trim() : "";
}

/**
 * Menghapus berkas dari Cloudflare R2 secara reaktif via endpoint /api/upload.
 *
 * @param {string|string[]} urlOrUrls - Tautan URL berkas R2 atau array URL
 * @returns {Promise<boolean>}
 */
export async function deleteFileFromServer(urlOrUrls) {
  if (!urlOrUrls) return false;
  const urls = Array.isArray(urlOrUrls) ? urlOrUrls.filter(Boolean) : [urlOrUrls].filter(Boolean);
  if (urls.length === 0) return false;

  try {
    const res = await fetch("/api/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls }),
    });
    const data = await res.json().catch(() => null);
    return Boolean(data?.success);
  } catch (err) {
    console.warn("Peringatan: Gagal menghapus berkas sementara dari server:", err?.message);
    return false;
  }
}

/**
 * Mengirimkan sinyal penghapusan berkas sementara ke server saat peramban ditutup.
 *
 * @param {string|string[]} urlOrUrls - Tautan URL berkas R2 atau array URL
 */
export function sendBeaconDelete(urlOrUrls) {
  if (typeof window === "undefined" || !navigator.sendBeacon || !urlOrUrls) return;
  const urls = Array.isArray(urlOrUrls) ? urlOrUrls.filter(Boolean) : [urlOrUrls].filter(Boolean);
  if (urls.length === 0) return;

  try {
    const blob = new Blob([JSON.stringify({ urls })], { type: "application/json" });
    navigator.sendBeacon("/api/upload", blob);
  } catch {
    // Abaikan kegagalan pengiriman beacon
  }
}
