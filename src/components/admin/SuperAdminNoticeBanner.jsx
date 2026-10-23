"use client";

import { ShieldCheck } from "lucide-react";

/**
 * Thin differentiator banner exclusively shown for Super Admin users.
 * Features an authoritative, mature gradient background and concise status text.
 * @param {object} props
 * @param {boolean} props.isSuperAdmin
 */
export function SuperAdminNoticeBanner({ isSuperAdmin = false }) {
  if (!isSuperAdmin) return null;

  return (
    <div
      role="status"
      aria-label="Status hak akses super administrator"
      className="w-full bg-gradient-to-r from-slate-950 via-amber-900 to-slate-900 text-white px-4 sm:px-6 lg:px-8 py-1.5 text-xs flex items-center justify-center border-b border-amber-500/30 select-none shadow-2xs"
    >
      <div className="flex items-center gap-4">
        <span>
          Mode Super Admin
        </span>
        <ShieldCheck className="w-4 h-4 text-white shrink-0" aria-hidden="true" />
        <span>
          Akses penuh sistem aktif
        </span>
      </div>
    </div>
  );
}
