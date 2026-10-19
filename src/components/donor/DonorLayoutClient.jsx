/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { DonorSidebarNav } from "@/components/donor/DonorSidebarNav";
import { DonorMobileHeader } from "@/components/donor/DonorMobileHeader";
import { DonorTopHeader } from "@/components/donor/DonorTopHeader";

export function DonorLayoutClient({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, isAuthenticated } = useCurrentUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const leaveTimeoutRef = useRef(null);

  // Detect desktop screen width (>= 1024px)
  useEffect(() => {
    const updateMedia = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    updateMedia();
    window.addEventListener("resize", updateMedia);
    return () => window.removeEventListener("resize", updateMedia);
  }, []);

  // Hover triggers for desktop expand/collapse
  const handleMouseEnter = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    setIsSidebarHovered(true);
  };

  const handleMouseLeave = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }
    // 120ms exit debounce to prevent jitter if cursor briefly slips off the edge
    leaveTimeoutRef.current = setTimeout(() => {
      setIsSidebarHovered(false);
    }, 120);
  };

  useEffect(() => {
    return () => {
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
      }
    };
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Client fallback auth guard
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAuthenticated && typeof window !== "undefined") {
        const stored = localStorage.getItem("pabe_auth_user") || localStorage.getItem("ygsm_auth_user");
        if (!stored) {
          router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [isAuthenticated, router, pathname]);

  // On desktop: collapsed by default, expands on hover. On mobile drawer: always expanded.
  const isCollapsed = isDesktop ? !isSidebarHovered : false;

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col lg:flex-row">
      {/* 1. Mobile Header (Visible on < lg) */}
      <DonorMobileHeader
        currentUser={currentUser}
        isOpen={isMobileMenuOpen}
        onToggle={() => setIsMobileMenuOpen((prev) => !prev)}
      />

      {/* 2. Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 3. Hover-Triggered Responsive Sidebar (w-16 collapsed -> w-52 expanded on hover) */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed inset-y-0 left-0 z-50 bg-sidebar transform transition-all duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0 lg:z-30 shrink-0 ${
          isMobileMenuOpen ? "translate-x-0 w-52" : "-translate-x-full"
        } ${isSidebarHovered ? "lg:w-52" : "lg:w-16"}`}
      >
        <DonorSidebarNav
          currentUser={currentUser}
          isCollapsed={isCollapsed}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />
      </aside>

      {/* 4. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <DonorTopHeader currentUser={currentUser} />
        <main className="p-4 sm:p-6 lg:p-8 flex-1 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
