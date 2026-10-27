"use client";

import { useState } from "react";
import Image from "next/image";
import { PanelLeft } from "lucide-react";
import { ROLE_LABELS, USER_ROLES } from "@/services/authService";
import { SuperAdminNoticeBanner } from "@/components/admin/SuperAdminNoticeBanner";
import { getInitials } from "@/lib/formatters";

export function AdminTopHeader({
  currentUser,
  onToggleSidebar,
  isSidebarExpanded = false,
}) {
  const userRole = currentUser?.role || USER_ROLES.SUPER_ADMIN;
  const isSuperAdmin = userRole === USER_ROLES.SUPER_ADMIN;
  const [imgError, setImgError] = useState(false);

  const avatarUrl = !imgError
    ? (currentUser?.avatar || currentUser?.image || currentUser?.picture || currentUser?.avatarUrl)
    : null;

  const fallbackInitial =
    currentUser?.initials || getInitials(currentUser?.name, "A");

  return (
    <div className="sticky top-0 z-20">
      <SuperAdminNoticeBanner isSuperAdmin={isSuperAdmin} />
      <header className="bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4">
      {/* Left: Sidebar Toggle Button + Panel Title */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={isSidebarExpanded ? "Kecilkan bilah menu" : "Perluas bilah menu"}
          title={isSidebarExpanded ? "Kecilkan menu samping" : "Perluas menu samping"}
          className="lg:hidden p-1.5 -ml-1.5 rounded-md text-slate-500 hover:text-slate-950 hover:bg-slate-100/80 transition-colors cursor-pointer flex items-center justify-center shrink-0"
        >
          <PanelLeft className="w-4.5 h-4.5" />
        </button>

        <span className="text-sm sm:text-base font-medium text-slate-900 leading-tight truncate">
          Panel admin
        </span>
      </div>

      {/* Right: Clean User Info & Avatar */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="text-right hidden sm:block">
          <span className="text-sm font-medium text-slate-900 block leading-tight">
            {currentUser?.name || "Administrator"}
          </span>
          <span className="text-sm text-slate-500 font-normal block leading-tight mt-0.5">
            {(ROLE_LABELS[userRole] || currentUser?.title || userRole || "Administrator")
              .replace(/\s*\(Ketua Yayasan\)/gi, "")
              .replace(/\s*Ketua Yayasan/gi, "")}
          </span>
        </div>

        <div
          className="relative w-9 h-9 rounded-full overflow-hidden bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800 flex items-center justify-center shadow-2xs shrink-0 select-none"
          title={currentUser?.name || "Pengurus"}
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={currentUser?.name || "Avatar"}
              fill
              sizes="36px"
              unoptimized={typeof avatarUrl === "string" && !avatarUrl.startsWith("/") && !avatarUrl.includes("lh3.googleusercontent.com")}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <span>{fallbackInitial}</span>
          )}
        </div>
      </div>
    </header>
    </div>
  );
}
