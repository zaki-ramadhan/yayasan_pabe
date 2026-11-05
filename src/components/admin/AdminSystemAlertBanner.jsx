"use client";

import Link from "next/link";
import { AlertTriangle, AlertOctagon, X } from "lucide-react";
import { useStorageAlert } from "@/hooks/useStorageAlert";
import { formatBytes } from "@/lib/formatters";
import { cn } from "@/lib/utils";

/**
 * Banner peringatan sistem global untuk status kapasitas Cloudflare R2.
 * Menampilkan pesan informatif dan tombol aksi ketika kapasitas mencapai ambang batas 80% (Warning) atau 95% (Critical).
 */
export function AdminSystemAlertBanner() {
  const { health, totalBytes, limitBytes, isDismissed, dismissAlert } = useStorageAlert();

  if (isDismissed || (!health?.isWarning && !health?.isCritical)) {
    return null;
  }

  const isCritical = health.isCritical;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "w-full px-4 sm:px-6 lg:px-8 py-2 text-xs flex items-center justify-between gap-3 border-b transition-colors select-none",
        isCritical
          ? "bg-rose-50/95 border-rose-200 text-rose-950 shadow-2xs"
          : "bg-amber-50/90 border-amber-200/90 text-amber-950"
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {isCritical ? (
          <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
        )}

        <div className="flex flex-col justify-center min-w-0 leading-tight">
          <span className="font-medium text-xs">
            {isCritical ? "Kapasitas penyimpanan kritis" : "Peringatan kapasitas penyimpanan"}
          </span>
          <span className="text-slate-700 text-xs mt-0.5">
            Ruang penyimpanan terisi {health.usagePercent}% ({formatBytes(totalBytes)} dari{" "}
            {formatBytes(limitBytes)}).{" "}
            {isCritical
              ? "Batas kuota gratis 10 GB hampir penuh, unggah berkas baru dapat tertunda."
              : "Pertimbangkan untuk membersihkan berkas sampah sebelum kuota habis."}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/admin/penyimpanan"
          className={cn(
            "inline-flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap leading-none",
            isCritical
              ? "bg-rose-600 hover:bg-rose-700 text-white shadow-2xs"
              : "bg-amber-600 hover:bg-amber-700 text-white shadow-2xs"
          )}
        >
          <span>{isCritical ? "Bersihkan berkas sampah" : "Kelola penyimpanan"}</span>
        </Link>

        <button
          type="button"
          onClick={dismissAlert}
          aria-label="Tutup peringatan kapasitas"
          className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-black/5 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
