"use client";

import { cn } from "@/lib/utils";

export function PrayerTextarea({
  id = "prayer-input",
  value = "",
  onChange,
  onBlur,
  error,
  maxLength = 150,
  rows = 3,
  placeholder = "Tuliskan doa atau permohonan kebaikan Anda...",
  showInfo = false,
  className,
}) {
  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-semibold text-slate-800 block">
          Doa atau titipan harapan (opsional)
        </label>
        <span
          className={cn(
            "text-xs font-normal tabular-nums",
            value.length >= maxLength ? "text-amber-600 font-semibold" : "text-slate-500"
          )}
        >
          {value.length}/{maxLength} karakter
        </span>
      </div>

      <textarea
        id={id}
        rows={rows}
        maxLength={maxLength}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-lg border bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors font-normal resize-none",
          error
            ? "border-rose-500 bg-rose-50/15 text-rose-950 placeholder:text-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            : "border-slate-300 focus:ring-primary/20 focus:border-primary",
          className
        )}
      />

      {error && (
        <p className="text-xs text-rose-500 font-medium leading-relaxed" role="alert">
          {error}
        </p>
      )}

      {showInfo && (
        <p className="text-xs sm:text-sm text-slate-600 font-normal">
          Untaian doa Anda akan dicantumkan di halaman program untuk diaminkan bersama donatur lainnya.
        </p>
      )}
    </div>
  );
}
