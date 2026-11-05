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

  const headers = { ...options.headers };
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("pabe_auth_user");
      if (raw) {
        const u = JSON.parse(raw);
        const token = u?.sessionToken || u?.id || u?.email || "";
        if (token && !headers["x-pabe-session"] && !headers["authorization"]) {
          headers["x-pabe-session"] = encodeURIComponent(token);
          headers["authorization"] = `Bearer ${encodeURIComponent(token)}`;
        }
      }
    } catch {}
  }

  try {
    const res = await fetch(url, {
      credentials: options.credentials || "same-origin",
      ...options,
      headers,
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
