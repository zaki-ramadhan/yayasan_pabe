"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRightUpIcon } from "@solar-icons/react/linear/arrow-right-up";
import { getNavAuthButtonConfig } from "@/config/navAuth";
import { cn } from "@/lib/utils";

/**
 * Komponen Tombol Masuk / Login Modular dengan Tampilan Dark Slate 3D & Rounded-Full
 * Icon panah miring kanan atas (ArrowUpRight) di sebelah kanan dengan animasi interaktif
 * Memberikan kontras tinggi yang mencolok di header tanpa bertabrakan dengan tombol donasi biru di hero section
 */
export function NavLoginButton({
  pathname: propPathname,
  isMobile = false,
  className = "",
  onClick,
}) {
  const hookPathname = usePathname();
  const activePathname = propPathname !== undefined ? propPathname : hookPathname;
  const config = getNavAuthButtonConfig(activePathname);

  if (isMobile) {
    return (
      <Link
        href={config.href}
        onClick={onClick}
        aria-label={config.ariaLabel}
        className={cn(
          "group flex items-center justify-between w-full h-11 px-5 rounded-full font-medium text-sm text-white",
          "bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 hover:from-slate-600 hover:via-slate-700 hover:to-slate-800",
          "border-t border-t-slate-500 border-x border-x-slate-700 border-b-2 border-b-slate-950",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_3px_8px_rgba(15,23,42,0.35)]",
          "active:translate-y-0.5 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]",
          "transition-all duration-150 cursor-pointer select-none",
          className
        )}
      >
        <span className="truncate">{config.mobileLabel}</span>
        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 ml-2 group-hover:bg-white/20 transition-colors">
          <ArrowRightUpIcon
            className="w-4 h-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200"
            strokeWidth={2.5}
            aria-hidden="true"
          />
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={config.href}
      onClick={onClick}
      aria-label={config.ariaLabel}
      className={cn(
        "group inline-flex items-center gap-1.5 h-8.5 sm:h-9 px-3.5 sm:px-4 rounded-full font-medium text-xs sm:text-sm text-white",
        "bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 hover:from-slate-600 hover:via-slate-700 hover:to-slate-800",
        "border-t border-t-slate-500 border-x border-x-slate-700 border-b-2 border-b-slate-950",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_2.5px_6px_rgba(15,23,42,0.35)]",
        "active:translate-y-0.5 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]",
        "transition-all duration-150 cursor-pointer select-none whitespace-nowrap",
        className
      )}
    >
      <span>{config.label}</span>
      <ArrowRightUpIcon
        className="w-3.5 h-3.5 text-slate-300 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 shrink-0"
        strokeWidth={2.5}
        aria-hidden="true"
      />
    </Link>
  );
}
