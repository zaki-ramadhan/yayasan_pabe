"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
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
import { logoutUser } from "@/services/authService";
import { toast } from "@/hooks/useToast";
import { getInitials } from "@/lib/formatters";
import { resolveUserAvatar } from "@/lib/userParser";
import { cn } from "@/lib/utils";

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
  const router = useRouter();
  const firstName = currentUser?.name ? currentUser.name.split(" ")[0] : "";
  const displayName = currentUser?.name || "Akun Saya";
  const [imgError, setImgError] = useState(false);
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
    if (!pathname || pathname === "/donatur" || pathname === "/donatur/dashboard") {
      return firstName ? `Halo, ${firstName}` : "Selamat Datang";
    }
    return DONOR_PAGE_TITLES[pathname] || "Dashboard";
  }, [pathname, firstName]);

  const avatarUrl = !imgError ? resolveUserAvatar(currentUser) : null;

  const fallbackInitial = getInitials(
    currentUser?.name,
    currentUser?.initials || currentUser?.email || "U"
  );

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={isSidebarExpanded ? "Kecilkan bilah menu" : "Perluas bilah menu"}
          className="lg:hidden p-1.5 -ml-1.5 rounded-md text-slate-500 hover:text-slate-950 hover:bg-slate-100/80 transition-colors cursor-pointer flex items-center justify-center shrink-0"
        >
          <SidebarMinimalisticIcon className="w-5 h-5" />
        </button>

        <h1 className="text-base sm:text-lg font-medium text-slate-950 leading-tight truncate">
          {pageTitle}
        </h1>
      </div>

      {currentUser && (
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "relative w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full overflow-hidden bg-slate-100 border border-slate-200/90 text-xs font-semibold text-slate-700 flex items-center justify-center shadow-2xs group cursor-pointer transition-all hover:ring-2 hover:ring-slate-300/60 focus:outline-none",
                isDropdownOpen && "ring-2 ring-primary/20 border-primary/40"
              )}
              aria-label="Menu akun donatur"
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
                <span>{fallbackInitial}</span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-lg">
            <div className="px-2.5 py-2">
              <p className="text-sm font-semibold text-slate-900 truncate leading-tight">
                {displayName}
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
      )}
    </header>
  );
}
