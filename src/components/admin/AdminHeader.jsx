import { ShieldCheck } from "lucide-react";
import { ROLE_LABELS, USER_ROLES } from "@/services/authService";

/**
 * Top header for admin portal layout
 * @param {object} props
 * @param {string} props.userRole
 */
export function AdminHeader({ userRole = USER_ROLES.SUPER_ADMIN }) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-base font-semibold text-slate-900">
          Portal Pengelola & Civitas Yayasan
        </h1>
        <p className="text-sm text-slate-500">
          Hak Akses Aktif: <span className="font-semibold">{ROLE_LABELS[userRole] || userRole}</span>
        </p>
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>Sesi Terautentikasi</span>
      </div>
    </header>
  );
}
