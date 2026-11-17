/**
 * Utility penjaga frekuensi pengiriman email notifikasi status (Anti-Spam & Quota Protector).
 * Mencegah pengiriman email berulang ke penerima yang sama untuk status yang sama dalam kurun waktu cooldown,
 * menjaga kuota provider email (Resend/Brevo) tetap stabil dan melindungi dari ketidaksengajaan klik admin.
 */

// Durasi cooldown default: 1 jam di production, 5 detik di development
const DEFAULT_EMAIL_COOLDOWN_MS =
  process.env.NODE_ENV === "development" ? 5 * 1000 : 60 * 60 * 1000;

// In-Memory store untuk mencatat timestamp pengiriman terakhir per (email + status)
const dispatchHistory = new Map();

/**
 * Memeriksa apakah email untuk status tertentu layak dikirimkan ke alamat email tujuan.
 * Mengembalikan true jika belum pernah dikirim atau sudah melewati masa cooldown.
 *
 * @param {string} email - Alamat email penerima
 * @param {string} status - Kode status aksi (misal: "APPROVED", "REJECTED", "SHORTLISTED")
 * @param {number} [cooldownMs=DEFAULT_EMAIL_COOLDOWN_MS] - Jeda waktu cooldown dalam milidetik
 * @returns {boolean}
 */
export function shouldSendStatusEmail(email, status, cooldownMs = DEFAULT_EMAIL_COOLDOWN_MS) {
  if (!email || typeof email !== "string" || !status || typeof status !== "string") {
    return false;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const normalizedStatus = status.toUpperCase().trim();
  const key = `${normalizedEmail}:${normalizedStatus}`;
  const now = Date.now();

  const lastSent = dispatchHistory.get(key);
  if (lastSent && now - lastSent < cooldownMs) {
    return false; // Masih dalam masa cooldown, cegah duplikasi email
  }

  dispatchHistory.set(key, now);
  return true;
}

/**
 * Membersihkan riwayat pengiriman untuk email dan status tertentu (misal saat pengiriman gagal).
 *
 * @param {string} email
 * @param {string} status
 */
export function resetStatusEmailCooldown(email, status) {
  if (!email || !status) return;
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedStatus = status.toUpperCase().trim();
  dispatchHistory.delete(`${normalizedEmail}:${normalizedStatus}`);
}

/**
 * Membersihkan riwayat pengiriman (digunakan untuk pengujian otomatis).
 */
export function clearEmailDispatchHistory() {
  dispatchHistory.clear();
}

