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
        <div className="relative ml-4 pl-3.5 border-l-2 border-slate-200 space-y-1 py-1 mt-1">
          {items.map((item) => {
            const isItemActive = isNavItemActive(item.href, pathname);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "relative flex items-center justify-between py-2 px-2.5 text-sm font-medium rounded-lg transition-colors",
                  "before:content-[''] before:absolute before:-left-3.5 before:top-1/2 before:-translate-y-1/2 before:w-3.5 before:h-[1.5px]",
                  isItemActive
                    ? "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white shadow-xs before:bg-blue-600 cursor-default select-none pointer-events-none"
                    : "text-slate-700 hover:text-slate-950 hover:bg-slate-100 before:bg-slate-300"
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
