import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  ACTIVE: {
    label: "Aktif",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    dotClassName: "bg-emerald-500",
  },
  PAUSED: {
    label: "Dijeda",
    className: "bg-amber-50 text-amber-700 border-amber-200/80",
    dotClassName: "bg-amber-500",
  },
  CANCELLED: {
    label: "Dibatalkan",
    className: "bg-slate-100 text-slate-600 border-slate-200",
    dotClassName: "bg-slate-400",
  },
};

export function AdminRoutineDonationStatusBadge({ status, className }) {
  const config = STATUS_CONFIG[status] || {
    label: status || "Tidak diketahui",
    className: "bg-slate-100 text-slate-600 border-slate-200",
    dotClassName: "bg-slate-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-normal border leading-relaxed",
        config.className,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", config.dotClassName)} />
      <span>{config.label}</span>
    </span>
  );
}
