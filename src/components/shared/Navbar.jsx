"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { getStoredUser, logoutUser } from "@/services/authService";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/use-toast";
import { NavDesktopMenu } from "@/components/nav/NavDesktopMenu";
import { NavUserDropdown } from "@/components/nav/NavUserDropdown";
import { NavMobileDrawer } from "@/components/nav/NavMobileDrawer";

function subscribeAuth(callback) {
  window.addEventListener("pabe_auth_change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("pabe_auth_change", callback);
    window.removeEventListener("storage", callback);
  };
}

function getAuthSnapshot() {
  if (typeof window === "undefined") return null;
  const user = getStoredUser();
  return user ? JSON.stringify(user) : null;
}

function getAuthServerSnapshot() {
  return null;
}

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const userJson = useSyncExternalStore(subscribeAuth, getAuthSnapshot, getAuthServerSnapshot);
  const currentUser = userJson ? JSON.parse(userJson) : null;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const justLoggedInName = sessionStorage.getItem("pabe_just_logged_in");
    if (justLoggedInName) {
      sessionStorage.removeItem("pabe_just_logged_in");
      toast.success(`Selamat datang, ${justLoggedInName}! Berhasil masuk ke akun.`);
    }

    // Validasi keselarasan sesi lokal dengan sesi server aktif
    if (currentUser) {
      safeFetch("/api/auth/me")
        .then((res) => res.json())
        .then((data) => {
          if (!data?.authenticated) {
            logoutUser();
          }
        })
        .catch(() => {});
    }
  }, [pathname, currentUser]);

  const handleLogout = () => {
    logoutUser();
    toast.success("Berhasil keluar dari akun.");
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 sm:h-13">
          {/* Brand Logo & Text */}
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-2.5 select-none focus:outline-none"
            title="Beranda Yayasan PABE"
          >
            {/* Logo Langsung Tanpa Pembungkus Box & Border, Skala Proporsional */}
            <div className="relative h-9 sm:h-14 w-9 sm:w-14 shrink-0 flex items-center justify-center">
              <Image
                src="/img/branding/logo-ypabe.webp"
                alt="Logo Yayasan PABE"
                fill
                sizes="40px"
                className="object-contain select-none pointer-events-none"
                draggable={false}
                priority
              />
            </div>
            <div className="flex flex-col leading-tight select-none">
              <span className="font-semibold text-sm text-slate-900 tracking-tight">
                Yayasan PABE
              </span>
            </div>
          </Link>

          {/* Modular Desktop Navigation */}
          <NavDesktopMenu pathname={pathname} />

          {/* Right Action & User Profile */}
          <div className="flex items-center gap-2.5">
            <NavUserDropdown currentUser={currentUser} onLogout={handleLogout} />

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-slate-900 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Modular Mobile Drawer */}
      {isMobileMenuOpen && (
        <NavMobileDrawer
          pathname={pathname}
          currentUser={currentUser}
          onClose={() => setIsMobileMenuOpen(false)}
          onLogout={handleLogout}
        />
      )}
    </header>
  );
}
