import { Bell, Calendar } from "lucide-react";
import { formatRupiah, formatDateRange } from "@/lib/formatters";
import { getRoutineProgramAmount } from "@/lib/routineDonationConstants";
import { formatRoutineSchedule } from "./RoutineProgramItem";

/**
 * Single routine donation breakdown row inside RoutineSummaryCard
 * @param {object} program - Program schedule config
 * @param {number} index - Position index (0-based)
 * @param {object} campaign - Matching campaign object
 */
export function RoutineSummaryItem({ program, index, campaign }) {
  const nominal = getRoutineProgramAmount(program);
  const isReminderOnly = (program.routineType || "REMINDER_ONLY") === "REMINDER_ONLY";

  return (
    <div className="pb-3.5 border-b border-slate-100 last:border-0 last:pb-0 text-sm space-y-1">
      {/* Program Title */}
      <div className="flex items-start gap-2 min-w-0">
        <span className="text-sm font-medium text-slate-950 line-clamp-2 leading-snug">
          {campaign?.title || "Program Donasi"}
        </span>
      </div>

      {/* Parameter Chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
        {/* Chip 1: Jadwal */}
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
          <Bell className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>{formatRoutineSchedule(program)} • {program.reminderTime || "05:00"} WIB</span>
        </span>

        {/* Chip 2: Nominal */}
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
          <span>Nominal {formatRupiah(nominal)}</span>
        </span>

        {/* Chip 3 (Opsional): Periode Kustom */}
        {program.hasCustomPeriod && program.startDate && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>
              {formatDateRange(program.startDate, program.endDate)}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
