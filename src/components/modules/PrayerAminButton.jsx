"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export function PrayerAminButton({
  donorId,
  donorName = "Donatur",
  aminCount = 0,
  isAmined = false,
  onToggleAmin,
  variant = "default",
  className,
}) {
  const isReaction = variant === "reaction";

  return (
    <button
      type="button"
      disabled={isAmined}
      onClick={() => !isAmined && onToggleAmin && onToggleAmin(donorId)}
      className={cn(
        "inline-flex items-center select-none transition-all shrink-0",
        isReaction
          ? cn(
              "gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium shadow-2xs border",
              isAmined
                ? "bg-rose-50 border-rose-200 text-rose-700 cursor-default pointer-events-none"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
            )
          : cn(
              "gap-1.5 px-2 py-1 rounded-md text-xs font-medium",
              isAmined
                ? "cursor-default text-slate-700 pointer-events-none"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
            ),
        className
      )}
      aria-label={
        isAmined
          ? `Doa dari ${donorName} telah diaminkan`
          : `Aamiinkan doa dari ${donorName}`
      }
    >
      <Heart
        className={cn(
          isReaction ? "w-3 h-3" : "w-3.5 h-3.5",
          "transition-colors",
          isAmined
            ? "fill-rose-500 text-rose-500"
            : "text-rose-500 fill-transparent"
        )}
      />
      <span>{aminCount > 0 ? `${aminCount} Aamiin` : isAmined ? "1 Aamiin" : "Aamiin"}</span>
    </button>
  );
}
