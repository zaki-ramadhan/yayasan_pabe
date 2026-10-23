"use client";

import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ChevronDown, Check, Calendar as CalendarIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DAYS_OF_WEEK, FREQUENCY_OPTIONS, normalizeFrequency } from "@/data/routineDonation";
import { cn } from "@/lib/utils";

/**
 * Schedule picker for routine donation (Daily, Weekly Day, Monthly Date)
 * @param {object} item - Program item config
 * @param {Function} onChange - (itemId, field, value) handler
 * @param {boolean} [isFirstIndex] - Attach tour ID if first index
 */
export function RoutineSchedulePicker({ item, onChange, isFirstIndex = false }) {
  const currentFrequency = normalizeFrequency(item.frequency);
  const selectedFreq =
    FREQUENCY_OPTIONS.find((f) => f.value === currentFrequency) || FREQUENCY_OPTIONS[0];

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
              className="group flex h-11 w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm sm:text-base font-normal text-slate-900 hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors cursor-pointer text-left [&[data-state=open]>svg]:rotate-180"
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
                  onClick={() => {
                    onChange(item.id, "frequency", freq.value);
                    if (freq.value === "WEEKLY" && !item.selectedDay) {
                      onChange(item.id, "selectedDay", "jumat");
                    }
                    if (freq.value === "MONTHLY" && !item.monthlyDate) {
                      onChange(item.id, "monthlyDate", new Date().toISOString());
                    }
                  }}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 text-sm font-normal rounded-md cursor-pointer transition-colors",
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

      {/* Pekanan (Grid Hari) */}
      {currentFrequency === "WEEKLY" && (
        <div className="space-y-2 pt-1 animate-in fade-in slide-in-from-top-1 duration-150">
          <label className="text-sm font-medium text-slate-800 block">
            Pilih hari donasi rutin
          </label>
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = (item.selectedDay || "jumat") === day.id;
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => onChange(item.id, "selectedDay", day.id)}
                  className={cn(
                    "py-2.5 sm:py-3 px-2 sm:px-3 rounded-lg text-sm sm:text-base border transition-all text-center cursor-pointer min-h-[44px] sm:min-h-[46px] flex items-center justify-center font-medium",
                    day.id === "minggu" && "col-span-3",
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
          <p className="text-xs sm:text-sm text-slate-600 italic font-normal">
            *Jadwal donasi akan diingatkan atau ditagihkan setiap hari{" "}
            {DAYS_OF_WEEK.find((d) => d.id === (item.selectedDay || "jumat"))?.label || "Jumat"}.
          </p>
        </div>
      )}

      {/* Bulanan (Popover Date Picker) */}
      {currentFrequency === "MONTHLY" && (
        <div className="space-y-2 pt-1 animate-in fade-in slide-in-from-top-1 duration-150">
          <label className="text-sm font-semibold text-slate-800 block">
            Pilih tanggal donasi rutin
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                data-empty={!item.monthlyDate}
                className={cn(
                  "group w-full sm:w-[280px] justify-between text-left font-normal h-11 border-slate-300 bg-white hover:bg-slate-50 text-slate-900 px-3.5 cursor-pointer [&[data-state=open]>svg]:rotate-180",
                  !item.monthlyDate && "text-slate-500"
                )}
              >
                <span className="flex items-center gap-2 truncate">
                  <CalendarIcon className="h-4 w-4 text-slate-500 shrink-0" />
                  {item.monthlyDate ? (
                    <span className="font-medium text-slate-900 truncate">
                      Setiap tgl {format(new Date(item.monthlyDate), "d MMMM", { locale: idLocale })}
                    </span>
                  ) : (
                    <span>Pilih tanggal</span>
                  )}
                </span>
                <ChevronDown className="h-4 w-4 text-slate-500 shrink-0 opacity-70 ml-2 transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-180" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 bg-white border border-slate-200 shadow-md rounded-xl z-50"
              align="start"
            >
              <Calendar
                mode="single"
                selected={item.monthlyDate ? new Date(item.monthlyDate) : undefined}
                onSelect={(d) => {
                  if (d) {
                    onChange(item.id, "monthlyDate", d.toISOString());
                  }
                }}
                defaultMonth={item.monthlyDate ? new Date(item.monthlyDate) : new Date()}
              />
            </PopoverContent>
          </Popover>
          <p className="text-xs sm:text-sm text-slate-600 italic font-normal">
            *Donasi rutin akan berulang setiap tanggal{" "}
            {item.monthlyDate ? format(new Date(item.monthlyDate), "d MMMM", { locale: idLocale }) : "1"} setiap bulannya.
          </p>
        </div>
      )}
    </div>
  );
}
