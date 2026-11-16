"use client";

import { toPng } from "html-to-image";
import JSZip from "jszip";
import { toast } from "@/hooks/useToast";

/**
 * Membersihkan nama relawan untuk penamaan file yang aman & teratur di semua OS.
 * @param {string} name
 * @returns {string}
 */
export function formatSafeFileName(name = "") {
  return String(name || "Relawan")
    .trim()
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 50);
}

/**
 * Merender elemen DOM kartu menjadi base64 PNG dengan resolusi tinggi (300 DPI ready).
 * @param {HTMLElement} element
 * @returns {Promise<string>} Data URL base64 PNG
 */
export async function renderCardElementToPng(element) {
  if (!element) {
    throw new Error("Elemen kartu tidak ditemukan.");
  }

  return await toPng(element, {
    pixelRatio: 3,
    cacheBust: true,
    skipFonts: false,
    filter: (child) => {
      if (child?.classList && child.classList.contains("no-export")) {
        return false;
      }
      return true;
    },
  });
}

/**
 * Memicu pengunduhan file Blob di peramban pengguna.
 * @param {Blob|string} content
 * @param {string} fileName
 */
export function triggerFileDownload(content, fileName) {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const url = typeof content === "string" ? content : URL.createObjectURL(content);
  const link = document.createElement("a");
  link.download = fileName;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (typeof content !== "string") {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

/**
 * Mengunduh satu sisi kartu (Depan atau Belakang) sebagai file PNG.
 * @param {object} params
 * @param {object} params.volunteer
 * @param {HTMLElement} params.element
 * @param {"Depan"|"Belakang"} params.side
 */
export async function downloadSingleCardSidePng({ volunteer, element, side = "Depan" }) {
  try {
    const dataUrl = await renderCardElementToPng(element);
    const safeName = formatSafeFileName(volunteer?.fullName);
    const fileName = `Kartu-Relawan-${safeName}-${side}.png`;

    triggerFileDownload(dataUrl, fileName);
    toast.success(`Kartu sisi ${side.toLowerCase()} berhasil diunduh.`);
    return true;
  } catch (err) {
    console.error(`Gagal mengunduh kartu sisi ${side}:`, err);
    toast.error(`Gagal mengunduh kartu sisi ${side.toLowerCase()}.`);
    return false;
  }
}

/**
 * Mengunduh paket cetak perorangan berisi sisi depan & belakang ke dalam satu file ZIP.
 * Struktur file di dalam ZIP:
 * Kartu-Relawan-[Nama].zip
 * ├── Depan.png
 * └── Belakang.png
 *
 * @param {object} params
 * @param {object} params.volunteer
 * @param {HTMLElement} params.frontElement
 * @param {HTMLElement} params.backElement
 */
export async function downloadSingleVolunteerZip({ volunteer, frontElement, backElement }) {
  try {
    const [frontDataUrl, backDataUrl] = await Promise.all([
      renderCardElementToPng(frontElement),
      renderCardElementToPng(backElement),
    ]);

    const zip = new JSZip();
    zip.file("Depan.png", frontDataUrl.split(",")[1], { base64: true });
    zip.file("Belakang.png", backDataUrl.split(",")[1], { base64: true });

    const zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    const safeName = formatSafeFileName(volunteer?.fullName);
    const fileName = `Kartu-Relawan-${safeName}.zip`;

    triggerFileDownload(zipBlob, fileName);
    toast.success("Paket kartu relawan (Depan & Belakang) berhasil diunduh.");
    return true;
  } catch (err) {
    console.error("Gagal membuat arsip kartu ZIP:", err);
    toast.error("Gagal mengunduh paket kartu ZIP.");
    return false;
  }
}

