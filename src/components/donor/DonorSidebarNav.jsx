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
import { logoutUser } from "@/services/authService";
import { cn } from "@/lib/utils";

export function DonorSidebarNav({
  currentUser,
  isCollapsed = false,
  onCloseMobile,
}) {
  const pathname = usePathname();
  const router = useRouter();

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
      label: "Kabar & Artikel",
      href: "/artikel",
      icon: Newspaper,
    },
  ];

  const isStaff = currentUser?.role && currentUser.role !== "DONOR";
  const salutation = currentUser?.salutation ? `${currentUser.salutation} ` : "";
  const displayName = `${salutation}${currentUser?.name || "Donatur"}`;

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

        {/* Main Navigation (Portal Donatur) */}
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="px-2 text-xs font-medium text-slate-400 uppercase tracking-wider truncate">
              Menu Donatur
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
                    "flex items-center rounded-md text-sm font-normal transition-colors",
                    isCollapsed
                      ? "justify-center p-2.5"
                      : "gap-2.5 px-3 py-2",
                    isActive
                      ? "bg-white text-slate-950 font-normal border border-slate-200/90"
                      : "text-slate-600 hover:text-slate-950 hover:bg-slate-200/50"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 shrink-0",
                      isActive
                        ? "text-emerald-700"
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
            <p className="px-2 text-xs font-medium text-slate-400 uppercase tracking-wider truncate">
              Website Utama
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
                    "flex items-center rounded-md text-sm font-normal transition-colors",
                    isCollapsed
                      ? "justify-center p-2.5"
                      : "gap-2.5 px-3 py-2",
                    isActive
                      ? "bg-white text-slate-950 font-normal border border-slate-200/90"
                      : "text-slate-600 hover:text-slate-950 hover:bg-slate-200/50"
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-slate-600" />
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

        {/* Staff / Admin Shortcut if applicable */}
        {!isCollapsed && isStaff && (
          <div className="pt-2 border-t border-slate-200/80">
            <Link
              href="/dashboard"
              onClick={onCloseMobile}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-purple-50 hover:bg-purple-100/80 border border-purple-200 text-purple-900 text-xs font-normal transition-colors"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <Shield className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                <span className="truncate">Dashboard Pengurus</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            </Link>
          </div>
        )}
      </div>

      {/* Bottom Section: Profile Minicard with Integrated Logout Button on the Right */}
      <div
        className={cn(
          "border-t border-slate-200 bg-sidebar",
          isCollapsed ? "p-2.5 flex flex-col items-center" : "p-3"
        )}
      >
        {isCollapsed ? (
          /* Collapsed Mode: Only leaves user avatar */
          currentUser && (
            <Link
              href="/donatur/profil"
              onClick={onCloseMobile}
              title={displayName}
              className="relative w-7 h-7 rounded-full overflow-hidden bg-white border border-slate-300 shrink-0 flex items-center justify-center hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer"
            >
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={displayName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="font-medium text-[11px] text-slate-700">
                  {currentUser.initials || "U"}
                </span>
              )}
            </Link>
          )
        ) : (
          /* Expanded Mode: Minicard with Avatar + Info + Logout Button on the Right */
          currentUser && (
            <div className="p-2 rounded-md bg-white border border-slate-200 flex items-center justify-between gap-2">
              <Link
                href="/donatur/profil"
                onClick={onCloseMobile}
                className="flex items-center gap-2 min-w-0 flex-1 hover:opacity-85 transition-opacity"
              >
                <div className="relative w-7 h-7 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={displayName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="font-medium text-[11px] text-slate-700">
                      {currentUser.initials || "U"}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-xs text-slate-900 truncate leading-snug">
                    {displayName}
                  </p>
                  <p className="text-xs font-normal text-slate-500 truncate leading-tight">
                    {currentUser.email || "donatur@pabe.or.id"}
                  </p>
                </div>
              </Link>

              {/* Integrated Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                title="Keluar dari Akun"
                aria-label="Keluar"
                className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
