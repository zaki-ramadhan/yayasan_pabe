"use client";

import Link from "next/link";
import { ChevronDown, Check, ArrowUpRight } from "lucide-react";
import { isNavItemActive } from "@/data/navigation";
import { cn } from "@/lib/utils";

export function NavMobileAccordion({
  label,
  name,
  items = [],
  pathname,
  isParentActive = false,
  isOpen = false,
  onToggle,
  onClose,
}) {
  return (
    <div>
      <button
        type="button"
        onClick={() => onToggle(name)}
        className={cn(
          "flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium rounded-lg cursor-pointer transition-colors",
          isParentActive ? "bg-slate-100 text-primary" : "text-slate-800 hover:bg-slate-50"
        )}
      >
        <span>{label}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform",
            isParentActive ? "text-primary" : "text-slate-500",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="pl-3 pr-2 py-1 space-y-1 bg-slate-50 rounded-lg mt-1 border-l-2 border-primary">
          {items.map((item) => {
            const isItemActive = isNavItemActive(item.href, pathname);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center justify-between py-2 px-2.5 text-sm font-medium rounded-md transition-colors",
                  isItemActive
                    ? "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white shadow-xs hover:bg-gradient-to-r hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 hover:text-white cursor-default select-none pointer-events-none"
                    : "text-slate-700 hover:text-slate-950 hover:bg-slate-100"
                )}
              >
                <span>{item.label}</span>
                {isItemActive ? (
                  <Check className="w-3.5 h-3.5 text-white shrink-0" strokeWidth={2.5} />
                ) : (
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" strokeWidth={2.5} />
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
