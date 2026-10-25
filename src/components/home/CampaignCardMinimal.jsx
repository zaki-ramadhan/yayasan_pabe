import Link from "next/link";
import { MapPin } from "lucide-react";
import { formatRupiah, calculateProgress, isCampaignClosed } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SafeImage } from "@/components/ui/safe-image";
import { RibbonBadge } from "@/components/ui/ribbon-badge";
import { cn } from "@/lib/utils";

/**
 * Minimalist Campaign Card variant for Home Showcase
 * Features integrated title on bottom gradient overlay & simplified progress metrics.
 */
export function CampaignCardMinimal({
  campaign,
  priority = false,
  className,
}) {
  const hasTarget = Boolean(campaign.targetAmount && Number(campaign.targetAmount) > 0);
  const progress = hasTarget ? calculateProgress(campaign.collectedAmount, campaign.targetAmount) : 0;
  const isClosed = isCampaignClosed(campaign);

  return (
    <div
      className={cn(
        "flex flex-col h-full w-full rounded-xl border border-slate-300 bg-white overflow-hidden shadow-2xs",
        className
      )}
    >
      {/* 1. Cover Image dengan Judul & Lokasi Terintegrasi di Atas Gradasi Bawah */}
      <div className="relative aspect-[16/11] w-full bg-slate-900 overflow-hidden">
        <SafeImage
          src={campaign.bannerUrl}
          alt={campaign.title}
          fallbackText={campaign.categoryName || "Program Donasi"}
          priority={priority}
        />

        {/* Flag Kategori Asli (RibbonBadge) */}
        {campaign.categoryName && (
          <div className="absolute top-2.5 left-0 z-20 drop-shadow-xs">
            <RibbonBadge variant="dark" size="card" className="!font-normal tracking-normal">
              {campaign.categoryName}
            </RibbonBadge>
          </div>
        )}

        {/* Gradasi Overlay dari Bawah (Gelap pekat ke transparan) */}
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/95 via-slate-950/50 to-transparent flex flex-col justify-end p-4 sm:p-4.5 z-10 pointer-events-none space-y-1.5">
          <h3 className="text-base sm:text-lg font-semibold text-white leading-snug line-clamp-2 drop-shadow-xs">
            {campaign.title}
          </h3>

          {/* Keterangan Lokasi di Bawah Judul (Teks Putih Bersih dengan Ikon Pin Putih, Bobot Normal) */}
          {campaign.location && (
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-normal text-white drop-shadow-sm min-w-0">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
              <span className="truncate">{campaign.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Body Minimalis (Progress Bar, Nominal Terkumpul, CTA) */}
      <div className="flex flex-col flex-1 justify-between px-3 sm:px-3.5 pt-3.5 sm:pt-4 pb-2.5 sm:pb-3 space-y-3">
        <div className="space-y-2">
          {/* Progress Bar Tipis */}
          <Progress
            value={hasTarget ? progress : (Number(campaign.collectedAmount || 0) > 0 ? 100 : 0)}
            className="h-1.5"
          />

          {/* Deret Nominal Terkumpul & Persentase Ringkas */}
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-sm sm:text-base text-slate-700 font-medium shrink-0">
              {hasTarget ? "Terkumpul" : "Total Terkumpul"}
            </span>
            <div className="flex items-baseline gap-1.5 shrink-0">
              <span className="text-base sm:text-lg font-semibold text-slate-950">
                {formatRupiah(campaign.collectedAmount)}
              </span>
              {hasTarget ? (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                  {progress}%
                </span>
              ) : (
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  Rutin
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tombol Donasi Ramping */}
        <Link href={`/campaign/${campaign.slug}`} className="block w-full mt-auto">
          {isClosed ? (
            <Button
              variant="outline"
              className="w-full h-8.5 sm:h-9 rounded-lg text-xs sm:text-sm font-normal border-slate-300 text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400 cursor-pointer"
            >
              Lihat Detail
            </Button>
          ) : (
            <Button
              className="w-full h-8.5 sm:h-9 rounded-lg text-xs sm:text-sm font-medium bg-primary hover:bg-primary-hover text-white shadow-none cursor-pointer"
            >
              Donasi Sekarang
            </Button>
          )}
        </Link>
      </div>
    </div>
  );
}
