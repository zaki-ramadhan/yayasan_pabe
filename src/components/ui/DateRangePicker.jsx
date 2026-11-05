"use client";

import * as React from "react";
import { format, isValid, parseISO, parse } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Calendar as CalendarIcon, X, ChevronDown } from "lucide-react";
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
 * Parsing aman nilai tanggal dari Date object, ISO string, atau format YYYY-MM-DD
 * @param {Date | string | null | undefined} val
 * @returns {Date | undefined}
 */
function parseDateSafe(val) {
  if (!val) return undefined;
  if (val instanceof Date) {
    return isValid(val) ? val : undefined;
  }
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (!trimmed) return undefined;
    const parsed = trimmed.includes("T") ? parseISO(trimmed) : parseISO(`${trimmed}T00:00:00`);
    if (isValid(parsed)) return parsed;

    try {
      const parsedId = parse(trimmed, "d MMMM yyyy", new Date(), { locale: idLocale });
      if (isValid(parsedId)) return parsedId;
    } catch {}

    try {
      const parsedShort = parse(trimmed, "d MMM yyyy", new Date(), { locale: idLocale });
      if (isValid(parsedShort)) return parsedShort;
    } catch {}

    const native = new Date(trimmed);
    return isValid(native) ? native : undefined;
  }
  return undefined;
}

/**
 * Komponen DateRangePicker berbasis Shadcn UI (Radix Popover + React Day Picker).
 * Menerima dan mengembalikan objek { from: "YYYY-MM-DD", to: "YYYY-MM-DD" }.
 *
 * @param {{
 *   value?: { from?: string | Date | null, to?: string | Date | null } | null,
 *   onChange?: (range: { from: string, to: string }) => void,
 *   onRangeChange?: (range: { from?: Date, to?: Date }) => void,
 *   placeholder?: string,
 *   disabled?: boolean,
 *   clearable?: boolean,
 *   minDate?: Date,
 *   maxDate?: Date,
 *   numberOfMonths?: number,
 *   className?: string,
 *   id?: string,
 *   error?: any,
 *   isInvalid?: boolean,
 * }} props
 */
export function DateRangePicker({
  value,
  onChange,
  onRangeChange,
  placeholder = "Pilih rentang tanggal...",
  disabled = false,
  clearable = true,
  minDate,
  maxDate,
  numberOfMonths = 1,
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

  const parsedFrom = React.useMemo(() => parseDateSafe(value?.from), [value?.from]);
  const parsedTo = React.useMemo(() => parseDateSafe(value?.to), [value?.to]);

  const selectedRange = React.useMemo(() => {
    if (!parsedFrom && !parsedTo) return undefined;
    return {
      from: parsedFrom,
      to: parsedTo,
    };
  }, [parsedFrom, parsedTo]);

  const [currentMonth, setCurrentMonth] = React.useState(
    () => parsedFrom || parsedTo || new Date()
  );

  const handleOpenChange = (isOpen) => {
    setOpen(isOpen);
    if (isOpen) {
      setCurrentMonth(parsedFrom || parsedTo || new Date());
    }
  };

  const handleSelect = (range) => {
    const fromStr = range?.from && isValid(range.from) ? format(range.from, "yyyy-MM-dd") : "";
    const toStr = range?.to && isValid(range.to) ? format(range.to, "yyyy-MM-dd") : "";

    onChange?.({ from: fromStr, to: toStr });
    onRangeChange?.({ from: range?.from, to: range?.to });
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.({ from: "", to: "" });
    onRangeChange?.({ from: undefined, to: undefined });
  };

  const hasValue = Boolean(parsedFrom || parsedTo);

  const renderLabel = () => {
    if (parsedFrom && parsedTo) {
      if (format(parsedFrom, "yyyy-MM-dd") === format(parsedTo, "yyyy-MM-dd")) {
        return format(parsedFrom, "d MMMM yyyy", { locale: idLocale });
      }
      return `${format(parsedFrom, "d MMM yyyy", { locale: idLocale })} - ${format(
        parsedTo,
        "d MMM yyyy",
        { locale: idLocale }
      )}`;
    }
    if (parsedFrom && !parsedTo) {
      return `${format(parsedFrom, "d MMM yyyy", { locale: idLocale })} - Pilih tgl akhir`;
    }
    return placeholder;
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={resolvedId}
          disabled={disabled}
          className={cn(
            "flex h-11 w-full items-center justify-between rounded-lg border bg-white px-3 text-sm text-slate-900 shadow-xs transition-colors hover:bg-slate-50 focus:outline-none disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50 text-left cursor-pointer",
            hasError
              ? "border-rose-500 bg-rose-50/15 text-rose-950 placeholder:text-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              : "border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary",
            !hasValue && (hasError ? "text-rose-400 font-normal" : "text-slate-400 font-normal"),
            className
          )}
        >
          <span className="flex items-center gap-2.5 truncate">
            <CalendarIcon
              className={cn("h-4 w-4 shrink-0", hasError ? "text-rose-400" : "text-slate-400")}
            />
            <span className={cn("truncate font-normal", hasValue ? "text-slate-900" : "")}>
              {renderLabel()}
            </span>
          </span>

          <span className="flex items-center gap-1 shrink-0 ml-1.5">
            {clearable && hasValue && !disabled ? (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleClear(e);
                  }
                }}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Hapus rentang tanggal"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            ) : null}
            <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 opacity-70" />
          </span>
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
          mode="range"
          selected={selectedRange}
          onSelect={handleSelect}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          numberOfMonths={numberOfMonths}
          disabled={(date) => {
            if (minDate && date < minDate) return true;
            if (maxDate && date > maxDate) return true;
            return false;
          }}
          initialFocus
        />

        <div className="p-2.5 border-t border-slate-100 flex items-center justify-between gap-2 bg-slate-50/70 rounded-b-xl text-xs">
          <span className="text-slate-600 truncate pl-1">
            {parsedFrom && parsedTo ? (
              <span className="font-medium text-slate-800">
                {format(parsedFrom, "d MMM yyyy", { locale: idLocale })} -{" "}
                {format(parsedTo, "d MMM yyyy", { locale: idLocale })}
              </span>
            ) : parsedFrom ? (
              <span>Pilih tanggal akhir</span>
            ) : (
              <span>Pilih rentang tanggal</span>
            )}
          </span>

          <div className="flex items-center gap-1.5 shrink-0">
            {hasValue && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleSelect(undefined)}
                className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2"
              >
                Reset
              </Button>
            )}
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => setOpen(false)}
              className="h-7 text-xs px-2.5"
            >
              Selesai
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
