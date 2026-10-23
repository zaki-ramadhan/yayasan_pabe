"use client";

import { Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/**
 * Dropdown selector for routine donation campaign/program
 * @param {object} props
 * @param {object} props.item
 * @param {Array} props.campaignList
 * @param {object} props.selectedCampaign
 * @param {Function} props.onChange
 * @param {boolean} [props.isFirstIndex]
 */
export function RoutineProgramPicker({
  item,
  campaignList,
  selectedCampaign,
  onChange,
  isFirstIndex = false,
}) {
  return (
    <div id={isFirstIndex ? "tour-program-picker" : undefined} className="space-y-1.5">
      <label className="text-sm font-semibold text-slate-800 block">
        Pilih program donasi
      </label>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="group flex h-11 w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm sm:text-base font-normal text-slate-900 hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors cursor-pointer text-left [&[data-state=open]>svg]:rotate-180"
          >
            <span className="truncate">
              {selectedCampaign
                ? `${selectedCampaign.title} (${selectedCampaign.categoryName || "Program Umum"})`
                : "-- Silakan Pilih Program --"}
            </span>
            <ChevronDown className="h-4 w-4 text-slate-500 shrink-0 ml-2 transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-180" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-72 overflow-y-auto bg-white border border-slate-200 shadow-md rounded-lg p-1.5 z-50"
        >
          {campaignList.map((camp) => {
            const isSelected = item.campaignId === camp.id;
            return (
              <DropdownMenuItem
                key={camp.id}
                onClick={() => onChange(item.id, "campaignId", camp.id)}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 text-sm font-normal rounded-md cursor-pointer transition-colors",
                  isSelected
                    ? "bg-blue-50 text-primary"
                    : "text-slate-800 hover:bg-slate-100"
                )}
              >
                <span className="truncate">
                  {camp.title} ({camp.categoryName || "Program Umum"})
                </span>
                {isSelected && (
                  <Check className="h-4 w-4 text-primary shrink-0 ml-2" />
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
