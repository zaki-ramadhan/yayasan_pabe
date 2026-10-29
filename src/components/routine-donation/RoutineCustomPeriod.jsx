"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";

/**
 * Optional date validity range for routine donation
 * @param {object} props
 * @param {object} props.item
 * @param {Function} props.onChange
 */
export function RoutineCustomPeriod({ item, onChange }) {
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Tanggal mulai" error={item.startDateError}>
              <Input
                type="date"
                value={item.startDate || ""}
                onChange={(e) => {
                  onChange(item.id, "startDate", e.target.value);
                  if (item.startDateError) onChange(item.id, "startDateError", null);
                }}
                className="h-11 bg-white cursor-pointer"
              />
            </FormField>

            <FormField label="Tanggal berakhir" error={item.endDateError}>
              <Input
                type="date"
                value={item.endDate || ""}
                min={item.startDate || ""}
                onChange={(e) => {
                  onChange(item.id, "endDate", e.target.value);
                  if (item.endDateError) onChange(item.id, "endDateError", null);
                }}
                className="h-11 bg-white cursor-pointer"
              />
            </FormField>
          </div>
          <p className="mt-1 text-sm text-slate-600 italic font-normal">
            *Jadwal donasi rutin akan otomatis berakhir setelah tanggal batas selesai terlewati.
          </p>
        </div>
      )}
    </div>
  );
}

