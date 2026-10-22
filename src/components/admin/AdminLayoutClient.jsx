"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";
import { AdminTopHeader } from "@/components/admin/AdminTopHeader";
import { USER_ROLES } from "@/services/authService";
import { safeFetch } from "@/lib/safeFetch";

export function AdminLayoutClient({ children, initialUser }) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState(initialUser || null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Tutup drawer saat navigasi rute berubah
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Pantau perubahan session storage/auth
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ygsm_auth_user") || localStorage.getItem("pabe_auth_user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.role !== USER_ROLES.DONOR) {
            setCurrentUser(parsed);
          } else {
            router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
          }
        } catch {
          router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
      } else {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    }
  }, [pathname, router]);

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
        <AdminSidebarNav
          isCollapsed={false}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <AdminTopHeader
          currentUser={currentUser}
          onToggleSidebar={handleToggleSidebar}
          isSidebarExpanded={true}
        />
        <main className="p-4 sm:p-6 lg:p-8 flex-1 w-full max-w-7xl mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
