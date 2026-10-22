"use client";

import Image from "next/image";
import { ROLE_LABELS, USER_ROLES } from "@/services/authService";

/**
 * Admin user profile badge
 * @param {object} props
 * @param {object} props.currentUser
 */
export function AdminUserProfile({ currentUser }) {
  const userRole = currentUser?.role || USER_ROLES.SUPER_ADMIN;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-2 shadow-2xs">
      <div className="flex items-center gap-3">
        {currentUser?.avatar ? (
          <Image
            src={currentUser.avatar}
            alt={currentUser.name || "User"}
            width={36}
            height={36}
            unoptimized
            className="w-9 h-9 rounded-full object-cover border border-slate-200 bg-slate-100 shrink-0"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-sm font-semibold flex items-center justify-center shrink-0">
            {currentUser?.initials || "A"}
          </div>
        )}
        <div className="min-w-0">
          <span className="text-sm font-semibold text-slate-900 block truncate">
            {currentUser?.name || "Pengguna"}
          </span>
          <span className="text-sm text-slate-500 font-normal block truncate">
            {ROLE_LABELS[userRole] || userRole}
          </span>
        </div>
      </div>
    </div>
  );
}
