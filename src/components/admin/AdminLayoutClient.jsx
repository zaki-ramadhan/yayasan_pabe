/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";
import { AdminTopHeader } from "@/components/admin/AdminTopHeader";
import { getStoredUser, logoutUser, USER_ROLES } from "@/services/authService";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/use-toast";

export function AdminLayoutClient({ children, initialUser }) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState(initialUser || null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Tampilkan toast notifikasi sambutan setelah login berhasil
  useEffect(() => {
    if (typeof window !== "undefined") {
      const justLoggedIn = sessionStorage.getItem("pabe_just_logged_in");
      if (justLoggedIn) {
        sessionStorage.removeItem("pabe_just_logged_in");
        toast.success(`Selamat datang kembali, ${justLoggedIn}! Sesi pengurus berhasil diaktifkan.`);
      }
    }
  }, []);

  // Tutup drawer saat navigasi rute berubah
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Pantau sesi, batas kedaluwarsa, dan idle timeout (2 jam untuk admin)
  useEffect(() => {
    let isMounted = true;
    const IDLE_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 jam tanpa aktivitas

    const checkSession = () => {
      const user = getStoredUser();
      if (!user || user.role === USER_ROLES.DONOR) {
        logoutUser();
        toast.error("Sesi pengurus telah berakhir. Silakan masuk kembali.");
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        return false;
      }
      setCurrentUser(user);

      // Cek batas waktu idle
      const lastActivity = Number(sessionStorage.getItem("pabe_last_activity") || Date.now());
      if (Date.now() - lastActivity > IDLE_TIMEOUT_MS) {
        logoutUser();
        sessionStorage.removeItem("pabe_last_activity");
        toast.error("Sesi Anda kedaluwarsa karena tidak ada aktivitas selama 2 jam.");
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        return false;
      }
      return true;
    };

    if (!checkSession()) return;

    // Inisialisasi aktivitas awal
    sessionStorage.setItem("pabe_last_activity", String(Date.now()));

    let lastRecorded = Date.now();
    const handleUserInteraction = () => {
      const now = Date.now();
      if (now - lastRecorded > 60000) {
        lastRecorded = now;
        sessionStorage.setItem("pabe_last_activity", String(now));
      }
    };

    window.addEventListener("click", handleUserInteraction, { passive: true });
    window.addEventListener("keydown", handleUserInteraction, { passive: true });
    window.addEventListener("scroll", handleUserInteraction, { passive: true });
    window.addEventListener("focus", checkSession);

    // Verifikasi berkala ke server dan cek kedaluwarsa setiap 60 detik
    const intervalId = setInterval(async () => {
      if (!isMounted) return;
      const valid = checkSession();
      if (!valid) return;

      try {
        const res = await safeFetch("/api/auth/me", {}, 5000);
        if (res.status === 401 && isMounted) {
          logoutUser();
          toast.error("Sesi pengurus telah berakhir. Silakan masuk kembali.");
          router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
      } catch {
        // Abaikan gangguan jaringan sementara
      }
    }, 60000);

    // Verifikasi server saat pertama kali mount
    safeFetch("/api/auth/me", {}, 5000)
      .then((res) => {
        if (res.status === 401 && isMounted) {
          logoutUser();
          toast.error("Sesi pengurus telah berakhir. Silakan masuk kembali.");
          router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
      window.removeEventListener("scroll", handleUserInteraction);
      window.removeEventListener("focus", checkSession);
    };
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
