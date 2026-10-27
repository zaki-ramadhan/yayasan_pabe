"use client";

import { useState } from "react";
import Image from "next/image";
import { ROLE_LABELS, USER_ROLES } from "@/services/authService";

/**
 * Admin user profile badge
 * @param {object} props
 * @param {object} props.currentUser
 */
export function AdminUserProfile({ currentUser }) {
  const userRole = currentUser?.role || USER_ROLES.SUPER_ADMIN;
  const [imgError, setImgError] = useState(false);

  const avatarUrl = !imgError
    ? (currentUser?.avatar || currentUser?.image || currentUser?.picture || currentUser?.avatarUrl)
    : null;

  const fallbackInitial =
    currentUser?.initials ||
    (currentUser?.name ? currentUser.name.trim().charAt(0).toUpperCase() : "A");

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-2 shadow-2xs">
      <div className="flex items-center gap-3">
        <div className="relative w-9 h-9 rounded-full overflow-hidden bg-slate-100 border border-slate-200 text-slate-800 text-sm font-semibold flex items-center justify-center shrink-0 select-none">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={currentUser?.name || "User"}
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
        <div className="min-w-0">
          <span className="text-sm font-medium text-slate-900 block truncate">
            {currentUser?.name || "Pengguna"}
          </span>
          <span className="text-xs text-slate-500 font-normal block truncate">
            {(ROLE_LABELS[userRole] || currentUser?.title || userRole || "Pengurus")
              .replace(/\s*\(Ketua Yayasan\)/gi, "")
              .replace(/\s*Ketua Yayasan/gi, "")}
          </span>
        </div>
      </div>
    </div>
  );
}
