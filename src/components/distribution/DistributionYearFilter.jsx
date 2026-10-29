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
 * Molecule component: Dropdown filter for distribution year
 * Uses non-modal DropdownMenu to prevent scroll-locking.
 * @param {object} props
 * @param {string} props.selectedYear
 * @param {string[]} props.options
 * @param {Function} props.onYearChange
 */
export function DistributionYearFilter({
  selectedYear,
  options = [],
  onYearChange,
  className,
}) {
  return (
    <div className="shrink-0">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "group h-8 sm:h-9 px-3 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors flex items-center justify-between gap-2.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary [&[data-state=open]>svg]:rotate-180",
              className
            )}
          >
            <span>{selectedYear}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-180" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-48 bg-white border border-slate-200 shadow-md rounded-lg p-1 z-50"
        >
          {options.map((option) => {
            const isSelected = option === selectedYear;
            return (
              <DropdownMenuItem
                key={option}
                onClick={() => onYearChange(option)}
                className={cn(
                  "cursor-pointer text-sm font-medium flex items-center justify-between py-2 px-3 rounded-md transition-colors",
                  isSelected
                    ? "bg-slate-100 text-primary font-medium"
                    : "text-slate-800 hover:bg-slate-50"
                )}
              >
                <span>{option}</span>
                {isSelected && (
                  <Check className="w-4 h-4 text-primary shrink-0" />
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
