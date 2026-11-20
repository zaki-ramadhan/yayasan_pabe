import { CheckCircleIcon as CheckCircle } from "@solar-icons/react/bold/check-circle";
import { cn } from "@/lib/utils";

/**
 * Atomic component: Badge penanda bahwa posisi lowongan telah dilamar oleh pengguna aktif
 * @param {object} props
 * @param {string} [props.className]
 */
export function CareerAppliedBadge({ className = "" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs sm:text-[13px] font-medium text-emerald-600 shrink-0 select-none",
        className
      )}
      title="Anda sudah mengirimkan berkas lamaran untuk posisi ini"
    >
      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
      <span>Sudah Dilamar</span>
    </span>
  );
}

