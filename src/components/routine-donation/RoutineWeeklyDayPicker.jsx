"use client";

import { DAYS_OF_WEEK } from "@/data/routineDonation";
import { cn } from "@/lib/utils";

/**
 * Sub-komponen pemilihan hari pekanan untuk donasi rutin (Senin - Minggu)
 * @param {object} props
 * @param {object} props.item
 * @param {Function} props.onChange
 */
export function RoutineWeeklyDayPicker({ item, onChange }) {
  const selectedDayId = item.selectedDay || "jumat";
  const selectedDayLabel =
    DAYS_OF_WEEK.find((d) => d.id === selectedDayId)?.label || "Jumat";

  return (
    <div className="space-y-2 pt-1 animate-in fade-in slide-in-from-top-1 duration-150">
      <label className="text-sm font-semibold text-slate-800 block">
        Pilih hari donasi rutin
      </label>
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        {DAYS_OF_WEEK.map((day) => {
          const isSelected = selectedDayId === day.id;
          return (
            <button
              key={day.id}
              type="button"
              onClick={() => onChange(item.id, "selectedDay", day.id)}
              className={cn(
                "py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg text-sm font-medium border transition-all text-center cursor-pointer min-h-[40px] sm:min-h-[42px] flex items-center justify-center",
                day.id === "minggu" && "col-start-2 col-span-1",
                isSelected
                  ? "bg-blue-50 text-blue-950 border-blue-600 ring-1 ring-blue-600 shadow-2xs"
                  : "bg-white border-slate-300 text-slate-800 hover:bg-slate-50"
              )}
            >
              {day.label}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-slate-600 italic font-normal">
        *Jadwal donasi akan diingatkan atau ditagihkan setiap hari {selectedDayLabel}.
      </p>
    </div>
  );
}
