import Link from "next/link";
import { ClockCircleIcon } from "@solar-icons/react/line-duotone/clock-circle";
import { MapPointIcon } from "@solar-icons/react/line-duotone/map-point";
import { UsersGroupTwoRoundedIcon } from "@solar-icons/react/line-duotone/users-group-two-rounded";
import { formatRupiah, calculateProgress, calculateDaysLeft, isCampaignClosed } from "@/lib/formatters";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { SafeImage } from "@/components/ui/SafeImage";
import { RibbonBadge } from "@/components/ui/RibbonBadge";
import { HighlightText } from "@/components/shared/HighlightText";
import { getCampaignDetailHref } from "@/lib/zisFilter";
import { cn } from "@/lib/utils";

export function CampaignCard({
  campaign,
  highlightQuery = "",
  showDescription = true,
  priority = false,
  className,
}) {
  const hasTarget = Boolean(campaign.targetAmount && Number(campaign.targetAmount) > 0);
  const progress = hasTarget ? calculateProgress(campaign.collectedAmount, campaign.targetAmount) : 0;
  const daysLeft = calculateDaysLeft(campaign.endDate);
  const totalDonors = campaign.donorCount || 0;
  const isClosed = isCampaignClosed(campaign);
  const isZakat =
    campaign?.slug === "zakat" ||
    campaign?.categoryId === "zakat" ||
    campaign?.categorySlug === "zakat" ||
    campaign?.category?.slug === "zakat" ||
    campaign?.categoryName?.toLowerCase().includes("zakat") ||
    campaign?.categoryName?.toLowerCase().includes("ziswaf");

  return (
    <div className={cn("flex flex-col h-full w-full rounded-xl border border-slate-300 bg-white overflow-hidden", className)}>
      <div className="relative aspect-video w-full bg-slate-100 overflow-hidden border-b border-slate-200">
        <SafeImage
          src={campaign.bannerUrl}
          alt={campaign.title}
          fallbackText={campaign.categoryName || "Program Donasi"}
          priority={priority}
        />
        {campaign.categoryName && (
          <div className="absolute top-2.5 left-0 z-10 drop-shadow-xs">
            <RibbonBadge variant="dark" size="card">
              {campaign.categoryName}
            </RibbonBadge>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 px-4 sm:px-5 pt-4 sm:pt-5 pb-3 justify-between gap-3">
        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-semibold text-slate-950 leading-snug line-clamp-2 min-h-[2.75rem] sm:min-h-[3.1rem] flex items-start">
            <HighlightText text={campaign.title} highlight={highlightQuery} />
          </h3>

          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 min-w-0 truncate">
            <MapPointIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{campaign.location || "Wilayah Binaan PABE"}</span>
          </div>
        </div>

        <div className="space-y-1.5 pt-1">
          {hasTarget ? (
            <>
              <Progress value={progress} className="h-2" />

              <div className="flex justify-between items-baseline text-sm">
                <div>
                  <span className="text-xs sm:text-sm text-slate-600 font-medium block">Terkumpul</span>
                  <span className="font-semibold text-slate-950 text-sm sm:text-base">
                    {formatRupiah(campaign.collectedAmount)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs sm:text-sm text-slate-600 font-medium block">Target ({progress}%)</span>
                  <span className="text-slate-900 font-semibold text-sm sm:text-base">
                    {formatRupiah(campaign.targetAmount)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-1.5">
              <Progress
                value={Number(campaign.collectedAmount || 0) > 0 ? 100 : 0}
                className="h-2"
              />
              <div className="flex justify-between items-baseline text-sm">
                <div>
                  <span className="text-xs sm:text-sm text-slate-600 font-medium block">Total Terkumpul</span>
                  <span className="font-semibold text-slate-950 text-sm sm:text-base">
                    {formatRupiah(campaign.collectedAmount)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs sm:text-sm text-slate-600 font-medium block">Penyaluran</span>
                  <span className="text-slate-800 font-medium text-sm sm:text-base">
                    Berkelanjutan
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-3.5 sm:px-4 pb-3 sm:pb-3.5 pt-2.5 border-t border-slate-200/80 space-y-2.5">
        <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 min-w-0">
            <UsersGroupTwoRoundedIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 shrink-0" />
            <span className="text-slate-600 font-normal truncate">
              <strong className="text-slate-900 font-medium">{totalDonors}</strong> {isZakat ? "muzakki" : "donatur"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
            <ClockCircleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 shrink-0" />
            {isClosed ? (
              <span className="text-slate-500 font-normal">Selesai</span>
            ) : campaign.endDate && daysLeft !== null ? (
              <span className="text-slate-600 font-normal">
                <strong className="text-slate-900 font-medium">{daysLeft}</strong> hari lagi
              </span>
            ) : (
              <span className="text-slate-500 font-normal">-</span>
            )}
          </div>
        </div>

        <Link href={getCampaignDetailHref(campaign)} className="block w-full">
          {isClosed ? (
            <Button
              variant="outline"
              className="w-full h-9 rounded-lg text-sm font-normal border-slate-300 text-slate-700 bg-white hover:bg-white hover:text-slate-700 hover:border-slate-300 shadow-none cursor-pointer transition-none"
            >
              Lihat Detail
            </Button>
          ) : (
            <Button
              className="w-full h-9 rounded-lg text-sm font-medium bg-primary hover:bg-primary text-white hover:text-white shadow-none cursor-pointer transition-none"
            >
              {isZakat ? "Tunaikan Zakat" : "Donasi Sekarang"}
            </Button>
          )}
        </Link>
      </div>
    </div>
  );
}

