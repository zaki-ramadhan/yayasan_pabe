"use client";

import { useState, useEffect } from "react";
import { CheckSquare, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/**
 * Komponen bilah aksi massal melayang (Floating Bulk Action Dock).
 * Dilengkapi animasi masuk-keluar halus ala toast dari arah bawah,
 * sudut kartu rounded-xl proporsional, dan tata letak responsif.
 */
export function TableSelectionBar({
  selectedCount = 0,
  totalCount,
  label = "berkas",
  itemLabel,
  extraInfo,
  onClearSelection,
  clearLabel = "Batal pilih",
  onSelectAll,
  isAllSelected = false,
  selectAllLabel,
  children,
  className = "",
}) {
  const isVisible = selectedCount > 0;
  const [rendered, setRendered] = useState(isVisible);

  if (isVisible && !rendered) {
    setRendered(true);
  }

  const effectiveLabel = itemLabel || label || "item";
  const currentCountDisplay =
    typeof totalCount === "number" && totalCount > 0
      ? `${selectedCount}/${totalCount}`
      : String(selectedCount);

  const effectiveIsAllSelected =
    Boolean(isAllSelected) ||
    (typeof totalCount === "number" && totalCount > 0 && selectedCount >= totalCount);

  // Menyimpan cache teks agar saat animasi keluar (exit), angka terpilih tidak mendadak nol
  const [cachedDisplay, setCachedDisplay] = useState({
    countDisplay: currentCountDisplay,
    label: effectiveLabel,
    extraInfo,
  });

  if (isVisible) {
    if (
      cachedDisplay.countDisplay !== currentCountDisplay ||
      cachedDisplay.label !== effectiveLabel ||
      cachedDisplay.extraInfo !== extraInfo
    ) {
      setCachedDisplay({
        countDisplay: currentCountDisplay,
        label: effectiveLabel,
        extraInfo,
      });
    }
  }

  useEffect(() => {
    if (!isVisible && rendered) {
      const timer = setTimeout(() => {
        setRendered(false);
      }, 240);
      return () => clearTimeout(timer);
    }
  }, [isVisible, rendered]);

  if (!rendered) return null;

  const activeCountDisplay = isVisible ? currentCountDisplay : cachedDisplay.countDisplay;
  const activeLabel = isVisible ? effectiveLabel : cachedDisplay.label;
  const activeExtraInfo = isVisible ? extraInfo : cachedDisplay.extraInfo;

  return (
    <div
      role="region"
      aria-label="Bilah tindakan massal mengambang"
      className={cn(
        "fixed bottom-3 sm:bottom-4 inset-x-0 z-50 flex justify-center pointer-events-none px-4",
        className
      )}
    >
      <div
        className={cn(
          "pointer-events-auto",
          "w-full sm:w-auto max-w-2xl",
          "bg-white/95 backdrop-blur-md text-slate-800",
          "border border-slate-200/95",
          "rounded-xl shadow-xl shadow-slate-900/10 ring-1 ring-slate-950/5",
          "px-3.5 py-2 sm:px-4 sm:py-2",
          "flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3.5",
          isVisible ? "dock-enter" : "dock-exit pointer-events-none"
        )}
      >
        {/* Sisi Kiri: Indikator Jumlah Terpilih */}
        <div className="flex items-center gap-2 pl-0.5 sm:pr-1 text-xs sm:text-sm font-medium text-slate-700 shrink-0 select-none">
          <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="truncate">
            <strong className="text-slate-950 font-semibold">{activeCountDisplay}</strong>{" "}
            {activeLabel} terpilih
            {activeExtraInfo ? (
              <span className="text-slate-500 text-xs ml-1 font-normal hidden sm:inline">
                ({activeExtraInfo})
              </span>
            ) : null}
          </span>
        </div>

        {/* Pembatas Vertikal Ringkas di Desktop */}
        <div className="hidden sm:block h-5 w-px bg-slate-200 shrink-0" />

        {/* Sisi Kanan: Kontainer Tombol Aksi Massal & Tombol Batal Silang */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {onSelectAll && !effectiveIsAllSelected && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSelectAll}
              className="h-8 text-xs font-medium px-3 text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-50 border-slate-300 hover:border-slate-400 transition-colors cursor-pointer rounded-lg shrink-0 shadow-2xs"
            >
              {selectAllLabel ||
                (typeof totalCount === "number" && totalCount > 0
                  ? `Pilih semua (${totalCount})`
                  : "Pilih semua")}
            </Button>
          )}
          {children}
          {onClearSelection && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClearSelection}
              title={clearLabel}
              aria-label={clearLabel}
              className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

