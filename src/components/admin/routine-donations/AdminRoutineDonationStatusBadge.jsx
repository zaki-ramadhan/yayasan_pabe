import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  ACTIVE: {
    label: "Aktif",
    className: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
  },
  PAUSED: {
    label: "Dijeda",
    className: "bg-amber-50 text-amber-800 border-amber-200/80",
  },
  CANCELLED: {
    label: "Dibatalkan",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
};

export function AdminRoutineDonationStatusBadge({ status, className }) {
  const config = STATUS_CONFIG[status] || {
    label: status || "Tidak diketahui",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border leading-relaxed whitespace-nowrap",
        config.className,
        className
      )}
    >
      <span>{config.label}</span>
    </span>
  );
}
