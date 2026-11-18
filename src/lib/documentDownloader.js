"use client";

import { toast } from "@/hooks/useToast";
import { triggerFileDownload } from "@/lib/volunteerCardExportHelper";

/**
 * Mengunduh dokumen secara aman dari API endpoint tanpa membuka tab baru yang berisiko menampilkan raw JSON error.
 * Menangani respon sukses (blob) dan respon gagal (HTTP 429, 500, 404) secara elegan via notifikasi toast.
 *
 * @param {object} options
 * @param {string} options.url - Target URL endpoint download (contoh: /api/documents/download?type=audit&year=2025)
 * @param {string} [options.fallbackFileName="Dokumen-Laporan-PABE.pdf"] - Nama file cadangan jika header Content-Disposition tidak tersedia
 * @param {() => void} [options.onStart] - Callback saat proses unduh dimulai
 * @param {() => void} [options.onFinish] - Callback saat proses unduh selesai (baik sukses maupun gagal)
 * @returns {Promise<boolean>} Status keberhasilan pengunduhan
 */
export async function downloadDocument({
  url,
  fallbackFileName = "Dokumen-Laporan-PABE.pdf",
  onStart,
  onFinish,
}) {
  if (typeof window === "undefined" || !url) return false;

  try {
    onStart?.();
    const res = await fetch(url);

    if (!res.ok) {
      let errorMessage = "Gagal mengunduh berkas laporan.";

      try {
        const errorData = await res.json();
        if (errorData?.message) {
          errorMessage = errorData.message;
        }
      } catch {
        if (res.status === 429) {
          errorMessage = "Terlalu banyak permintaan dalam waktu singkat. Silakan coba kembali beberapa saat lagi.";
        }
      }

      toast.error(errorMessage);
      return false;
    }

    // Ekstrak nama file dari header Content-Disposition jika tersedia
    let fileName = fallbackFileName;
    const disposition = res.headers.get("content-disposition");
    if (disposition && disposition.includes("filename=")) {
      const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match && match[1]) {
        fileName = match[1].replace(/['"]/g, "").trim();
      }
    }

    const blob = await res.blob();
    triggerFileDownload(blob, fileName);
    toast.success("Berkas laporan berhasil diunduh.");
    return true;
  } catch (error) {
    console.error("Gagal mengunduh dokumen:", error);
    toast.error("Terjadi kendala jaringan saat mengunduh dokumen laporan.");
    return false;
  } finally {
    onFinish?.();
  }
}

