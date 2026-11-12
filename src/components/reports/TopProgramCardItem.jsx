"use client";

import Link from "next/link";
import { SafeImage } from "@/components/ui/SafeImage";
import { formatRupiah } from "@/lib/formatters";
import { getCampaignDetailHref } from "@/lib/zisFilter";
import { cn } from "@/lib/utils";

/**
 * Single Top Program List Item (Flat list layout).
 *
 * Adheres strictly to:
 * - Minimum font size: text-sm (no text-xs)
 * - Maximum font weight: font-semibold for numbers, font-medium for title, font-normal for labels
 * - Clickable title with hover:text-primary and hover:underline
 * - Single nominal value above progress bar according to active mode
 * - Proportional rounded-md (no rounded-full)
 * - No dot separators or badge clutter
 * - Flat list layout: zero outer border, zero outer padding on item container
 *
 * @param {object} props
 * @param {number} props.rank - 1-based ranking index
 * @param {object} props.program - Program data
 * @param {number} props.maxAmount - Highest amount for proportional bar calculation
 */
export function TopProgramCardItem({ rank, program, maxAmount = 1 }) {
  const percentage = Math.min(
    100,
    Math.max(8, Math.round((program.displayAmount / maxAmount) * 100))
  );

  const campaignHref = getCampaignDetailHref({
    slug: program.slug || program.id,
    categoryName: program.categoryName || program.category,
    categorySlug: program.categorySlug,
  });

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
      {/* Left section: Rank, Thumbnail Photo, Clickable Title & Category */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Rank Number */}
        <span className="w-6 text-center text-sm font-semibold text-slate-700 shrink-0">
          #{rank}
        </span>

        {/* Photo Thumbnail (Clickable) */}
        <Link
          href={campaignHref}
          className="relative w-12 h-12 rounded-md overflow-hidden shrink-0 border border-slate-200 bg-white hover:opacity-90 transition-opacity"
        >
          <SafeImage
            src={program.bannerUrl}
            alt={program.title}
            sizes="48px"
          />
        </Link>

        {/* Program Title (Clickable) & Category */}
        <div className="min-w-0 flex-1 space-y-0.5">
          <Link
            href={campaignHref}
            className="text-sm font-medium text-slate-950 hover:text-primary hover:underline transition-colors truncate block leading-snug"
          >
            {program.title}
          </Link>
          <p className="text-sm font-normal text-slate-500 truncate">
            {program.category}
          </p>
        </div>
      </div>

      {/* Right Section: Single Nominal & Proportional Progress Bar */}
      <div className="flex flex-col sm:items-end justify-between sm:w-60 md:w-64 shrink-0 space-y-1.5">
        <div className="flex items-baseline justify-between sm:justify-end gap-3 w-full">
          <span className="text-sm font-normal text-slate-500">
            {program.mode === "PENYALURAN" ? "Tersalurkan" : "Diterima"}
          </span>
          <span className="text-sm font-semibold text-slate-950">
            {formatRupiah(program.displayAmount)}
          </span>
        </div>

        {/* Horizontal Progress Bar */}
        <div className="w-full h-1.5 rounded-md bg-slate-100 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-md transition-all duration-500",
              program.mode === "PENYALURAN" ? "bg-emerald-600" : "bg-primary"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
