"use client";

import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { ArrowRight } from "lucide-react";
import { formatRupiah } from "@/lib/formatters";
import { SafeImage } from "@/components/ui/safe-image";

/**
 * Compact Admin Campaign Overview Card displaying priority active programs
 * formatted as clean flat items without outer card borders or padding:
 * - Left: compact thumbnail image preview (w-14 h-14 / w-16 h-16)
 * - Right: 2-line title (line-clamp-2), progress bar, and metrics (target & percent aligned)
 * - No location info
 */
export function AdminCampaignOverviewCard({ campaigns = [] }) {
  const displayCampaigns = campaigns ? campaigns.slice(0, 4) : [];

  return (
    <div className="rounded-lg border border-slate-200/90 bg-white shadow-2xs overflow-hidden h-full flex flex-col">
      {/* Card Header */}
      <div className="p-3.5 sm:p-4 border-b border-slate-200/90">
        <h2 className="text-base font-semibold text-slate-900 leading-tight">
          Capaian Program Prioritas
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Progres perolehan dana kampanye aktif
        </p>
      </div>

      {/* Flat List Items */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-3">
          {displayCampaigns.length > 0 ? (
            displayCampaigns.map((campaign) => {
              const target = Number(campaign.targetAmount || 0);
              const collected = Number(campaign.collectedAmount || 0);
              const percent = target > 0 ? Math.min(100, Math.round((collected / target) * 100)) : null;

              return (
                <Link
                  key={campaign.id}
                  href="/admin/program"
                  className="group block transition-colors"
                >
                  <div className="flex flex-row items-start gap-2.5">
                    {/* Left: Compact Image Preview Thumbnail */}
                    <div className="relative w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-md overflow-hidden bg-slate-100 border border-slate-200 aspect-square">
                      <SafeImage
                        src={campaign.bannerUrl}
                        alt={campaign.title}
                        fallbackText={campaign.category || "Program Donasi"}
                        className="object-cover"
                      />
                    </div>

                    {/* Right: Title, Progress Bar with Inline %, and Stacked Metrics */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <h3 className="text-xs sm:text-sm font-medium text-slate-800 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                        {campaign.title}
                      </h3>

                      {/* Progress Bar & Inline Plain-text Percentage (Only when target exists) */}
                      {target > 0 && (
                        <div className="flex items-center gap-2 pt-0.5">
                          <Progress value={percent} className="h-1.5 flex-1" />
                          <span className="text-xs font-medium text-slate-600 tabular-nums shrink-0">
                            {percent}%
                          </span>
                        </div>
                      )}

                      {/* Stacked Metrics: Each on its own line below progress bar */}
                      <div className="space-y-0.5 text-xs">
                        <div className="text-slate-600 truncate">
                          Terkumpul: <strong className="font-semibold text-slate-900">{formatRupiah(collected)}</strong>
                        </div>
                        {target > 0 && (
                          <div className="text-slate-500 truncate">
                            Target: <span className="font-medium text-slate-700">{formatRupiah(target)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <p className="text-sm text-slate-500 text-center py-6">
              Belum ada program aktif yang berjalan.
            </p>
          )}
        </div>

        {/* Check All Donation Programs Button */}
        <Link
          href="/admin/program"
          className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-slate-950 border border-slate-200 transition-colors mt-auto text-center cursor-pointer shadow-2xs"
        >
          <span>Periksa semua program donasi</span>
          <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
        </Link>
      </div>
    </div>
  );
}
