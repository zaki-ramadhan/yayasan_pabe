/**
 * Helper fetch dengan proteksi timeout (AbortController) dan pesan error jaringan yang ramah.
 * Mencegah aplikasi menggantung (infinite loading) saat koneksi pengguna bermasalah/RTO.
 *
 * @param {string} url - Target URL endpoint
 * @param {RequestInit} [options={}] - Opsi request standar fetch
 * @param {number} [timeoutMs=12000] - Batas waktu dalam milidetik (default 12 detik)
 * @returns {Promise<Response>}
 */
export async function safeFetch(url, options = {}, timeoutMs = 12000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      credentials: options.credentials || "same-origin",
      ...options,
      signal: options.signal || controller.signal,
    });
    return res;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Waktu permintaan habis (timeout). Periksa kestabilan koneksi internet Anda.");
    }
    if (err instanceof TypeError && err.message.includes("fetch")) {
      throw new Error("Koneksi terputus. Pastikan perangkat Anda terhubung ke internet.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
