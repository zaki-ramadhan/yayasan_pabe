import { cn } from "@/lib/utils";

/**
 * WhatsApp-style sticky date separator badge with dark gradient background and crisp white text
 * @param {string} label - Date label (e.g. "Hari Ini", "Kemarin", "14 September 2026")
 * @param {string} [className] - Optional container class
 */
export function DateStickyBadge({ label, className = "" }) {
  return (
    <div className={cn("sticky top-0 z-10 flex justify-center py-1 pointer-events-none", className)}>
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium tracking-tight bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white border border-slate-800 shadow-xs pointer-events-auto select-none">
        {label}
      </span>
    </div>
  );
}
