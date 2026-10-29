import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium truncate whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-primary",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary-light text-primary border-primary/20",
        secondary: "border-transparent bg-slate-100 text-slate-800",
        success: "border-transparent bg-emerald-50 text-emerald-700 border-emerald-200/80",
        urgent: "border-transparent bg-warning-light text-amber-800 border-warning/20",
        warning: "border-transparent bg-amber-50 text-amber-800 border-amber-200/80",
        danger: "border-transparent bg-rose-50 text-rose-700 border-rose-200/80",
        outline: "border-border-strong text-slate-800",
        info: "border-transparent bg-sky-50 text-sky-700 border-sky-200/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
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
  SUPER_ADMIN: { label: "Super admin", variant: "warning" },
  ADMIN: { label: "Admin yayasan", variant: "secondary" },
  FINANCE: { label: "Admin keuangan", variant: "info" },
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
