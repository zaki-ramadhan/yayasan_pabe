/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { DonorSidebarNav } from "@/components/donor/DonorSidebarNav";
import { DonorTopHeader } from "@/components/donor/DonorTopHeader";
import { logoutUser, USER_ROLES } from "@/services/authService";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/use-toast";

export function DonorLayoutClient({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, isAuthenticated } = useCurrentUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Tampilkan toast sambutan setelah login donatur berhasil
  useEffect(() => {
    if (typeof window !== "undefined") {
      const justLoggedIn =
        sessionStorage.getItem("ygsm_just_logged_in") ||
        sessionStorage.getItem("pabe_just_logged_in");
      if (justLoggedIn) {
        sessionStorage.removeItem("ygsm_just_logged_in");
        sessionStorage.removeItem("pabe_just_logged_in");
        toast.success(`Selamat datang, ${justLoggedIn}! Berhasil masuk ke akun donatur.`);
      }
    }
  }, []);

  // If administrator/staff lands on donor dashboard, redirect to admin portal
  useEffect(() => {
    if (
      currentUser?.role &&
      currentUser.role !== USER_ROLES.DONOR &&
      (pathname === "/donatur" || pathname === "/donatur/dashboard")
    ) {
      router.replace("/admin");
    }
  }, [currentUser, pathname, router]);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Client active session verification & guard
  useEffect(() => {
    let isMounted = true;

    // 1. Fast preliminary check on client storage
    if (typeof window !== "undefined") {
      const stored =
        localStorage.getItem("pabe_auth_user") ||
        localStorage.getItem("ygsm_auth_user");
      if (!stored) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }
    }

    // 2. Authoritative server verification
    async function verifySessionWithServer() {
      try {
        const res = await safeFetch("/api/auth/me", {}, 6000);
        if (!isMounted) return;

        if (res.status === 401) {
          logoutUser();
          router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
      } catch {
        // Fallback for temporary network offline state
        if (!isAuthenticated && typeof window !== "undefined") {
          const stored =
            localStorage.getItem("pabe_auth_user") ||
            localStorage.getItem("ygsm_auth_user");
          if (!stored) {
            router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
          }
        }
      }
    }

    verifySessionWithServer();

    return () => {
      isMounted = false;
    };
  }, [pathname, router, isAuthenticated]);

  const handleToggleSidebar = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col lg:flex-row">
      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Permanently Open Sidebar on Desktop (w-52), Mobile Slide Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-sidebar transform transition-all duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0 lg:z-30 shrink-0 w-52 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <DonorSidebarNav
          currentUser={currentUser}
          isCollapsed={false}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <DonorTopHeader
          currentUser={currentUser}
          onToggleSidebar={handleToggleSidebar}
          isSidebarExpanded={true}
        />
        <main className="p-4 sm:p-6 lg:p-8 flex-1 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
