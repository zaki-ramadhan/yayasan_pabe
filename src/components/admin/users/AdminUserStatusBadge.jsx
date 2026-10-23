import { USER_ROLES } from "@/services/authService";
import { cn } from "@/lib/utils";

export function AdminUserRoleBadge({ role, className = "" }) {
  let label = "Pengurus";
  let colorClass = "bg-slate-100 text-slate-800 border-slate-200";

  switch (role) {
    case USER_ROLES.SUPER_ADMIN:
      label = "Super admin";
      colorClass = "bg-amber-50 text-amber-900 border-amber-200/90";
      break;
    case USER_ROLES.ADMIN:
      label = "Admin yayasan";
      colorClass = "bg-slate-100 text-slate-800 border-slate-200/90";
      break;
    case USER_ROLES.FINANCE:
      label = "Admin keuangan";
      colorClass = "bg-blue-50 text-blue-900 border-blue-200/90";
      break;
    case USER_ROLES.VOLUNTEER:
      label = "Relawan lapangan";
      colorClass = "bg-emerald-50 text-emerald-900 border-emerald-200/90";
      break;
    default:
      label = role || "Pengurus";
      colorClass = "bg-slate-100 text-slate-800 border-slate-200/90";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border leading-tight whitespace-nowrap",
        colorClass,
        className
      )}
    >
      {label}
    </span>
  );
}

export function AdminUserStatusBadge({ isActive, className = "" }) {
  if (isActive) {
    return (
      <span
        className={cn(
          "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/90 whitespace-nowrap",
          className
        )}
      >
        <span>Aktif</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-rose-800 bg-rose-50 border border-rose-200/90 whitespace-nowrap",
        className
      )}
    >
      <span>Ditangguhkan</span>
    </span>
  );
}
