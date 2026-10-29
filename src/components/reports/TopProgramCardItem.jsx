"use client";

import Link from "next/link";
import Image from "next/image";
import { formatRupiah } from "@/lib/formatters";
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

  const campaignHref = `/campaign/${program.slug || program.id}`;

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
          className="relative w-12 h-12 rounded-md overflow-hidden shrink-0 border border-slate-200 bg-slate-100 hover:opacity-90 transition-opacity"
        >
          {program.bannerUrl ? (
            <Image
              src={program.bannerUrl}
              alt={program.title}
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 text-sm font-medium">
              Foto
            </div>
          )}
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
