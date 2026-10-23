"use client";

import { ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const DEFAULT_SALUTATIONS = ["Bapak", "Ibu"];

export function SalutationDropdown({
  value = "Bapak",
  onChange,
  options = DEFAULT_SALUTATIONS,
  className,
}) {
  return (
    <div className={cn("w-28 shrink-0", className)}>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="group flex h-11 w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm sm:text-base font-normal text-slate-900 hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors cursor-pointer shadow-2xs [&[data-state=open]>svg]:rotate-180"
          >
            <span>{value || options[0]}</span>
            <ChevronDown className="h-4 w-4 text-slate-500 shrink-0 ml-1 transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-180" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-32 bg-white border border-slate-200 shadow-md rounded-lg p-1 z-50"
        >
          {options.map((sal) => (
            <DropdownMenuItem
              key={sal}
              onClick={() => onChange(sal)}
              className={cn(
                "flex items-center justify-between px-3 py-2 text-sm font-normal rounded-md cursor-pointer transition-colors",
                value === sal
                  ? "bg-slate-100 text-primary"
                  : "text-slate-800 hover:bg-slate-100"
              )}
            >
              <span>{sal}</span>
              {value === sal && (
                <Check className="w-4 h-4 text-primary shrink-0 ml-1.5" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
