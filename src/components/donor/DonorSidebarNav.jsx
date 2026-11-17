"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { Widget2Icon as Widget2Line } from "@solar-icons/react/line-duotone/widget-2";
import { BillListIcon as BillListLine } from "@solar-icons/react/line-duotone/bill-list";
import { UserIdIcon as UserIdLine } from "@solar-icons/react/line-duotone/user-id";
import { UserRoundedIcon as UserRoundedLine } from "@solar-icons/react/line-duotone/user-rounded";
import { Home2Icon as Home2Line } from "@solar-icons/react/line-duotone/home-2";
import { HandHeartIcon as HandHeartLine } from "@solar-icons/react/line-duotone/hand-heart";
import { DocumentTextIcon as DocumentTextLine } from "@solar-icons/react/line-duotone/document-text";

import { Widget2Icon as Widget2Bold } from "@solar-icons/react/bold/widget-2";
import { BillListIcon as BillListBold } from "@solar-icons/react/bold/bill-list";
import { UserIdIcon as UserIdBold } from "@solar-icons/react/bold/user-id";
import { UserRoundedIcon as UserRoundedBold } from "@solar-icons/react/bold/user-rounded";
import { Home2Icon as Home2Bold } from "@solar-icons/react/bold/home-2";
import { HandHeartIcon as HandHeartBold } from "@solar-icons/react/bold/hand-heart";
import { DocumentTextIcon as DocumentTextBold } from "@solar-icons/react/bold/document-text";

import { cn } from "@/lib/utils";

export function DonorSidebarNav({
  currentUser,
  isCollapsed = false,
  onCloseMobile,
}) {
  const pathname = usePathname();

  const mainNavItems = [
    {
      label: "Dashboard",
      href: "/donatur/dashboard",
      icon: Widget2Line,
      activeIcon: Widget2Bold,
    },
    {
      label: "Riwayat Donasi",
      href: "/donatur/riwayat",
      icon: BillListLine,
      activeIcon: BillListBold,
    },
    {
      label: "Kartu Relawan",
      href: "/donatur/relawan",
      icon: UserIdLine,
      activeIcon: UserIdBold,
    },
    {
      label: "Profil Saya",
      href: "/donatur/profil",
      icon: UserRoundedLine,
      activeIcon: UserRoundedBold,
    },
  ];

  const publicNavItems = [
    {
      label: "Beranda Utama",
      href: "/",
      icon: Home2Line,
      activeIcon: Home2Bold,
      exact: true,
    },
    {
      label: "Program Donasi",
      href: "/program",
      icon: HandHeartLine,
      activeIcon: HandHeartBold,
    },
    {
      label: "Berita & Artikel",
      href: "/artikel",
      icon: DocumentTextLine,
      activeIcon: DocumentTextBold,
    },
  ];

  return (
    <div className="h-full flex flex-col justify-between bg-sidebar border-r border-slate-200 overflow-hidden select-none">
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 sidebar-scrollbar">
        <div className="pb-3 pt-1 border-b border-slate-300">
          <Link
            href="/"
            onClick={onCloseMobile}
            className={cn(
              "flex items-center group transition-all",
              isCollapsed ? "justify-center w-full" : "gap-2.5 w-full"
            )}
            aria-label="Kembali ke Beranda Utama Yayasan PABE"
          >
            <div className="relative w-8.5 h-8.5 rounded-md overflow-hidden bg-white shrink-0 p-0.5 border border-slate-200 flex items-center justify-center">
              <Image
                src="/img/branding/logo-ypabe.webp"
                alt="Logo Yayasan PABE"
                width={34}
                height={34}
                className="w-full h-full object-contain rounded-xs"
              />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1 truncate">
                <span className="font-normal text-sm block text-slate-950 leading-tight truncate">
                  Yayasan PABE
                </span>
                <span className="text-sm font-normal text-slate-500 block truncate">
                  Kembali ke Beranda
                </span>
              </div>
            )}
          </Link>
        </div>

        <div className="space-y-0.5 pt-2">
          {isCollapsed ? (
            <nav className="space-y-0.5">
              {mainNavItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href === "/donatur/dashboard" && pathname === "/donatur");
                const ItemIcon = isActive ? (item.activeIcon || item.icon) : item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    title={item.label}
                    className={cn(
                      "flex items-center rounded-md transition-all justify-center p-2 text-xs",
                      isActive
                        ? "text-black bg-slate-200/80 shadow-2xs"
                        : "text-slate-900 hover:text-black hover:bg-slate-200/50"
                    )}
                  >
                    {ItemIcon && <ItemIcon className="w-5 h-5 shrink-0" />}
                  </Link>
                );
              })}
            </nav>
          ) : (
            <>
              <div className="px-3 pt-1 pb-1 select-none">
                <span className="truncate text-sm font-normal text-slate-900 block">
                  Menu Utama
                </span>
              </div>
              <nav className="space-y-0.5">
                {mainNavItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href === "/donatur/dashboard" && pathname === "/donatur");
                  const ItemIcon = isActive ? (item.activeIcon || item.icon) : item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md text-sm transition-all font-normal px-3 py-1.5 group",
                        isActive
                          ? "text-black font-normal bg-slate-200/80 shadow-2xs"
                          : "text-slate-900 hover:text-black hover:bg-slate-200/50"
                      )}
                    >
                      {ItemIcon && (
                        <ItemIcon
                          className={cn(
                            "w-4.5 h-4.5 shrink-0 transition-colors",
                            isActive ? "text-slate-950" : "text-slate-700 group-hover:text-black"
                          )}
                        />
                      )}
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </>
          )}
        </div>

        <div className="-mx-3 my-2.5 border-t border-slate-300" />

        <div className="space-y-0.5">
          {isCollapsed ? (
            <nav className="space-y-0.5">
              {publicNavItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href) && item.href !== "/";
                const ItemIcon = isActive ? (item.activeIcon || item.icon) : item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    title={item.label}
                    className={cn(
                      "flex items-center rounded-md transition-all justify-center p-2 text-xs",
                      isActive
                        ? "text-black bg-slate-200/80 shadow-2xs"
                        : "text-slate-900 hover:text-black hover:bg-slate-200/50"
                    )}
                  >
                    {ItemIcon && <ItemIcon className="w-5 h-5 shrink-0" />}
                  </Link>
                );
              })}
            </nav>
          ) : (
            <>
              <div className="px-3 pt-1 pb-1 select-none">
                <span className="truncate text-sm font-normal text-slate-900 block">
                  Website Utama
                </span>
              </div>
              <nav className="space-y-0.5">
                {publicNavItems.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href) && item.href !== "/";
                  const ItemIcon = isActive ? (item.activeIcon || item.icon) : item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md text-sm transition-all font-normal px-3 py-1.5 group",
                        isActive
                          ? "text-black font-normal bg-slate-200/80 shadow-2xs"
                          : "text-slate-900 hover:text-black hover:bg-slate-200/50"
                      )}
                    >
                      {ItemIcon && (
                        <ItemIcon
                          className={cn(
                            "w-4.5 h-4.5 shrink-0 transition-colors",
                            isActive ? "text-slate-950" : "text-slate-700 group-hover:text-black"
                          )}
                        />
                      )}
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
