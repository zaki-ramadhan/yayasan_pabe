import { safeFetch } from "@/lib/safeFetch";

/**
 * Service komunikasi data lamaran kerja sisi client (SSOT & SoC).
 *
 * @returns {Promise<{ success: boolean, data: Array<object>, message?: string }>}
 */
export async function fetchUserCareerApplications(email = "") {
  try {
    const url = email
      ? `/api/user/career-applications?email=${encodeURIComponent(email)}`
      : "/api/user/career-applications";
    const res = await safeFetch(url, {
      timeoutMs: 8000,
    });
    const json = await res.json().catch(() => ({}));

    if (!res.ok || !json.success) {
      return {
        success: false,
        data: [],
        message: json.message || "Gagal memuat riwayat lamaran kerja.",
      };
    }

    return {
      success: true,
      data: Array.isArray(json.data) ? json.data : [],
      message: "",
    };
  } catch (error) {
    console.error("fetchUserCareerApplications error:", error);
    return {
      success: false,
      data: [],
      message: "Terjadi gangguan jaringan saat memuat riwayat lamaran.",
    };
  }
}

/**
 * Membatalkan lamaran pekerjaan aktif (hanya status PENDING)
 *
 * @param {string} applicationId
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function cancelCareerApplication(applicationId) {
  if (!applicationId) {
    return { success: false, message: "ID lamaran tidak valid." };
  }

  try {
    const res = await safeFetch(`/api/user/career-applications/${applicationId}`, {
      method: "DELETE",
    });
    const json = await res.json().catch(() => ({}));

    if (!res.ok || !json.success) {
      throw new Error(json.message || "Gagal membatalkan lamaran pekerjaan.");
    }

    return {
      success: true,
      message: json.message || "Lamaran pekerjaan berhasil dibatalkan.",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Terjadi kendala saat membatalkan lamaran.",
    };
  }
}

