"use client";

import * as React from "react";
import { format, isValid, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Calendar } from "@/components/ui/Calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { useFormField } from "@/components/ui/FormField";

/**
 * Komponen DatePicker berbasis Shadcn UI (Radix Popover + React Day Picker).
 * Menerima dan mengembalikan format string "YYYY-MM-DD" agar kompatibel drop-in dengan input HTML date.
 *
 * @param {{
 *   value?: string | Date | null,
 *   onChange?: (dateStr: string) => void,
 *   placeholder?: string,
 *   disabled?: boolean,
 *   clearable?: boolean,
 *   minDate?: Date,
 *   maxDate?: Date,
 *   className?: string,
 *   id?: string,
 *   error?: any,
 *   isInvalid?: boolean,
 * }} props
 */
export function DatePicker({
  value,
  onChange,
  placeholder = "Pilih tanggal...",
  disabled = false,
  clearable = true,
  minDate,
  maxDate,
  className,
  id,
  error,
  isInvalid,
}) {
  const [open, setOpen] = React.useState(false);
  const formContext = useFormField();
  const hasError =
    isInvalid !== undefined
      ? Boolean(isInvalid)
      : error !== undefined
      ? Boolean(error)
      : formContext?.isInvalid || false;
  const resolvedId = id || formContext?.id;

  // Parsing value secara aman ke Date object
  const selectedDate = React.useMemo(() => {
    if (!value) return undefined;
    if (value instanceof Date) {
      return isValid(value) ? value : undefined;
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return undefined;
      // Tangani format YYYY-MM-DD atau ISO
      const parsed = trimmed.includes("T") ? parseISO(trimmed) : parseISO(`${trimmed}T00:00:00`);
      return isValid(parsed) ? parsed : undefined;
    }
    return undefined;
  }, [value]);

  const [currentMonth, setCurrentMonth] = React.useState(() => selectedDate || new Date());
  const [prevSelectedDate, setPrevSelectedDate] = React.useState(selectedDate);

  if (selectedDate !== prevSelectedDate) {
    setPrevSelectedDate(selectedDate);
    if (selectedDate) {
      setCurrentMonth(selectedDate);
    }
  }

  const handleOpenChange = (isOpen) => {
    setOpen(isOpen);
    if (isOpen) {
      setCurrentMonth(selectedDate || new Date());
    }
  };

  const handleSelect = (date) => {
    if (!date) {
      onChange?.("");
      setOpen(false);
      return;
    }
    // Format ke string standar YYYY-MM-DD
    const formattedStr = format(date, "yyyy-MM-dd");
    onChange?.(formattedStr);
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.("");
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={resolvedId}
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-lg border bg-white px-3 text-sm text-slate-900 shadow-xs transition-colors hover:bg-slate-50 focus:outline-none disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50 text-left",
            hasError
              ? "border-rose-500 bg-rose-50/15 text-rose-950 placeholder:text-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              : "border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary",
            !selectedDate && (hasError ? "text-rose-400 font-normal" : "text-slate-400 font-normal"),
            className
          )}
        >
          <span className="flex items-center gap-2.5 truncate">
            <CalendarIcon className={cn("h-4 w-4 shrink-0", hasError ? "text-rose-400" : "text-slate-400")} />
            <span className="truncate">
              {selectedDate ? (
                format(selectedDate, "d MMMM yyyy", { locale: idLocale })
              ) : (
                placeholder
              )}
            </span>
          </span>

          {clearable && selectedDate && !disabled ? (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleClear(e);
                }
              }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 ml-1.5 cursor-pointer"
              title="Hapus tanggal"
              aria-label="Hapus tanggal"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          ) : null}
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-auto p-0 bg-white border border-slate-200 shadow-xl rounded-xl z-50 overflow-hidden"
        align="start"
        side="bottom"
        sideOffset={6}
        collisionPadding={16}
        sticky="always"
      >
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          disabled={(date) => {
            if (minDate && date < minDate) return true;
            if (maxDate && date > maxDate) return true;
            return false;
          }}
          initialFocus
        />
        {selectedDate && (
          <div className="p-2 border-t border-slate-100 flex items-center justify-between gap-2 bg-slate-50/50 rounded-b-xl">
            <span className="text-xs text-slate-500 pl-1">
              {format(selectedDate, "EEEE, d MMMM yyyy", { locale: idLocale })}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleSelect(undefined)}
              className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2"
            >
              Kosongkan
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
