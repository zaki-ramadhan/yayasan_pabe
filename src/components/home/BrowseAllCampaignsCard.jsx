import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Minimalist Card with subtle neutral gradient and a centered outline button to view all programs.
 * Matches the exact size, font-weight, and color scheme of the "Lihat Detail" outline button.
 *
 * @param {object} props
 * @param {number} [props.totalCount=0]
 * @param {string} [props.className]
 */
export function BrowseAllCampaignsCard({ totalCount = 0, className }) {
  return (
    <Link
      href="/program"
      className={cn(
        "flex items-center justify-center h-full w-full rounded-xl border border-slate-300",
        "bg-gradient-to-br from-white via-slate-50 to-slate-100/70 p-6 sm:p-8 cursor-pointer",
        className
      )}
      aria-label="Lihat seluruh program"
    >
      <Button
        type="button"
        variant="outline"
        className="h-8.5 sm:h-9 px-5 rounded-lg text-xs sm:text-sm font-normal border-slate-300 text-slate-700 bg-white hover:bg-white hover:text-slate-700 hover:border-slate-300 shadow-none transition-none flex items-center gap-2 pointer-events-none"
      >
        <span>Lihat Seluruh Program</span>
        {totalCount > 0 && <span className="text-slate-500 font-normal">({totalCount})</span>}
        <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
      </Button>
    </Link>
  );
}
