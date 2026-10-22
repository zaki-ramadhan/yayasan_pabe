/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { DonorSidebarNav } from "@/components/donor/DonorSidebarNav";
import { DonorTopHeader } from "@/components/donor/DonorTopHeader";
import { logoutUser, USER_ROLES } from "@/services/authService";
import { safeFetch } from "@/lib/safeFetch";

export function DonorLayoutClient({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, isAuthenticated } = useCurrentUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

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

  // Detect desktop screen width (>= 1024px)
  useEffect(() => {
    const updateMedia = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    updateMedia();
    window.addEventListener("resize", updateMedia);
    return () => window.removeEventListener("resize", updateMedia);
  }, []);

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
    if (isDesktop) {
      setIsSidebarExpanded((prev) => !prev);
    } else {
      setIsMobileMenuOpen((prev) => !prev);
    }
  };

  // On desktop: collapsed when not expanded. On mobile drawer: always expanded.
  const isCollapsed = isDesktop ? !isSidebarExpanded : false;

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

      {/* Responsive Sidebar (w-16 collapsed -> w-52 expanded via toggle button) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-sidebar transform transition-all duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0 lg:z-30 shrink-0 ${
          isMobileMenuOpen ? "translate-x-0 w-52" : "-translate-x-full"
        } ${isSidebarExpanded ? "lg:w-52" : "lg:w-16"}`}
      >
        <DonorSidebarNav
          currentUser={currentUser}
          isCollapsed={isCollapsed}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <DonorTopHeader
          currentUser={currentUser}
          onToggleSidebar={handleToggleSidebar}
          isSidebarExpanded={isDesktop ? isSidebarExpanded : isMobileMenuOpen}
        />
        <main className="p-4 sm:p-6 lg:p-8 flex-1 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
