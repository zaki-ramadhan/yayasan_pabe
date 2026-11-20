"use client";

import { AltArrowDownIcon as ChevronDown } from "@solar-icons/react/line-duotone/alt-arrow-down";
import { CheckReadIcon as Check } from "@solar-icons/react/line-duotone/check-read";
import { LoaderIcon as Loader2 } from "@solar-icons/react/linear/loader";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/DropdownMenu";
import { cn } from "@/lib/utils";

export const VOLUNTEER_STATUSES = [
  {
    value: "PENDING",
    label: "Menunggu",
    badgeClasses: "bg-amber-50 text-amber-800 border-amber-200/80 hover:bg-amber-100/70",
  },
  {
    value: "REVIEWED",
    label: "Ditinjau",
    badgeClasses: "bg-sky-50 text-sky-800 border-sky-200/80 hover:bg-sky-100/70",
  },
  {
    value: "ACCEPTED",
    label: "Diterima",
    badgeClasses: "bg-emerald-50 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100/70",
  },
  {
    value: "REJECTED",
    label: "Ditolak",
    badgeClasses: "bg-rose-50 text-rose-800 border-rose-200/80 hover:bg-rose-100/70",
  },
];

const STATUS_MAP = {
  ...Object.fromEntries(VOLUNTEER_STATUSES.map((s) => [s.value, s])),
  APPROVED: {
    value: "ACCEPTED",
    label: "Diterima",
    badgeClasses: "bg-emerald-50 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100/70",
  },
};

/**
 * Status selector interaktif ala Notion untuk tabel pendaftar relawan (Clean Chip, No Dot).
 * Mengizinkan pengurus yayasan mengubah status secara instan langsung dari baris tabel.
 */
export function AdminVolunteerStatusSelect({
  status = "PENDING",
  onStatusChange,
  isUpdating = false,
  disabled = false,
}) {
  const current = STATUS_MAP[status] || STATUS_MAP.PENDING;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled || isUpdating}
        className={cn(
          "group inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-normal border transition-all select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20",
          current.badgeClasses,
          (disabled || isUpdating) && "opacity-60 cursor-not-allowed pointer-events-none"
        )}
        aria-label={`Status: ${current.label}. Klik untuk mengubah status.`}
      >
        <span className="font-normal">{current.label}</span>
        {isUpdating ? (
          <Loader2 className="w-3 h-3 animate-spin shrink-0 opacity-70" />
        ) : (
          <ChevronDown className="w-3 h-3 shrink-0 opacity-60 group-hover:opacity-100 transition-transform group-data-[state=open]:rotate-180" />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="center"
        sideOffset={6}
        className="w-36 p-1 bg-white border border-slate-200 rounded-lg shadow-md z-50 animate-in fade-in-80"
      >
        {VOLUNTEER_STATUSES.map((s) => {
          const isSelected = s.value === status;
          return (
            <DropdownMenuItem
              key={s.value}
              onSelect={() => onStatusChange?.(s.value)}
              className={cn(
                "flex items-center justify-between px-3 py-1.5 rounded-md text-xs font-normal cursor-pointer transition-colors outline-none",
                isSelected
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <span className="font-normal">{s.label}</span>
              {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

