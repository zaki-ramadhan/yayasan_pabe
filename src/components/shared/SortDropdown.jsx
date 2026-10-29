"use client";

import { ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/DropdownMenu";
import { cn } from "@/lib/utils";

export function SortDropdown({
  options = [],
  value,
  onChange,
  label = "Urutkan",
  className,
  align = "end",
}) {
  const currentOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "group h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-sm font-normal text-slate-900 hover:bg-slate-50 hover:border-slate-400 transition-colors flex items-center gap-2 justify-between cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs [&[data-state=open]>svg]:rotate-180",
            className
          )}
        >
          <span className="truncate">
            {currentOption ? currentOption.label : label}
          </span>
          <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className="min-w-[var(--radix-dropdown-menu-trigger-width)] w-auto max-w-xs p-1"
      >
        {options.map((opt) => {
          const isSelected = opt.value === value;
          return (
            <DropdownMenuItem
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={cn(
                "cursor-pointer text-sm font-normal flex items-center justify-between py-2 px-3 rounded-md transition-colors gap-3",
                isSelected
                  ? "bg-slate-100 text-primary"
                  : "text-slate-800 hover:bg-slate-100"
              )}
            >
              <span className="whitespace-nowrap">{opt.label}</span>
              {isSelected && <Check className="w-4 h-4 text-primary shrink-0 ml-1.5" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
