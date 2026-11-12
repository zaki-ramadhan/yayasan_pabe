"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarHeart } from "lucide-react";

export function FloatingRoutineDonateButton() {
  const pathname = usePathname();

  // Sembunyikan pada rute administrasi, otentikasi, atau halaman donasi langsung
  const isDonationPage =
    pathname?.startsWith("/program") ||
    pathname?.startsWith("/zis") ||
    pathname?.startsWith("/campaign") ||
    pathname?.startsWith("/donasi-rutin") ||
    pathname?.startsWith("/kalkulator-zakat");

  const isHiddenPage =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/dashboard") ||
    pathname === "/login";

  if (isDonationPage || isHiddenPage) {
    return null;
  }

  return (
    <Link
      href="/donasi-rutin"
      className="group h-11 sm:h-12 px-3.5 sm:px-4.5 rounded-full inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-b from-amber-500 via-orange-500 to-orange-600 hover:from-amber-400 hover:via-orange-500 hover:to-orange-500 border-t border-t-amber-200 border-x border-x-orange-400/80 border-b-2 border-b-orange-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_4px_14px_rgba(234,88,12,0.38)] active:translate-y-0.5 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_6px_rgba(234,88,12,0.3)] transition-all cursor-pointer select-none shrink-0"
      aria-label="Atur Jadwal Donasi Rutin"
    >
      <CalendarHeart className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-100 group-hover:text-white group-hover:scale-110 transition-transform shrink-0" />
      <span>Donasi Rutin</span>
    </Link>
  );
}

