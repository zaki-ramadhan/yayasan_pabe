"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeft } from "lucide-react";

const DONOR_PAGE_TITLES = {
  "/donatur": "Dashboard",
  "/donatur/dashboard": "Dashboard",
  "/donatur/riwayat": "Riwayat Donasi & Zakat",
  "/donatur/relawan": "Kartu Relawan",
  "/donatur/profil": "Profil Saya",
};

export function DonorTopHeader({
  currentUser,
  onToggleSidebar,
  isSidebarExpanded = false,
}) {
  const pathname = usePathname();
  const firstName = currentUser?.name ? currentUser.name.split(" ")[0] : "";
  const displayName = currentUser?.name || "Akun Saya";
  const [imgError, setImgError] = useState(false);

  const pageTitle = useMemo(() => {
    if (!pathname || pathname === "/donatur" || pathname === "/donatur/dashboard") {
      return firstName ? `Halo, ${firstName}` : "Selamat Datang";
    }
    return DONOR_PAGE_TITLES[pathname] || "Dashboard";
  }, [pathname, firstName]);

  const avatarUrl = !imgError
    ? (currentUser?.avatar || currentUser?.image || currentUser?.picture || currentUser?.avatarUrl)
    : null;

  const fallbackInitial =
    currentUser?.initials ||
    (currentUser?.name ? currentUser.name.trim().charAt(0).toUpperCase() : "U");

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
      {/* Left: Sidebar Toggle Button + Page Title */}
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={isSidebarExpanded ? "Kecilkan bilah menu" : "Perluas bilah menu"}
          title={isSidebarExpanded ? "Kecilkan menu samping" : "Perluas menu samping"}
          className="lg:hidden p-1.5 -ml-1.5 rounded-md text-slate-500 hover:text-slate-950 hover:bg-slate-100/80 transition-colors cursor-pointer flex items-center justify-center shrink-0"
        >
          <PanelLeft className="w-5 h-5" />
        </button>

        <h1 className="text-base sm:text-lg font-medium text-slate-950 leading-tight truncate">
          {pageTitle}
        </h1>
      </div>

      {/* Right: Donor Profile Avatar Link */}
      {currentUser && (
        <Link
          href="/donatur/profil"
          className="relative w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full overflow-hidden bg-slate-100 border border-slate-200/90 hover:border-slate-300 hover:ring-2 hover:ring-slate-400/20 transition-all shrink-0 flex items-center justify-center shadow-2xs group cursor-pointer"
          title={`Profil Saya (${displayName})`}
          aria-label="Buka Profil Saya"
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName}
              fill
              sizes="36px"
              unoptimized={typeof avatarUrl === "string" && !avatarUrl.startsWith("/") && !avatarUrl.includes("lh3.googleusercontent.com")}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="font-medium text-xs text-slate-700">
              {fallbackInitial}
            </span>
          )}
        </Link>
      )}
    </header>
  );
}
