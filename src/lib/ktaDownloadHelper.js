"use client";

import { toPng } from "html-to-image";
import { toast } from "@/hooks/useToast";

/**
 * Utilitas untuk merender elemen kartu relawan (sisi depan & belakang) menjadi file gambar PNG.
 * Menghasilkan file gambar yang siap disimpan di galeri smartphone atau dicetak di percetakan kartu PVC.
 *
 * @param {HTMLElement|string} target - Elemen DOM atau string ID elemen
 * @param {object} options
 * @param {string} [options.volunteerName="Relawan"] - Nama relawan untuk penamaan file unduhan
 * @param {string} [options.volunteerId=""] - ID resmi relawan
 * @returns {Promise<boolean>}
 */
export {
  formatSafeFileName,
  renderCardElementToPng,
  triggerFileDownload,
  downloadSingleCardSidePng,
  downloadSingleVolunteerZip,
} from "./volunteerCardExportHelper";

export async function downloadVolunteerCardImage(target, options = {}) {

  const { volunteerName = "Relawan", volunteerId = "" } = options;

  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }

  let node = null;
  if (typeof target === "string") {
    node = document.getElementById(target);
  } else if (typeof HTMLElement !== "undefined" && target instanceof HTMLElement) {
    node = target;
  }

  if (!node) {
    toast.error("Kartu belum siap diunduh. Silakan muat ulang halaman dan coba kembali.");
    return false;
  }

  try {
    const dataUrl = await toPng(node, {
      pixelRatio: 2.5,
      cacheBust: true,
      skipFonts: false,
      filter: (child) => {
        if (child.classList && child.classList.contains("no-export")) {
          return false;
        }
        return true;
      },
    });

    const cleanName = volunteerName
      .trim()
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    const cleanId = volunteerId ? `-${volunteerId.replace(/[^a-zA-Z0-9-]/g, "")}` : "";
    const fileName = `Kartu-Relawan-Payung-Berkah-${cleanName}${cleanId}.png`;

    const link = document.createElement("a");
    link.download = fileName;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Kartu relawan berhasil diunduh.");
    return true;
  } catch (err) {
    console.error("Gagal mengekspor kartu relawan ke gambar:", err);
    toast.error("Gagal mengunduh kartu. Silakan coba lagi atau gunakan opsi cetak.");
    return false;
  }
}
