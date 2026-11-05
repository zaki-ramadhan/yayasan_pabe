"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { FormField } from "@/components/ui/FormField";
import { DateRangePicker } from "@/components/ui/DateRangePicker";

/**
 * Optional date validity range for routine donation using Shadcn DateRangePicker
 * @param {object} props
 * @param {object} props.item
 * @param {Function} props.onChange
 */
export function RoutineCustomPeriod({ item, onChange }) {
  const periodError = item.startDateError || item.endDateError;

  return (
    <div className="space-y-2 pt-2 border-t border-slate-100">
      <button
        type="button"
        onClick={() => onChange(item.id, "hasCustomPeriod", !item.hasCustomPeriod)}
        className="flex items-center justify-between w-full py-1 text-sm font-semibold text-slate-800 hover:text-primary transition-colors cursor-pointer select-none"
      >
        <span>Atur masa berlaku (opsional)</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-slate-500 transition-transform duration-200",
            item.hasCustomPeriod && "rotate-180"
          )}
        />
      </button>

      {item.hasCustomPeriod && (
        <div className="space-y-2 pt-1 animate-in fade-in slide-in-from-top-1 duration-150">
          <FormField label="Rentang tanggal aktif" error={periodError}>
            <DateRangePicker
              value={{ from: item.startDate, to: item.endDate }}
              onChange={({ from, to }) => {
                onChange(item.id, "startDate", from);
                onChange(item.id, "endDate", to);
                if (item.startDateError) onChange(item.id, "startDateError", null);
                if (item.endDateError) onChange(item.id, "endDateError", null);
              }}
              placeholder="Pilih rentang tanggal mulai & berakhir..."
              className="h-11"
            />
          </FormField>
          <p className="mt-1 text-xs text-slate-600 italic font-normal">
            *Jadwal donasi rutin akan otomatis berakhir setelah tanggal batas selesai terlewati.
          </p>
        </div>
      )}
    </div>
  );
}

