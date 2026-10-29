"use client";

import { ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/DropdownMenu";
import { cn } from "@/lib/utils";

/**
 * Filter select dropdown utilizing non-modal DropdownMenu
 * Avoids blocking or removing body scroll when opened.
 * @param {object} props
 * @param {string} props.label
 * @param {string} props.value
 * @param {string[]} props.options
 * @param {Function} props.onChange
 */
export function CareerFilterSelect({
  label,
  value,
  options = [],
  onChange,
}) {
  return (
    <div className="flex-1 min-w-[180px]">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={label}
            className="group w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm font-normal text-slate-800 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs [&[data-state=open]>svg]:rotate-180"
          >
            <span className="truncate">{value || label}</span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2 transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-180" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="min-w-[var(--radix-dropdown-menu-trigger-width)] w-auto max-w-xs p-1 max-h-72 overflow-y-auto"
        >
          {options.map((option) => {
            const isSelected = option === value;
            return (
              <DropdownMenuItem
                key={option}
                onClick={() => onChange(option)}
                className={cn(
                  "cursor-pointer text-sm font-normal flex items-center justify-between py-2 px-2.5 rounded-md transition-colors",
                  isSelected
                    ? "bg-slate-100 text-primary font-medium"
                    : "text-slate-800 hover:bg-slate-100"
                )}
              >
                <span className="truncate">{option}</span>
                {isSelected && (
                  <Check className="w-4 h-4 text-primary shrink-0 ml-2" />
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
