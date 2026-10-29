"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { PanelLeft } from "lucide-react";
import { ROLE_LABELS, USER_ROLES } from "@/services/authService";
import { SuperAdminNoticeBanner } from "@/components/admin/SuperAdminNoticeBanner";
import { getInitials } from "@/lib/formatters";

const ADMIN_PAGE_TITLES = {
  "/admin": "Dashboard Utama",
  "/admin/donatur": "Daftar Donatur",
  "/admin/program": "Kelola Program",
  "/admin/distribusi": "Rekam Penyaluran",
  "/admin/transaksi": "Mutasi Transaksi",
  "/admin/donasi-rutin": "Donasi Rutin",
  "/admin/doa": "Moderasi Doa",
  "/admin/artikel": "Berita & Artikel",
  "/admin/galeri": "Galeri Dokumentasi",
  "/admin/instagram": "Feed Instagram",
  "/admin/laporan-audit": "Laporan Audit Keuangan",
  "/admin/karier": "Lowongan Karier",
  "/admin/relawan": "Kelola Relawan",
  "/admin/faq": "Pusat FAQ",
  "/admin/pengguna": "Kelola Pengurus",
  "/admin/pengaturan": "Pengaturan Yayasan",
  "/admin/penyimpanan": "Penyimpanan Media R2",
};

export function AdminTopHeader({
  currentUser,
  onToggleSidebar,
  isSidebarExpanded = false,
}) {
  const pathname = usePathname();
  const userRole = currentUser?.role || USER_ROLES.SUPER_ADMIN;
  const isSuperAdmin = userRole === USER_ROLES.SUPER_ADMIN;
  const [imgError, setImgError] = useState(false);

  const pageTitle = useMemo(() => {
    if (!pathname) return "Panel Admin";
    if (ADMIN_PAGE_TITLES[pathname]) return ADMIN_PAGE_TITLES[pathname];

    const match = Object.keys(ADMIN_PAGE_TITLES)
      .filter((k) => k !== "/admin")
      .sort((a, b) => b.length - a.length)
      .find((k) => pathname.startsWith(k));

    return match ? ADMIN_PAGE_TITLES[match] : "Panel Admin";
  }, [pathname]);

  const avatarUrl = !imgError
    ? (currentUser?.avatar || currentUser?.image || currentUser?.picture || currentUser?.avatarUrl)
    : null;

  const fallbackInitial =
    currentUser?.initials || getInitials(currentUser?.name, "A");

  return (
    <div className="sticky top-0 z-20">
      <SuperAdminNoticeBanner isSuperAdmin={isSuperAdmin} />
      <header className="bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4">
      {/* Left: Sidebar Toggle Button + Dynamic Page Title */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={isSidebarExpanded ? "Kecilkan bilah menu" : "Perluas bilah menu"}
          title={isSidebarExpanded ? "Kecilkan menu samping" : "Perluas menu samping"}
          className="lg:hidden p-1.5 -ml-1.5 rounded-md text-slate-500 hover:text-slate-950 hover:bg-slate-100/80 transition-colors cursor-pointer flex items-center justify-center shrink-0"
        >
          <PanelLeft className="w-4.5 h-4.5" />
        </button>

        <h1 className="text-sm sm:text-base font-medium text-slate-900 leading-tight truncate">
          {pageTitle}
        </h1>
      </div>

      {/* Right: Clean User Info & Avatar */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="text-right hidden sm:block">
          <span className="text-sm font-medium text-slate-900 block leading-tight">
            {currentUser?.name || "Administrator"}
          </span>
          <span className="text-xs text-slate-500 font-normal block leading-tight mt-0.5">
            {(ROLE_LABELS[userRole] || currentUser?.title || userRole || "Administrator")
              .replace(/\s*\(Ketua Yayasan\)/gi, "")
              .replace(/\s*Ketua Yayasan/gi, "")}
          </span>
        </div>

        <div
          className="relative w-9 h-9 rounded-full overflow-hidden bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800 flex items-center justify-center shadow-2xs shrink-0 select-none"
          title={currentUser?.name || "Pengurus"}
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={currentUser?.name || "Avatar"}
              fill
              sizes="36px"
              unoptimized={typeof avatarUrl === "string" && !avatarUrl.startsWith("/") && !avatarUrl.includes("lh3.googleusercontent.com")}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <span>{fallbackInitial}</span>
          )}
        </div>
      </div>
    </header>
    </div>
  );
}
