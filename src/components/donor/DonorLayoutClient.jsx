/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { DonorSidebarNav } from "@/components/donor/DonorSidebarNav";
import { DonorTopHeader } from "@/components/donor/DonorTopHeader";
import { logoutUser, loginUser, getStoredUser, USER_ROLES } from "@/services/authService";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/useToast";

export function DonorLayoutClient({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, isAuthenticated } = useCurrentUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Tampilkan toast sambutan setelah login donatur berhasil
  useEffect(() => {
    if (typeof window !== "undefined") {
      const justLoggedIn = sessionStorage.getItem("pabe_just_logged_in");
      if (justLoggedIn) {
        sessionStorage.removeItem("pabe_just_logged_in");
        toast.success(`Selamat datang, ${justLoggedIn}! Berhasil masuk ke akun donatur.`);
      }
    }
  }, []);

  // Jika akun adalah administrator/staf, selalu alihkan ke portal admin
  useEffect(() => {
    if (currentUser?.role && currentUser.role !== USER_ROLES.DONOR) {
      router.replace("/admin");
    }
  }, [currentUser, router]);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Client active session verification & guard
  useEffect(() => {
    let isMounted = true;

    // 1. Fast preliminary check on client storage via getStoredUser (with expiration verification)
    const stored = getStoredUser();
    if (!stored) {
      logoutUser();
      toast.error("Sesi donatur telah berakhir. Silakan masuk kembali.");
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (stored.role && stored.role !== USER_ROLES.DONOR) {
      router.replace("/admin");
      return;
    }

    // 2. Authoritative server verification
    async function verifySessionWithServer() {
      try {
        const res = await safeFetch("/api/auth/me", {}, 6000);
        if (!isMounted) return;

        if (res.status === 401) {
          logoutUser();
          toast.error("Sesi donatur telah berakhir. Silakan masuk kembali.");
          router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
          return;
        }

        const data = await res.json().catch(() => null);
        if (data?.data?.role && data.data.role !== USER_ROLES.DONOR) {
          router.replace("/admin");
          return;
        }

        if (data?.data) {
          const current = getStoredUser();
          if (
            current &&
            (current.avatar !== data.data.avatar ||
              current.name !== data.data.name ||
              current.customAvatar !== data.data.customAvatar)
          ) {
            loginUser({ ...current, ...data.data });
          }
        }
      } catch {
        // Fallback for temporary network offline state
        if (!getStoredUser()) {
          router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
      }
    }

    verifySessionWithServer();

    // Check expiration on window focus
    const handleFocus = () => {
      const u = getStoredUser();
      if (!u) {
        logoutUser();
        toast.error("Sesi donatur telah berakhir. Silakan masuk kembali.");
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (u.role && u.role !== USER_ROLES.DONOR) {
        router.replace("/admin");
      }
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", handleFocus);
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

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <DonorTopHeader
          currentUser={currentUser}
          onToggleSidebar={handleToggleSidebar}
          isSidebarExpanded={true}
        />
        <main className="px-4 sm:px-6 lg:px-8 pt-3.5 sm:pt-4.5 lg:pt-5 pb-6 sm:pb-8 flex-1 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
