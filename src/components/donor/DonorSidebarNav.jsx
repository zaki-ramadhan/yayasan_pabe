"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, LayoutGrid, Globe } from "lucide-react";
import { logoutUser } from "@/services/authService";
import { toast } from "@/hooks/useToast";
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
      label: "Kartu Relawan",
      href: "/donatur/relawan",
      short: "KR",
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

  const mainActiveIndex = mainNavItems.findIndex(
    (item) =>
      pathname === item.href ||
      (item.href === "/donatur/dashboard" && pathname === "/donatur")
  );

  const publicActiveIndex = publicNavItems.findIndex((item) =>
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
  );

  return (
    <div className="h-full flex flex-col justify-between bg-sidebar border-r border-slate-200 overflow-hidden transition-all duration-200 select-none">
      {/* Top Section */}
      <div className={cn("space-y-3", isCollapsed ? "p-2.5" : "p-3")}>
        {/* Brand Header */}
        <div className="flex items-center pb-3 border-b border-slate-200">
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
                <span className="font-normal text-sm block text-slate-950 leading-tight group-hover:text-primary transition-colors truncate">
                  Yayasan PABE
                </span>
                <span className="text-sm font-normal text-slate-500 block truncate">
                  Kembali ke Beranda
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Main Navigation */}
        <div>
          {isCollapsed ? (
            <>
              <div className="flex justify-center py-1 text-slate-400" title="Menu utama">
                <LayoutGrid className="w-4 h-4 shrink-0" />
              </div>
              <nav className="space-y-0.5 mt-1">
                {mainNavItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href === "/donatur/dashboard" && pathname === "/donatur");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={cn(
                        "flex items-center rounded-md text-sm transition-all font-normal justify-center p-2 text-xs",
                        isActive
                          ? "text-slate-950 bg-slate-200/80 shadow-2xs"
                          : "text-slate-600 hover:text-slate-950 hover:bg-slate-200/40"
                      )}
                    >
                      <span className="text-xs uppercase tracking-wider font-normal">{item.short}</span>
                    </Link>
                  );
                })}
              </nav>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 text-sm select-none">
                <LayoutGrid
                  className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    mainActiveIndex !== -1 ? "text-slate-950" : "text-slate-500"
                  )}
                />
                <span className="truncate font-normal text-slate-900">
                  Menu utama
                </span>
              </div>
              <nav className="space-y-0.5 mt-0.5">
                {mainNavItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href === "/donatur/dashboard" && pathname === "/donatur");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={cn(
                        "flex items-center rounded-md text-sm transition-all font-normal px-3 py-2",
                        isActive
                          ? "text-slate-950 bg-slate-200/80 shadow-2xs"
                          : "text-slate-600 hover:text-slate-950 hover:bg-slate-200/40"
                      )}
                    >
                      <span className="flex-1 truncate whitespace-nowrap">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </>
          )}
        </div>

        {/* Website Utama Navigation */}
        <div className="pt-3 border-t border-dashed border-slate-200">
          {isCollapsed ? (
            <>
              <div className="flex justify-center py-1 text-slate-400" title="Website utama">
                <Globe className="w-4 h-4 shrink-0" />
              </div>
              <nav className="space-y-0.5 mt-1">
                {publicNavItems.map((item) => {
                  const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={cn(
                        "flex items-center rounded-md text-sm transition-all font-normal justify-center p-2 text-xs",
                        isActive
                          ? "text-slate-950 bg-slate-200/80 shadow-2xs"
                          : "text-slate-600 hover:text-slate-950 hover:bg-slate-200/40"
                      )}
                    >
                      <span className="text-xs uppercase tracking-wider font-normal">{item.short}</span>
                    </Link>
                  );
                })}
              </nav>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 text-sm select-none">
                <Globe
                  className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    publicActiveIndex !== -1 ? "text-slate-950" : "text-slate-500"
                  )}
                />
                <span className="truncate font-normal text-slate-900">
                  Website utama
                </span>
              </div>
              <nav className="space-y-0.5 mt-0.5">
                {publicNavItems.map((item) => {
                  const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={cn(
                        "flex items-center rounded-md text-sm transition-all font-normal px-3 py-2",
                        isActive
                          ? "text-slate-950 bg-slate-200/80 shadow-2xs"
                          : "text-slate-600 hover:text-slate-950 hover:bg-slate-200/40"
                      )}
                    >
                      <span className="flex-1 truncate whitespace-nowrap">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </>
          )}
        </div>
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
            aria-label="Keluar dari akun"
            className="w-10 h-10 rounded-md flex items-center justify-center text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors cursor-pointer text-xs font-normal"
          >
            <LogOut className="w-4.5 h-4.5 text-rose-600" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleLogout}
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
