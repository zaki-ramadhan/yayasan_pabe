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
    <div className="lg:hidden border-b border-slate-300 bg-white px-4 pt-2 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2">
      <div className="space-y-1">
        {/* Home */}
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

        {/* Tentang Kami */}
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

        {/* Program Accordion */}
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

        {/* Galeri (Direct Link) */}
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

        {/* Artikel (Direct Link) */}
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

        {/* Informasi Accordion */}
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

      {/* Mobile Auth Button & Profile */}
      <NavMobileUserSection
        currentUser={currentUser}
        onClose={onClose}
        onLogout={onLogout}
      />
    </div>
  );
}
