import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center max-w-[160px] rounded-md border px-2 py-0.5 text-xs font-normal leading-tight truncate whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-primary",
  {
    variants: {
      variant: {
        default: "bg-primary-light text-primary border-primary/25",
        secondary: "bg-slate-100 text-slate-800 border-slate-200",
        success: "bg-emerald-50 text-emerald-800 border-emerald-200",
        urgent: "bg-warning-light text-amber-800 border-amber-300/80",
        warning: "bg-amber-50 text-amber-800 border-amber-200",
        danger: "bg-rose-50 text-rose-800 border-rose-200",
        outline: "border-slate-300 text-slate-800 bg-white",
        info: "bg-sky-50 text-sky-800 border-sky-200",
        purple: "bg-purple-50 text-purple-800 border-purple-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, children, title, ...props }) {
  const isTextContent =
    typeof children === "string" || typeof children === "number";

  const resolvedTitle =
    title !== undefined
      ? title
      : isTextContent
      ? String(children)
      : undefined;

  return (
    <div
      className={cn(badgeVariants({ variant }), className)}
      title={resolvedTitle}
      {...props}
    >
      {isTextContent ? (
        <span className="truncate block w-full min-w-0">{children}</span>
      ) : (
        children
      )}
    </div>
  );
}

const STATUS_CONFIG_MAP = {
  ACTIVE: { variant: "success", label: "Aktif" },
  PAID: { variant: "success", label: "Berhasil" },
  SUCCESS: { variant: "success", label: "Berhasil" },
  COMPLETED: { variant: "success", label: "Selesai" },
  VERIFIED: { variant: "success", label: "Terverifikasi" },
  APPROVED: { variant: "success", label: "Disetujui" },
  PUBLISHED: { variant: "success", label: "Tayang" },

  PENDING: { variant: "warning", label: "Menunggu" },
  WAITING: { variant: "warning", label: "Menunggu" },
  PAUSED: { variant: "warning", label: "Dijeda" },
  DRAFT: { variant: "secondary", label: "Draf" },
  CONTACTED: { variant: "info", label: "Dihubungi" },

  EXPIRED: { variant: "danger", label: "Kedaluwarsa" },
  FAILED: { variant: "danger", label: "Gagal" },
  CANCELLED: { variant: "danger", label: "Dibatalkan" },
  REJECTED: { variant: "danger", label: "Ditolak" },
  SUSPENDED: { variant: "danger", label: "Ditangguhkan" },
  INACTIVE: { variant: "secondary", label: "Nonaktif" },
  CLOSED: { variant: "secondary", label: "Ditutup" },

  REVIEWED: { variant: "info", label: "Telah Direview" },
  SHORTLISTED: { variant: "success", label: "Lolos Seleksi" },
};

/**
 * Komponen terpusat untuk menampilkan badge status entitas di seluruh tabel/kartu aplikasi
 */
function StatusBadge({ status, label, variant, className, ...props }) {
  const normalizedKey = String(status || "").trim().toUpperCase();
  const config = STATUS_CONFIG_MAP[normalizedKey] || { variant: "secondary", label: status || "-" };
  const resolvedVariant = variant || config.variant;
  const resolvedLabel = label !== undefined ? label : config.label;

  return (
    <Badge variant={resolvedVariant} className={className} {...props}>
      {resolvedLabel}
    </Badge>
  );
}

const ROLE_CONFIG_MAP = {
  SUPER_ADMIN: { label: "Super admin", variant: "purple" },
  ADMIN: { label: "Admin", variant: "info" },
  FINANCE: { label: "Admin keuangan", variant: "default" },
  VOLUNTEER: { label: "Relawan lapangan", variant: "success" },
};

/**
 * Komponen terpusat untuk menampilkan role pengguna/staf yayasan
 */
function RoleBadge({ role, label, variant, className, ...props }) {
  const normalizedKey = String(role || "").trim().toUpperCase();
  const config = ROLE_CONFIG_MAP[normalizedKey] || { label: role || "Pengurus", variant: "secondary" };
  const resolvedVariant = variant || config.variant;
  const resolvedLabel = label !== undefined ? label : config.label;

  return (
    <Badge variant={resolvedVariant} className={className} {...props}>
      {resolvedLabel}
    </Badge>
  );
}

export { Badge, StatusBadge, RoleBadge, badgeVariants };
export { RibbonBadge, ribbonBadgeVariants } from "./RibbonBadge";
