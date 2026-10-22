/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileSpreadsheet,
  User,
  LogOut,
  ChevronRight,
  Shield,
  Home,
  HeartHandshake,
  Newspaper,
} from "lucide-react";
import { logoutUser, USER_ROLES } from "@/services/authService";
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
    router.push("/");
  };

  const mainNavItems = [
    {
      label: "Dashboard",
      href: "/donatur/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Riwayat Donasi",
      href: "/donatur/riwayat",
      icon: FileSpreadsheet,
    },
    {
      label: "Profil Saya",
      href: "/donatur/profil",
      icon: User,
    },
  ];

  const publicNavItems = [
    {
      label: "Beranda Utama",
      href: "/",
      icon: Home,
    },
    {
      label: "Program Donasi",
      href: "/program",
      icon: HeartHandshake,
    },
    {
      label: "Berita & Artikel",
      href: "/artikel",
      icon: Newspaper,
    },
  ];

  const displayName = currentUser?.name || "Pengguna";

  return (
    <div className="h-full flex flex-col justify-between bg-sidebar border-r border-slate-200 overflow-hidden transition-all duration-200 select-none">
      {/* Top Section */}
      <div className={cn("space-y-4", isCollapsed ? "p-2.5" : "p-4")}>
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
                <span className="font-medium text-sm block text-slate-950 leading-tight group-hover:text-primary transition-colors truncate">
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
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="px-2 text-xs font-medium text-slate-600 uppercase tracking-wider truncate">
              Menu utama
            </p>
          )}
          <nav className="space-y-1 pt-0.5">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
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
                    "flex items-center rounded-md text-sm transition-colors group",
                    isCollapsed
                      ? "justify-center p-2.5"
                      : "gap-2.5 px-3 py-2",
                    isActive
                      ? "text-slate-950 font-medium bg-slate-200/60"
                      : "text-slate-600 hover:text-slate-950 hover:bg-slate-200/40 font-normal"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 shrink-0 transition-colors",
                      isActive
                        ? "text-slate-950"
                        : "text-slate-400 group-hover:text-slate-600"
                    )}
                  />
                  {!isCollapsed && (
                    <span className="flex-1 truncate whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Website Utama Navigation */}
        <div className="space-y-1 pt-3 border-t border-slate-200">
          {!isCollapsed && (
            <p className="px-2 text-xs font-medium text-slate-600 uppercase tracking-wider truncate">
              Website utama
            </p>
          )}
          <nav className="space-y-1 pt-0.5">
            {publicNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center rounded-md text-sm transition-colors group",
                    isCollapsed
                      ? "justify-center p-2.5"
                      : "gap-2.5 px-3 py-2",
                    isActive
                      ? "text-slate-950 font-medium bg-slate-200/60"
                      : "text-slate-600 hover:text-slate-950 hover:bg-slate-200/40 font-normal"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 shrink-0 transition-colors",
                      isActive
                        ? "text-slate-950"
                        : "text-slate-400 group-hover:text-slate-600"
                    )}
                  />
                  {!isCollapsed && (
                    <span className="flex-1 truncate whitespace-nowrap">
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
                className="w-10 h-10 rounded-md flex items-center justify-center bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-900 transition-colors"
              >
                <Shield className="w-4.5 h-4.5 text-primary" />
              </Link>
            ) : (
              <Link
                href="/admin"
                onClick={onCloseMobile}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-900 text-xs font-normal transition-colors"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="truncate">Portal Administrator</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
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
            className="w-10 h-10 rounded-md flex items-center justify-center text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5 text-rose-600" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleLogout}
            title="Keluar dari akun"
            aria-label="Keluar dari akun"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-slate-700 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors cursor-pointer group"
          >
            <LogOut className="w-4.5 h-4.5 shrink-0 text-rose-600 transition-colors" />
            <span className="truncate">Keluar dari akun</span>
          </button>
        )}
      </div>
    </div>
  );
}
