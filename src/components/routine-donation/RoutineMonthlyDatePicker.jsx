"use client";

import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Calendar } from "@/components/ui/Calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { cn } from "@/lib/utils";

/**
 * Sub-komponen pemilihan tanggal bulanan untuk donasi rutin
 * @param {object} props
 * @param {object} props.item
 * @param {Function} props.onChange
 */
export function RoutineMonthlyDatePicker({ item, onChange }) {
  const formattedDate = item.monthlyDate
    ? format(new Date(item.monthlyDate), "d MMMM", { locale: idLocale })
    : null;

  return (
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
              "group w-full sm:w-[280px] justify-between text-left font-normal text-sm h-11 border-slate-300 bg-white hover:bg-slate-50 text-slate-900 px-3.5 cursor-pointer [&[data-state=open]>svg]:rotate-180",
              !item.monthlyDate && "text-slate-500"
            )}
          >
            <span className="flex items-center gap-2 truncate">
              <CalendarIcon className="h-4 w-4 text-slate-500 shrink-0" />
              {formattedDate ? (
                <span className="font-normal text-sm text-slate-900 truncate">
                  Setiap tgl {formattedDate}
                </span>
              ) : (
                <span className="text-sm font-normal">Pilih tanggal</span>
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
      <p className="text-xs text-slate-600 italic font-normal">
        *Donasi rutin akan berulang setiap tanggal {formattedDate || "1"} setiap bulannya.
      </p>
    </div>
  );
}
