/**
 * Cloudflare Turnstile Server-Side Verification Helper.
 * Memvalidasi token respons Turnstile dari browser ke endpoint resmi Cloudflare.
 */

// Kunci testing resmi bawaan Cloudflare (Selalu Lolos / Always Passes)
export const CLOUDFLARE_TEST_SITE_KEY = "1x00000000000000000000AA";
export const CLOUDFLARE_TEST_SECRET_KEY = "1x0000000000000000000000000000000AA";

const TURNSTILE_VERIFY_ENDPOINT = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Memverifikasi token Cloudflare Turnstile di sisi server (Route Handler).
 *
 * @param {string} token - Token respons Turnstile dari frontend (cf-turnstile-response)
 * @param {string} [remoteIp] - IP pengguna (opsional, disarankan)
 * @returns {Promise<{ success: boolean, message?: string, errorCodes?: string[] }>}
 */
export async function verifyTurnstileToken(token, remoteIp = null) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY || CLOUDFLARE_TEST_SECRET_KEY;

  // Jika di lingkungan automated test dan token tidak dikirim, izinkan lewat agar tidak memblokir tes modul lain
  if (process.env.NODE_ENV === "test" && !token) {
    return { success: true };
  }

  // Jika di local dev dan menggunakan test key, verifikasi tetap dipanggil ke Cloudflare
  // Endpoint Cloudflare mendukung secret key testing ini dan otomatis merespons success: true.
  if (!token || typeof token !== "string" || !token.trim()) {
    return {
      success: false,
      message: "Verifikasi keamanan Turnstile wajib diselesaikan.",
      errorCodes: ["missing-input-response"],
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token.trim());
    if (remoteIp && remoteIp !== "127.0.0.1" && remoteIp !== "::1") {
      formData.append("remoteip", remoteIp);
    }

    const res = await fetch(TURNSTILE_VERIFY_ENDPOINT, {
      method: "POST",
      body: formData,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.error(`[Turnstile] Cloudflare API HTTP error: ${res.status}`);
      return {
        success: false,
        message: "Gagal menghubungi server verifikasi keamanan. Silakan coba sesaat lagi.",
        errorCodes: [`http-status-${res.status}`],
      };
    }

    const data = await res.json();

    if (data.success) {
      return { success: true };
    }

    const errorCodes = data["error-codes"] || [];
    console.warn("[Turnstile] Verification failed:", errorCodes);

    let userMessage = "Verifikasi keamanan tidak valid atau telah kedaluwarsa. Silakan coba lagi.";
    if (errorCodes.includes("timeout-or-duplicate")) {
      userMessage = "Sesi verifikasi keamanan telah kedaluwarsa. Silakan lakukan verifikasi ulang.";
    }

    return {
      success: false,
      message: userMessage,
      errorCodes,
    };
  } catch (err) {
    if (err.name === "AbortError") {
      console.error("[Turnstile] Request timeout contacting Cloudflare API");
      return {
        success: false,
        message: "Waktu verifikasi keamanan habis. Silakan coba beberapa saat lagi.",
        errorCodes: ["timeout"],
      };
    }

    console.error("[Turnstile] Unexpected error during verification:", err.message);
    return {
      success: false,
      message: "Terjadi gangguan saat memverifikasi keamanan. Silakan coba lagi.",
      errorCodes: ["internal-error"],
    };
  }
}
