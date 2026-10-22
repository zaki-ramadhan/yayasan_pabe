/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  HeartHandshake,
  FileCheck,
  Receipt,
  ArrowLeft,
  LogOut,
  Newspaper,
  Briefcase,
  HelpCircle,
} from "lucide-react";
import { logoutUser } from "@/services/authService";
import { cn } from "@/lib/utils";

const ADMIN_NAV_GROUPS = [
  {
    title: "Program & Donasi",
    items: [
      { href: "/admin", label: "Dashboard Utama", icon: LayoutDashboard, exact: true },
      { href: "/admin/program", label: "Kelola Program", icon: HeartHandshake },
      { href: "/admin/distribusi", label: "Rekam Penyaluran", icon: FileCheck },
      { href: "/admin/transaksi", label: "Mutasi Transaksi", icon: Receipt },
    ],
  },
  {
    title: "Konten & Informasi",
    items: [
      { href: "/admin/artikel", label: "Berita & Artikel", icon: Newspaper },
      { href: "/admin/karier", label: "Lowongan Karier", icon: Briefcase },
      { href: "/admin/faq", label: "Pusat FAQ", icon: HelpCircle },
    ],
  },
];

export function AdminSidebarNav({
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

  return (
    <div className="h-full flex flex-col justify-between bg-sidebar border-r border-slate-200 py-4 px-3 select-none">
      <div className="space-y-4">
        {/* Brand Header */}
        <div className="pb-3 border-b border-slate-200">
          <Link
            href="/"
            onClick={onCloseMobile}
            className={cn(
              "flex items-center group transition-all",
              isCollapsed ? "justify-center w-full" : "gap-2.5 w-full"
            )}
            title="Yayasan Generasi Sejahtera Mandiri"
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
                <span className="font-semibold text-sm block text-slate-950 leading-tight truncate">
                  Yayasan PABE
                </span>
                <span className="text-sm font-normal text-slate-500 block truncate">
                  Portal Pengurus
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Main Navigation Groups */}
        <div className="space-y-4">
          {ADMIN_NAV_GROUPS.map((group) => (
            <div key={group.title} className="space-y-1">
              {!isCollapsed && (
                <p className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">
                  {group.title}
                </p>
              )}
              <nav className="space-y-0.5 pt-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      title={isCollapsed ? item.label : undefined}
                      className={cn(
                        "flex items-center rounded-md text-sm transition-colors group",
                        isCollapsed ? "justify-center p-2.5" : "gap-2.5 px-3 py-2",
                        isActive
                          ? "text-slate-950 font-medium bg-slate-200/80"
                          : "text-slate-700 hover:text-slate-950 hover:bg-slate-200/50 font-normal"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-4.5 h-4.5 shrink-0 transition-colors",
                          isActive ? "text-slate-950" : "text-slate-500 group-hover:text-slate-800"
                        )}
                      />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="pt-3 border-t border-slate-200 space-y-1">
        <Link
          href="/"
          onClick={onCloseMobile}
          title={isCollapsed ? "Kembali ke Website" : undefined}
          className={cn(
            "flex items-center rounded-md text-sm text-slate-700 hover:text-slate-950 hover:bg-slate-200/50 transition-colors",
            isCollapsed ? "justify-center p-2.5" : "gap-2.5 px-3 py-2"
          )}
        >
          <ArrowLeft className="w-4.5 h-4.5 text-slate-500 shrink-0" />
          {!isCollapsed && <span className="truncate">Website Publik</span>}
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          title={isCollapsed ? "Keluar (Logout)" : undefined}
          className={cn(
            "flex items-center rounded-md text-sm text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer w-full text-left font-medium",
            isCollapsed ? "justify-center p-2.5" : "gap-2.5 px-3 py-2"
          )}
        >
          <LogOut className="w-4.5 h-4.5 shrink-0" />
          {!isCollapsed && <span className="truncate">Keluar</span>}
        </button>
      </div>
    </div>
  );
}
