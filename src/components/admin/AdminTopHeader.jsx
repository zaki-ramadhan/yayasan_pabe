"use client";

import { PanelLeft } from "lucide-react";
import { ROLE_LABELS, USER_ROLES } from "@/services/authService";

export function AdminTopHeader({
  currentUser,
  onToggleSidebar,
  isSidebarExpanded = false,
}) {
  const userRole = currentUser?.role || USER_ROLES.SUPER_ADMIN;

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
      {/* Left: Sidebar Toggle Button + Portal Title */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={isSidebarExpanded ? "Kecilkan bilah menu" : "Perluas bilah menu"}
          title={isSidebarExpanded ? "Kecilkan menu samping" : "Perluas menu samping"}
          className="p-1.5 -ml-1.5 rounded-md text-slate-500 hover:text-slate-950 hover:bg-slate-100/80 transition-colors cursor-pointer flex items-center justify-center shrink-0"
        >
          <PanelLeft className="w-5 h-5" />
        </button>

        <span className="text-base sm:text-lg font-medium text-slate-950 leading-tight truncate">
          Portal Administrator
        </span>
      </div>

      {/* Right: Clean User Info & Avatar */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right hidden sm:block">
          <span className="text-sm font-medium text-slate-900 block leading-tight">
            {currentUser?.name || "Administrator"}
          </span>
          <span className="text-sm text-slate-500 block">
            {ROLE_LABELS[userRole] || userRole}
          </span>
        </div>

        <div
          className="w-9 h-9 sm:w-9.5 sm:h-9.5 rounded-full bg-slate-100 border border-slate-200 text-sm font-semibold text-slate-800 flex items-center justify-center shadow-2xs"
          title={currentUser?.name || "Pengurus"}
        >
          {currentUser?.initials || "A"}
        </div>
      </div>
    </header>
  );
}
