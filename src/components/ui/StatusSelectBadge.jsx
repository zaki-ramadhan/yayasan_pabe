"use client";

import { AltArrowDownIcon as ChevronDown } from "@solar-icons/react/linear/alt-arrow-down";
import { CheckReadIcon as Check } from "@solar-icons/react/line-duotone/check-read";
import { LoaderIcon as Loader2 } from "@solar-icons/react/linear/loader";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/DropdownMenu";
import { cn } from "@/lib/utils";

/**
 * Palet warna solid & subtle untuk status badge
 */
export const STATUS_COLOR_VARIANTS = {
  solid: {
    emerald: "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700",
    amber: "bg-amber-600 text-white border-amber-600 hover:bg-amber-700",
    sky: "bg-sky-600 text-white border-sky-600 hover:bg-sky-700",
    rose: "bg-rose-600 text-white border-rose-600 hover:bg-rose-700",
    blue: "bg-blue-600 text-white border-blue-600 hover:bg-blue-700",
    purple: "bg-purple-600 text-white border-purple-600 hover:bg-purple-700",
    slate: "bg-slate-700 text-white border-slate-700 hover:bg-slate-800",
  },
  subtle: {
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100/70",
    amber: "bg-amber-50 text-amber-800 border-amber-200/80 hover:bg-amber-100/70",
    sky: "bg-sky-50 text-sky-800 border-sky-200/80 hover:bg-sky-100/70",
    rose: "bg-rose-50 text-rose-800 border-rose-200/80 hover:bg-rose-100/70",
    blue: "bg-blue-50 text-blue-800 border-blue-200/80 hover:bg-blue-100/70",
    purple: "bg-purple-50 text-purple-800 border-purple-200/80 hover:bg-purple-100/70",
    slate: "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200/70",
  },
};

/**
 * Resolver warna otomatis berdasarkan color key atau fallback ke default
 */
export function resolveBadgeColorClass(colorKey = "slate", variant = "solid", customClasses = "") {
  if (customClasses) return customClasses;
  const palette = STATUS_COLOR_VARIANTS[variant] || STATUS_COLOR_VARIANTS.solid;
  return palette[colorKey] || palette.slate;
}

/**
 * Komponen Reusable: StatusSelectBadge
 * Badge status interaktif dengan dropdown pemilih ala Notion/Linear.
 * Mendukung varian solid (pekat teks putih) dan subtle (pastel), loading spinner, dan disabled state.
 */
export function StatusSelectBadge({
  value,
  options = [],
  onChange,
  variant = "solid",
  size = "sm",
  isUpdating = false,
  isLoading = false,
  disabled = false,
  aliasMap = {},
  className = "",
  menuClassName = "w-36",
  align = "center",
  ariaLabel,
}) {
  const activeLoading = isUpdating || isLoading;
  const normalizedValue = aliasMap[value] || value;
  const currentOption = options.find((opt) => opt.value === normalizedValue) || options[0] || {
    value,
    label: value,
    color: "slate",
  };

  const isSolid = variant === "solid";
  const badgeColorClass = resolveBadgeColorClass(
    currentOption.color,
    variant,
    currentOption.badgeClasses
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled || activeLoading}
        className={cn(
          "group inline-flex items-center gap-1 rounded-md font-normal border transition-all select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-400",
          size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs sm:text-sm",
          badgeColorClass,
          (disabled || activeLoading) && "opacity-60 cursor-not-allowed pointer-events-none",
          className
        )}
        aria-label={ariaLabel || `Status: ${currentOption.label}. Klik untuk mengubah status.`}
      >
        <span className="font-normal">{currentOption.label}</span>
        {activeLoading ? (
          <Loader2 className={cn("w-3 h-3 animate-spin shrink-0", isSolid ? "text-white/80" : "opacity-70")} />
        ) : (
          <ChevronDown
            strokeWidth={2.5}
            className={cn(
              size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5",
              "stroke-[2.5] shrink-0 transition-transform group-data-[state=open]:rotate-180",
              isSolid ? "text-white/90 group-hover:text-white" : "opacity-80 group-hover:opacity-100"
            )}
          />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={align}
        sideOffset={6}
        className={cn("p-1 bg-white border border-slate-200 rounded-lg shadow-md z-50 animate-in fade-in-80", menuClassName)}
      >
        {options.map((opt) => {
          const isSelected = opt.value === normalizedValue;
          return (
            <DropdownMenuItem
              key={opt.value}
              onSelect={() => onChange?.(opt.value)}
              className={cn(
                "flex items-center justify-between px-3 py-1.5 rounded-md text-xs font-normal cursor-pointer transition-colors outline-none",
                isSelected
                  ? "bg-slate-100 text-slate-900 font-medium"
                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <span className="font-normal">{opt.label}</span>
              {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

