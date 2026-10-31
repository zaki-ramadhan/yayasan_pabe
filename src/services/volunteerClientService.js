import { safeFetch } from "@/lib/safeFetch";

/**
 * Service terpusat (SSOT) untuk komunikasi data relawan di sisi client.
 * Memisahkan tanggung jawab network dari komponen UI (SRP & SoC).
 */

/**
 * Mengambil status keanggotaan relawan berdasarkan email
 * @param {string} email
 * @returns {Promise<{ success: boolean, data?: object, message?: string }>}
 */
export async function fetchVolunteerStatus(email) {
  if (!email) return { success: false, data: null };

  try {
    const res = await safeFetch(`/api/donor/volunteer?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    const json = await res.json();
    return {
      success: Boolean(json.success),
      data: json.data || null,
      message: json.message || "",
    };
  } catch (error) {
    console.error("fetchVolunteerStatus error:", error);
    return { success: false, data: null, message: "Gagal memuat status relawan." };
  }
}

/**
 * Mengirim formulir pendaftaran relawan baru
 * @param {object} payload
 * @returns {Promise<{ success: boolean, data?: object, message?: string }>}
 */
export async function submitVolunteerRegistration(payload) {
  try {
    const res = await safeFetch("/api/volunteers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Gagal mengirim pendaftaran relawan.");
    }

    return {
      success: true,
      data: json.data || null,
      message: json.message || "Pendaftaran relawan berhasil dikirim.",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Gagal mengirim pendaftaran relawan.",
    };
  }
}

/**
 * Membatalkan pendaftaran atau mengundurkan diri sebagai relawan
 * @param {string} email
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function cancelVolunteerRegistration(email = "") {
  try {
    const res = await safeFetch("/api/donor/volunteer", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Gagal membatalkan pendaftaran.");
    }

    return {
      success: true,
      message: json.message || "Pendaftaran relawan berhasil dibatalkan.",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Gagal membatalkan pendaftaran relawan.",
    };
  }
}
