"use client";

import { RefreshCw, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function InvoiceStatusPollingIndicator({
  isChecking,
  currentStatus,
  onCheckNow,
  className,
}) {
  if (currentStatus === "PAID" || currentStatus === "SETTLEMENT") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium",
          className
        )}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>Pembayaran terverifikasi lunas secara otomatis.</span>
      </div>
    );
  }

  if (currentStatus !== "PENDING") {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-slate-600 font-medium">
          Mengecek status pembayaran otomatis...
        </span>
      </div>

      <button
        type="button"
        onClick={onCheckNow}
        disabled={isChecking}
        className="inline-flex items-center gap-1.5 font-medium text-emerald-700 hover:text-emerald-800 hover:underline disabled:opacity-50 cursor-pointer transition-colors"
      >
        <RefreshCw className={cn("w-3 h-3 shrink-0", isChecking && "animate-spin")} />
        <span>{isChecking ? "Memeriksa..." : "Cek manual"}</span>
      </button>
    </div>
  );
}
