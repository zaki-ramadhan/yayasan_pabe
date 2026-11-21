import { BellIcon as Bell } from "@solar-icons/react/line-duotone/bell";
import { CalendarIcon as Calendar } from "@solar-icons/react/line-duotone/calendar";
import { formatRupiah, formatDateRange } from "@/lib/formatters";
import { getRoutineProgramAmount } from "@/lib/routineDonationConstants";
import { formatRoutineSchedule } from "./RoutineProgramItem";
import { Badge } from "@/components/ui/Badge";

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
      <div className="flex items-start gap-2 min-w-0">
        <span className="text-sm font-medium text-slate-950 line-clamp-2 leading-snug">
          {campaign?.title || "Program Donasi"}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
        <Badge variant="secondary" className="gap-1.5">
          <Bell className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>{formatRoutineSchedule(program)}, pukul {program.reminderTime || "05:00"} WIB</span>
        </Badge>

        <Badge variant="secondary">
          <span>Nominal {formatRupiah(nominal)}</span>
        </Badge>

        {program.hasCustomPeriod && program.startDate && (
          <Badge variant="secondary" className="gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>
              {formatDateRange(program.startDate, program.endDate)}
            </span>
          </Badge>
        )}
      </div>
    </div>
  );
}
