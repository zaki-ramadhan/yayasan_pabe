/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { logoutUser, USER_ROLES } from "@/services/authService";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function DonorSidebarNav({
  currentUser,
  isCollapsed = false,
  onCloseMobile,
}) {
  const pathname = usePathname();
  const router = useRouter();

  const isStaff = Boolean(
    currentUser?.role && currentUser.role !== USER_ROLES.DONOR
  );

  const handleLogout = () => {
    logoutUser();
    if (onCloseMobile) onCloseMobile();
    toast.success("Berhasil keluar dari akun.");
    router.push("/");
  };

  const mainNavItems = [
    {
      label: "Dashboard",
      href: "/donatur/dashboard",
      short: "DB",
    },
    {
      label: "Riwayat Donasi",
      href: "/donatur/riwayat",
      short: "RD",
    },
    {
      label: "Profil Saya",
      href: "/donatur/profil",
      short: "PS",
    },
  ];

  const publicNavItems = [
    {
      label: "Beranda Utama",
      href: "/",
      short: "BU",
    },
    {
      label: "Program Donasi",
      href: "/program",
      short: "PD",
    },
    {
      label: "Berita & Artikel",
      href: "/artikel",
      short: "BA",
    },
  ];

  return (
    <div className="h-full flex flex-col justify-between bg-sidebar border-r border-slate-200 overflow-hidden transition-all duration-200 select-none">
      {/* Top Section */}
      <div className={cn("space-y-6", isCollapsed ? "p-2.5" : "p-4")}>
        {/* Brand Header */}
        <div className="flex items-center pb-3 border-b border-slate-200">
          <Link
            href="/"
            onClick={onCloseMobile}
            className={cn(
              "flex items-center group transition-all",
              isCollapsed ? "justify-center w-full" : "gap-2.5 w-full"
            )}
            title="Kembali ke Beranda Utama Yayasan PABE"
          >
            <div className="relative w-8.5 h-8.5 rounded-md overflow-hidden bg-white shrink-0 p-0.5 border border-slate-200 flex items-center justify-center">
              <Image
                src="/logo_yayasan_GSM.png"
                alt="Logo Yayasan PABE"
                width={34}
                height={34}
                className="w-full h-full object-contain rounded-xs"
              />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1 truncate">
                <span className="font-normal text-sm block text-slate-950 leading-tight group-hover:text-primary transition-colors truncate">
                  Yayasan PABE
                </span>
                <span className="text-xs font-normal text-slate-500 block truncate">
                  Kembali ke Beranda
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Main Navigation */}
        <div className="space-y-1.5">
          {!isCollapsed && (
            <p className="px-3 text-xs font-normal text-slate-500 uppercase tracking-wider truncate">
              Menu utama
            </p>
          )}
          <nav className="space-y-0.5">
            {mainNavItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href === "/donatur/dashboard" && pathname === "/donatur");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center rounded-md text-sm transition-all font-normal",
                    isCollapsed ? "justify-center p-2 text-xs" : "px-3 py-2",
                    isActive
                      ? "text-slate-950 bg-slate-200/80 shadow-2xs"
                      : "text-slate-600 hover:text-slate-950 hover:bg-slate-200/40"
                  )}
                >
                  {isCollapsed ? (
                    <span className="text-xs uppercase tracking-wider font-normal">{item.short}</span>
                  ) : (
                    <span className="flex-1 truncate whitespace-nowrap font-normal">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Website Utama Navigation */}
        <div className="space-y-1.5">
          {!isCollapsed && (
            <p className="px-3 text-xs font-normal text-slate-500 uppercase tracking-wider truncate">
              Website utama
            </p>
          )}
          <nav className="space-y-0.5">
            {publicNavItems.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center rounded-md text-sm transition-all font-normal",
                    isCollapsed ? "justify-center p-2 text-xs" : "px-3 py-2",
                    isActive
                      ? "text-slate-950 bg-slate-200/80 shadow-2xs"
                      : "text-slate-600 hover:text-slate-950 hover:bg-slate-200/40"
                  )}
                >
                  {isCollapsed ? (
                    <span className="text-xs uppercase tracking-wider font-normal">{item.short}</span>
                  ) : (
                    <span className="flex-1 truncate whitespace-nowrap font-normal">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {isStaff && (
          <div className={cn("pt-2 border-t border-slate-200/80", isCollapsed && "flex justify-center")}>
            {isCollapsed ? (
              <Link
                href="/admin"
                onClick={onCloseMobile}
                title="Portal Administrator"
                className="w-10 h-10 rounded-md flex items-center justify-center bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-900 transition-colors text-xs font-normal"
              >
                ADM
              </Link>
            ) : (
              <Link
                href="/admin"
                onClick={onCloseMobile}
                className="flex items-center justify-between px-3 py-2 rounded-md bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-800 text-sm font-normal transition-colors"
              >
                <span className="truncate font-normal">Portal Administrator</span>
                <span className="text-xs text-slate-400 font-normal">&rarr;</span>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Bottom Section: Dedicated Logout Button */}
      <div
        className={cn(
          "border-t border-slate-200 bg-sidebar",
          isCollapsed ? "p-2.5 flex justify-center" : "p-3"
        )}
      >
        {isCollapsed ? (
          <button
            type="button"
            onClick={handleLogout}
            title="Keluar dari akun"
            aria-label="Keluar dari akun"
            className="w-10 h-10 rounded-md flex items-center justify-center text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors cursor-pointer text-xs font-normal"
          >
            <LogOut className="w-4.5 h-4.5 text-rose-600" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleLogout}
            title="Keluar dari akun"
            aria-label="Keluar dari akun"
            className="w-full flex items-center px-3 py-2 rounded-md text-sm font-normal text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5 shrink-0 mr-2.5 text-rose-600" />
            <span className="truncate font-normal">Keluar dari akun</span>
          </button>
        )}
      </div>
    </div>
  );
}
