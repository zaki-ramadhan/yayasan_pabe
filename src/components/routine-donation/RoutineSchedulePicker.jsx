"use client";

import { ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/DropdownMenu";
import { FREQUENCY_OPTIONS, normalizeFrequency } from "@/data/routineDonation";
import { cn } from "@/lib/utils";
import { RoutineWeeklyDayPicker } from "./RoutineWeeklyDayPicker";
import { RoutineMonthlyDatePicker } from "./RoutineMonthlyDatePicker";

/**
 * Schedule picker coordinator for routine donation (Daily, Weekly, Monthly)
 * @param {object} props
 * @param {object} props.item - Program item config
 * @param {Function} props.onChange - (itemId, field, value) handler
 * @param {boolean} [props.isFirstIndex] - Attach tour ID if first index
 */
export function RoutineSchedulePicker({ item, onChange, isFirstIndex = false }) {
  const currentFrequency = normalizeFrequency(item.frequency);
  const selectedFreq =
    FREQUENCY_OPTIONS.find((f) => f.value === currentFrequency) || FREQUENCY_OPTIONS[0];

  const handleFrequencySelect = (freqValue) => {
    onChange(item.id, "frequency", freqValue);
    if (freqValue === "WEEKLY" && !item.selectedDay) {
      onChange(item.id, "selectedDay", "jumat");
    }
    if (freqValue === "MONTHLY" && !item.monthlyDate) {
      onChange(item.id, "monthlyDate", new Date().toISOString());
    }
  };

  return (
    <div id={isFirstIndex ? "tour-schedule-frequency" : undefined} className="space-y-2">
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-slate-800 block">
          Jadwal donasi rutin
        </label>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="group flex h-11 w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-normal text-slate-900 hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors cursor-pointer text-left [&[data-state=open]>svg]:rotate-180"
            >
              <span className="truncate">{selectedFreq.label}</span>
              <ChevronDown className="h-4 w-4 text-slate-500 shrink-0 ml-2 transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-180" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-[var(--radix-dropdown-menu-trigger-width)] bg-white border border-slate-200 shadow-md rounded-lg p-1.5 z-50"
          >
            {FREQUENCY_OPTIONS.map((freq) => {
              const isSelected = currentFrequency === freq.value;
              return (
                <DropdownMenuItem
                  key={freq.value}
                  onClick={() => handleFrequencySelect(freq.value)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 text-sm font-normal rounded-md cursor-pointer transition-colors",
                    isSelected
                      ? "bg-blue-50 text-primary"
                      : "text-slate-800 hover:bg-slate-100"
                  )}
                >
                  <span className="truncate">{freq.label}</span>
                  {isSelected && (
                    <Check className="h-4 w-4 text-primary shrink-0 ml-2" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Pekanan: Sub-komponen Grid Hari */}
      {currentFrequency === "WEEKLY" && (
        <RoutineWeeklyDayPicker item={item} onChange={onChange} />
      )}

      {/* Bulanan: Sub-komponen Popover Kalender */}
      {currentFrequency === "MONTHLY" && (
        <RoutineMonthlyDatePicker item={item} onChange={onChange} />
      )}
    </div>
  );
}
