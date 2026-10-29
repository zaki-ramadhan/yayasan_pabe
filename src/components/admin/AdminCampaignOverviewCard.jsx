"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { SafeImage } from "@/components/ui/SafeImage";
import { formatRupiah } from "@/lib/formatters";
import { cn } from "@/lib/utils";

/**
 * Compact Admin Campaign Overview Card displaying priority active programs
 * formatted as clean flat items using standard Card and Button components:
 * - Left: compact thumbnail image preview (w-11 h-11 / w-12 h-12)
 * - Right: 2-line title (line-clamp-2), progress bar, and metrics (target & percent aligned)
 */
export function AdminCampaignOverviewCard({
  campaigns = [],
  maxItems = 4,
  stretch = true,
}) {
  const displayCampaigns = campaigns ? campaigns.slice(0, maxItems) : [];

  return (
    <Card className={cn("shadow-2xs overflow-hidden flex flex-col", stretch ? "h-full" : "h-auto")}>
      {/* Card Header */}
      <CardHeader className="p-3.5 sm:p-4 border-b border-slate-200/90">
        <CardTitle className="text-base font-medium text-slate-900 leading-tight">
          Capaian Program Prioritas
        </CardTitle>
      </CardHeader>

      {/* Flat List Items */}
      <CardContent className={cn("p-3.5 sm:p-4 flex-1 flex flex-col gap-3", stretch ? "justify-between" : "")}>
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
                        sizes="48px"
                        fallbackText={campaign.category || "Program Donasi"}
                        className="object-cover"
                      />
                    </div>

                    {/* Right: Info, Progress & Metrics */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-slate-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {campaign.title}
                      </p>

                      {/* Progress Bar & Metrics */}
                      <div className="mt-1 space-y-1">
                        <Progress
                          value={percent ?? 100}
                          className="h-1.5 bg-slate-100"
                        />
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{formatRupiah(collected)}</span>
                          <span className="font-medium text-slate-700">
                            {percent !== null ? `${percent}%` : "Tanpa Target"}
                          </span>
                        </div>
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
        <Button
          variant="secondary"
          asChild
          className={cn("w-full gap-2", stretch ? "mt-auto" : "mt-2")}
        >
          <Link href="/admin/program">
            <span>Periksa semua program</span>
            <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
