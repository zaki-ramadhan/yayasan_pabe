"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { logoutUser } from "@/services/authService";
import { USER_ROLES } from "@/services/authService";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const ADMIN_NAV_GROUPS = [
  {
    title: "Program & Donasi",
    items: [
      { href: "/admin", label: "Dashboard Utama", short: "DB", exact: true },
      { href: "/admin/donatur", label: "Daftar Donatur", short: "DD" },
      { href: "/admin/program", label: "Kelola Program", short: "KP" },
      { href: "/admin/distribusi", label: "Rekam Penyaluran", short: "RP" },
      { href: "/admin/transaksi", label: "Mutasi Transaksi", short: "MT" },
      { href: "/admin/donasi-rutin", label: "Donasi Rutin", short: "DR" },
      { href: "/admin/doa", label: "Moderasi Doa", short: "MD" },
    ],
  },
  {
    title: "Konten & Informasi",
    items: [
      { href: "/admin/artikel", label: "Berita & Artikel", short: "BA" },
      { href: "/admin/laporan-audit", label: "Laporan Audit Keuangan", short: "LK" },
      { href: "/admin/karier", label: "Lowongan Karier", short: "KA" },
      { href: "/admin/relawan", label: "Kelola Relawan", short: "KR" },
      { href: "/admin/faq", label: "Pusat FAQ", short: "FQ" },
    ],
  },
];

export function AdminSidebarNav({
  isCollapsed = false,
  onCloseMobile,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const isSuperAdmin = currentUser?.role === USER_ROLES.SUPER_ADMIN;

  const navGroups = [
    ...ADMIN_NAV_GROUPS,
    ...(isSuperAdmin
      ? [
          {
            title: "Hak Akses & Pengurus",
            items: [
              { href: "/admin/pengguna", label: "Kelola Pengurus", short: "KP" },
              { href: "/admin/pengaturan", label: "Pengaturan Yayasan", short: "PY" },
            ],
          },
        ]
      : []),
  ];

  const handleLogout = () => {
    logoutUser();
    if (onCloseMobile) onCloseMobile();
    toast.success("Berhasil keluar dari akun.");
    router.push("/");
  };

  return (
    <div className="h-full flex flex-col bg-sidebar border-r border-slate-200 select-none overflow-hidden">
      {/* Brand Header (Fixed Top) */}
      <div className="shrink-0 p-3 pb-3 border-b border-slate-200">
        <Link
          href="/"
          onClick={onCloseMobile}
          className={cn(
            "flex items-center group transition-all",
            isCollapsed ? "justify-center w-full" : "gap-2.5 w-full"
          )}
          title="Yayasan Payung Berkah (PABE)"
        >
          <div className="relative w-8.5 h-8.5 rounded-md overflow-hidden bg-white shrink-0 p-0.5 border border-slate-200 flex items-center justify-center">
            <Image
              src="/logo_yayasan_GSM.png"
              alt="Logo Yayasan Payung Berkah"
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
              <span className="text-xs font-normal text-slate-500 block truncate">
                Panel admin
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Main Navigation Groups (Scrollable if many items) */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1.5">
            {!isCollapsed && (
              <p className="px-3 text-xs font-normal text-slate-500 uppercase tracking-wider truncate">
                {group.title}
              </p>
            )}
            <nav className="space-y-0.5">
              {group.items.map((item) => {
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
                      "flex items-center rounded-md text-sm transition-all font-normal",
                      isCollapsed ? "justify-center p-2 text-xs" : "px-3 py-2",
                      isActive
                        ? "text-slate-950 bg-slate-200/90 shadow-2xs"
                        : "text-slate-600 hover:text-slate-950 hover:bg-slate-200/50"
                    )}
                  >
                    {isCollapsed ? (
                      <span className="text-xs uppercase tracking-wider font-normal">{item.short}</span>
                    ) : (
                      <span className="truncate font-normal">{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Bottom Actions (Fixed Bottom, Never Overflown) */}
      <div className="shrink-0 p-3 pt-3 border-t border-slate-200 mt-auto bg-sidebar">
        <button
          type="button"
          onClick={handleLogout}
          title={isCollapsed ? "Keluar (Logout)" : undefined}
          className={cn(
            "flex items-center rounded-md text-sm text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer w-full text-left font-normal",
            isCollapsed ? "justify-center p-2.5" : "px-3 py-2"
          )}
        >
          <LogOut className={cn("w-4.5 h-4.5 shrink-0", !isCollapsed && "mr-2.5")} />
          {!isCollapsed && <span className="truncate font-normal">Keluar</span>}
        </button>
      </div>
    </div>
  );
}
