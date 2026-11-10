"use client";

import { usePathname } from "next/navigation";
import { FloatingRoutineDonateButton } from "./floating-actions/FloatingRoutineDonateButton";
import { FloatingWhatsAppButton } from "./floating-actions/FloatingWhatsAppButton";

/**
 * FloatingActionDock:
 * Layout coordinator untuk floating actions di pojok kanan bawah.
 * Menampilkan tombol Donasi Rutin dan WhatsApp berdampingan (sebelahan) secara horizontal.
 */
export function FloatingActionDock() {
  const pathname = usePathname();

  // Sembunyikan seluruh dock pada halaman admin, dashboard, atau login
  const isHiddenPage =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/auth") ||
    pathname === "/login";

  if (isHiddenPage) {
    return null;
  }

  return (
    <aside
      aria-label="Aksi Cepat & Bantuan"
      className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2 sm:gap-2.5 print:hidden animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <FloatingRoutineDonateButton />
      <FloatingWhatsAppButton />
    </aside>
  );
}

