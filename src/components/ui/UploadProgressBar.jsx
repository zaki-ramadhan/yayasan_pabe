"use client";

import { Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Sub-komponen modular untuk menampilkan indikator progres pengunggahan berkas nyata (DRY & SRP).
 * Menggabungkan motion spinner aktif, label status dinamis, persentase angka tabular,
 * dan progress bar animasi transisi halus.
 *
 * @param {object} props
 * @param {number} props.progress - Persentase pengunggahan aktual (0 - 100)
 * @param {boolean} [props.isUploading=true] - Status aktivitas pengunggahan
 * @param {string} [props.uploadText] - Teks kustom saat proses transfer berlangsung
 * @param {string} [props.processingText] - Teks kustom saat fase pemrosesan server (100%)
 * @param {boolean} [props.isPdf=false] - Penanda format dokumen PDF
 * @param {Function} [props.onCancel] - Handler pembatalan proses unggah oleh pengguna
 * @param {"emerald"|"slate"|"primary"} [props.theme="emerald"] - Token tema warna konsisten
 * @param {string} [props.className] - Kustomisasi kelas pembungkus
 */
export function UploadProgressBar({
  progress = 0,
  isUploading = true,
  uploadText = "",
  processingText = "Memproses & mengoptimasi berkas...",
  isPdf = false,
  onCancel,
  theme = "emerald",
  className = "",
}) {
  if (!isUploading) return null;

  const clamped = Math.min(100, Math.max(0, Math.round(Number(progress) || 0)));
  const isProcessing = clamped >= 100;

  const themeTokens = {
    emerald: {
      spinner: "text-emerald-600",
      bar: "bg-emerald-600",
      track: "bg-slate-200",
    },
    slate: {
      spinner: "text-slate-700",
      bar: "bg-slate-800",
      track: "bg-slate-200",
    },
    primary: {
      spinner: "text-primary",
      bar: "bg-primary",
      track: "bg-slate-200",
    },
  };

  const activeTheme = themeTokens[theme] || themeTokens.emerald;
  const defaultUploadLabel = isPdf
    ? "Mengunggah dokumen PDF..."
    : "Mengunggah berkas...";

  const currentLabel = uploadText || defaultUploadLabel;

  return (
    <div
      className={cn(
        "flex flex-col items-center w-full max-w-xs px-4 select-none",
        className
      )}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={isProcessing ? processingText : currentLabel}
    >
      <Loader2 className={cn("w-7 h-7 animate-spin mb-2.5", activeTheme.spinner)} />

      <div className="flex items-center justify-between w-full text-xs font-medium text-slate-700 mb-1.5">
        <span className="truncate pr-2">
          {isProcessing ? processingText : currentLabel}
        </span>
        <span className="tabular-nums font-semibold text-slate-900 shrink-0">
          {clamped}%
        </span>
      </div>

      <div className={cn("w-full h-1.5 rounded-full overflow-hidden", activeTheme.track)}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-200 ease-out",
            activeTheme.bar
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>

      <p className="text-[11px] text-slate-500 mt-2 font-normal">
        Mohon jangan menutup jendela ini
      </p>

      {onCancel && !isProcessing && (
        <button
          type="button"
          onClick={onCancel}
          className="mt-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50/60 transition-colors cursor-pointer"
          aria-label="Batalkan proses unggah berkas"
        >
          <X className="w-3.5 h-3.5" />
          <span>Batalkan unggahan</span>
        </button>
      )}
    </div>
  );
}
