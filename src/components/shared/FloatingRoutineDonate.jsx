"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarHeart } from "lucide-react";

export function FloatingRoutineDonate() {
  const pathname = usePathname();

  // Hide on admin/dashboard, login, or donation/program pages (where WA chat is active instead)
  const isDonationPage =
    pathname?.startsWith("/program") ||
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
    <div className="fixed bottom-6 left-6 z-40 print:hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
      <Link
        href="/donasi-rutin"
        className="group inline-flex items-center gap-2.5 px-4.5 py-2.5 rounded-full text-xs sm:text-sm font-medium text-white bg-gradient-to-b from-amber-500 via-orange-500 to-orange-600 hover:from-amber-400 hover:via-orange-500 hover:to-orange-500 border-t border-t-amber-200 border-x border-x-orange-400/80 border-b-2 border-b-orange-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_4px_14px_rgba(234,88,12,0.4)] active:translate-y-0.5 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_6px_rgba(234,88,12,0.3)] transition-all cursor-pointer select-none"
        aria-label="Atur Jadwal Donasi Rutin"
      >
        <CalendarHeart className="w-4 h-4 text-amber-100 group-hover:text-white group-hover:scale-110 transition-all shrink-0" />
        <span>Donasi Rutin</span>
      </Link>
    </div>
  );
}
