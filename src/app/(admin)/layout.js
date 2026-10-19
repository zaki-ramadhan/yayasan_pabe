"use client";

import { useSyncExternalStore, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  logoutUser,
  loginUser,
  USER_ROLES,
} from "@/services/authService";
import { AdminUserProfile } from "@/components/admin/AdminUserProfile";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";
import { AdminHeader } from "@/components/admin/AdminHeader";

function subscribeAuth(callback) {
  window.addEventListener("ygsm_auth_change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("ygsm_auth_change", callback);
    window.removeEventListener("storage", callback);
  };
}

function getAuthSnapshot() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ygsm_auth_user") || localStorage.getItem("pabe_auth_user");
}

function getAuthServerSnapshot() {
  return null;
}

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const userJson = useSyncExternalStore(subscribeAuth, getAuthSnapshot, getAuthServerSnapshot);
  let currentUser = null;
  if (userJson) {
    try {
      currentUser = JSON.parse(userJson);
    } catch {
      currentUser = null;
    }
  }

  const isAdmin = Boolean(currentUser && currentUser.role && currentUser.role !== USER_ROLES.DONOR);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ygsm_auth_user") || localStorage.getItem("pabe_auth_user");
      if (!stored) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }
      try {
        const parsed = JSON.parse(stored);
        if (!parsed || parsed.role === USER_ROLES.DONOR) {
          router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
      } catch {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    }
  }, [pathname, router]);

  const handleRoleSwitch = (targetUser) => {
    loginUser(targetUser);
  };

  const handleLogout = () => {
    logoutUser();
    router.push("/");
  };

  if (!currentUser || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
        <div className="space-y-3 max-w-sm">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-300">Memverifikasi hak akses administrator...</p>
        </div>
      </div>
    );
  }

  const userRole = currentUser?.role || USER_ROLES.SUPER_ADMIN;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-68 bg-slate-950 text-white p-5 space-y-6 shrink-0 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Brand */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-md overflow-hidden bg-white shrink-0 p-0.5 border border-slate-700 shadow-xs flex items-center justify-center">
                <Image
                  src="/logo_yayasan_GSM.png"
                  alt="Logo Yayasan PABE"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain rounded-sm"
                />
              </div>
              <div>
                <span className="font-bold text-sm block text-white leading-tight">
                  Portal Yayasan
                </span>
                <span className="text-[11px] text-slate-400">
                  Yayasan PABE
                </span>
              </div>
            </Link>
          </div>

          {/* User Profile Card */}
          <AdminUserProfile
            currentUser={currentUser}
            onRoleSwitch={handleRoleSwitch}
          />

          {/* Nav Links Based on Role */}
          <AdminSidebarNav
            pathname={pathname}
            onLogout={handleLogout}
          />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader userRole={userRole} />
        <main className="p-4 sm:p-6 lg:p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
