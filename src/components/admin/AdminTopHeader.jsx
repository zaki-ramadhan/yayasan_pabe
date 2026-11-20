"use client";

import { useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SidebarMinimalisticIcon } from "@solar-icons/react/line-duotone/sidebar-minimalistic";
import { Logout2Icon } from "@solar-icons/react/line-duotone/logout-2";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/DropdownMenu";
import { UserAvatarChipTrigger } from "@/components/nav/UserAvatarChipTrigger";
import { USER_ROLES, logoutUser } from "@/services/authService";
import { SuperAdminNoticeBanner } from "@/components/admin/SuperAdminNoticeBanner";
import { AdminSystemAlertBanner } from "@/components/admin/AdminSystemAlertBanner";
import { toast } from "@/hooks/useToast";
import { getInitials } from "@/lib/formatters";
import { resolveUserAvatar } from "@/lib/userParser";
import { cn } from "@/lib/utils";

const ADMIN_PAGE_TITLES = {
  "/admin": "Dashboard Utama",
  "/admin/donatur": "Daftar Donatur",
  "/admin/program": "Kelola Program Donasi",
  "/admin/zis": "Kelola Program ZIS",
  "/admin/kategori": "Kategori Program",
  "/admin/distribusi": "Rekam Penyaluran",
  "/admin/transaksi": "Mutasi Transaksi",
  "/admin/donasi-rutin": "Donasi Rutin",
  "/admin/doa": "Moderasi Doa",
  "/admin/artikel": "Berita & Artikel",
  "/admin/galeri": "Galeri Dokumentasi",
  "/admin/instagram": "Feed Instagram",
  "/admin/karier": "Lowongan Karier",
  "/admin/relawan": "Kelola Relawan",
  "/admin/faq": "Pusat FAQ",
  "/admin/pengguna": "Kelola Pengurus",
  "/admin/pengaturan": "Pengaturan Yayasan",
  "/admin/penyimpanan": "Penyimpanan Berkas",
};

export function AdminTopHeader({
  currentUser,
  onToggleSidebar,
  isSidebarExpanded = false,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const userRole = currentUser?.role || USER_ROLES.SUPER_ADMIN;
  const isSuperAdmin = userRole === USER_ROLES.SUPER_ADMIN;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const res = await logoutUser();
      if (!res?.success) {
        toast.info("Sesi pada perangkat ini telah dibersihkan.");
      }
    } catch {
      toast.info("Sesi pada perangkat ini telah dibersihkan.");
    }
    if (typeof window !== "undefined") {
      window.location.replace("/login?loggedOut=true");
    } else {
      router.push("/login?loggedOut=true");
    }
  };

  const pageTitle = useMemo(() => {
    if (!pathname) return "Panel Admin";
    if (ADMIN_PAGE_TITLES[pathname]) return ADMIN_PAGE_TITLES[pathname];

    const match = Object.keys(ADMIN_PAGE_TITLES)
      .filter((k) => k !== "/admin")
      .sort((a, b) => b.length - a.length)
      .find((k) => pathname.startsWith(k));

    return match ? ADMIN_PAGE_TITLES[match] : "Panel Admin";
  }, [pathname]);

  return (
    <div className="sticky top-0 z-20">
      <SuperAdminNoticeBanner isSuperAdmin={isSuperAdmin} />
      <AdminSystemAlertBanner />
      <header className="bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label={isSidebarExpanded ? "Kecilkan bilah menu" : "Perluas bilah menu"}
            className="lg:hidden p-1.5 -ml-1.5 rounded-md text-slate-500 hover:text-slate-950 hover:bg-slate-100/80 transition-colors cursor-pointer flex items-center justify-center shrink-0"
          >
            <SidebarMinimalisticIcon className="w-4.5 h-4.5" />
          </button>

          <h1 className="text-sm sm:text-base font-medium text-slate-900 leading-tight truncate">
            {pageTitle}
          </h1>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <UserAvatarChipTrigger
              currentUser={currentUser}
              isOpen={isDropdownOpen}
              ariaLabel="Menu akun pengurus"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-lg">
            <div className="px-2.5 py-2">
              <p className="text-sm font-semibold text-slate-900 truncate leading-tight">
                {currentUser?.name || "Administrator"}
              </p>
              {currentUser?.email && (
                <p className="text-xs text-slate-500 truncate leading-tight mt-0.5">
                  {currentUser.email}
                </p>
              )}
            </div>

            <DropdownMenuSeparator className="my-1 border-slate-100" />

            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-normal text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer focus:bg-rose-50 focus:text-rose-700 transition-colors"
            >
              <Logout2Icon className="w-4.5 h-4.5 text-rose-500 shrink-0" />
              <span className="flex-1 font-normal">Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
    </div>
  );
}
