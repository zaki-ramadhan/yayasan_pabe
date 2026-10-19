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
    <div
      className={cn(
        "flex items-center justify-center h-full w-full rounded-xl border border-slate-300",
        "bg-gradient-to-br from-white via-slate-50 to-slate-100/70 p-6 sm:p-8",
        className
      )}
      aria-label="Lihat seluruh program"
    >
      <Link href="/program" className="inline-block">
        <Button
          type="button"
          variant="outline"
          className="h-8.5 sm:h-9 px-5 rounded-lg text-xs sm:text-sm font-semibold border-slate-300 text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400 shadow-2xs transition-colors flex items-center gap-2 cursor-pointer"
        >
          <span>Lihat Seluruh Program</span>
          {totalCount > 0 && <span className="text-slate-500 font-normal">({totalCount})</span>}
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
        </Button>
      </Link>
    </div>
  );
}
