"use client";

import { useState } from "react";
import Link from "next/link";
import {
  PROGRAM_MENU,
  INFORMASI_MENU,
  isNavItemActive,
  isParentMenuActive,
} from "@/data/navigation";
import { cn } from "@/lib/utils";
import { NavMobileAccordion } from "./NavMobileAccordion";
import { NavMobileUserSection } from "./NavMobileUserSection";

export function NavMobileDrawer({ pathname, currentUser, onClose, onLogout }) {
  const isHomeActive = isNavItemActive("/", pathname);
  const isTentangKamiActive = isNavItemActive("/tentang-kami", pathname);
  const isProgramActive = isParentMenuActive(PROGRAM_MENU, pathname);
  const isGaleriActive = isNavItemActive("/galeri", pathname);
  const isArtikelActive = isNavItemActive("/artikel", pathname);
  const isInformasiActive = isParentMenuActive(INFORMASI_MENU, pathname);

  const [activeAccordion, setActiveAccordion] = useState(() => {
    if (isProgramActive) return "program";
    if (isInformasiActive) return "informasi";
    return null;
  });

  const toggleAccordion = (name) => {
    setActiveAccordion(activeAccordion === name ? null : name);
  };

  return (
    <>
      <div
        className="lg:hidden fixed inset-0 top-12 sm:top-13 bg-slate-900/40 backdrop-blur-xs z-40 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="lg:hidden fixed inset-x-0 top-12 sm:top-13 z-50 bg-white border-b border-slate-300 px-4 pt-2 pb-6 space-y-3 shadow-xl max-h-[calc(100dvh-3rem)] sm:max-h-[calc(100dvh-3.25rem)] overflow-y-auto animate-in fade-in slide-in-from-top-1">
        <div className="space-y-1">
        <Link
          href="/"
          onClick={onClose}
          className={cn(
            "block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            isHomeActive ? "bg-slate-100 text-primary" : "text-slate-800 hover:bg-slate-50"
          )}
        >
          Beranda
        </Link>

        <Link
          href="/tentang-kami"
          onClick={onClose}
          className={cn(
            "block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            isTentangKamiActive ? "bg-slate-100 text-primary" : "text-slate-800 hover:bg-slate-50"
          )}
        >
          Tentang Kami
        </Link>

        <NavMobileAccordion
          label="Program"
          name="program"
          items={PROGRAM_MENU}
          pathname={pathname}
          isParentActive={isProgramActive}
          isOpen={activeAccordion === "program"}
          onToggle={toggleAccordion}
          onClose={onClose}
        />

        <Link
          href="/galeri"
          onClick={onClose}
          className={cn(
            "block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            isGaleriActive ? "bg-slate-100 text-primary" : "text-slate-800 hover:bg-slate-50"
          )}
        >
          Galeri
        </Link>

        <Link
          href="/artikel"
          onClick={onClose}
          className={cn(
            "block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            isArtikelActive ? "bg-slate-100 text-primary" : "text-slate-800 hover:bg-slate-50"
          )}
        >
          Artikel
        </Link>

        <NavMobileAccordion
          label="Informasi"
          name="informasi"
          items={INFORMASI_MENU}
          pathname={pathname}
          isParentActive={isInformasiActive}
          isOpen={activeAccordion === "informasi"}
          onToggle={toggleAccordion}
          onClose={onClose}
        />
      </div>

      <NavMobileUserSection
        pathname={pathname}
        currentUser={currentUser}
        onClose={onClose}
        onLogout={onLogout}
      />
    </div>
  </>
);
}
