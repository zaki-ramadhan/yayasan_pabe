import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { formatRupiah, isCampaignClosed } from "@/lib/formatters";
import { getCampaignDonateHref, getCampaignDetailHref } from "@/lib/zisFilter";
import { ShareDropdown } from "@/components/shared/ShareDropdown";

export function CampaignStickyMobileBar({ campaign }) {
  const isClosed = isCampaignClosed(campaign);
  const isZakat =
    campaign?.slug === "zakat" ||
    campaign?.categoryId === "zakat" ||
    campaign?.categorySlug === "zakat" ||
    campaign?.category?.slug === "zakat" ||
    campaign?.categoryName?.toLowerCase().includes("zakat") ||
    campaign?.categoryName?.toLowerCase().includes("ziswaf");
  const donateHref = isZakat
    ? `/zakat/bayar${campaign?.slug ? `?campaign=${encodeURIComponent(campaign.slug)}` : ""}`
    : getCampaignDonateHref(campaign);
  const ctaLabel = isZakat ? "Tunaikan Zakat" : "Donasi Sekarang";

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-300 p-3 shadow-lg flex items-center justify-between gap-3">
      <div className="min-w-0">
        <span className="text-xs text-slate-600 block truncate">
          {isZakat ? "Zakat Terhimpun" : "Dana Terkumpul"}
        </span>
        <span className="font-semibold text-sm sm:text-base text-primary truncate block">
          {formatRupiah(campaign.collectedAmount)}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-1 max-w-xs justify-end">
        {isClosed ? (
          <Button disabled className="w-full font-normal h-10 bg-slate-200 text-slate-600 cursor-not-allowed shadow-none text-xs sm:text-sm">
            {isZakat ? "Penyaluran Ditutup" : "Program Selesai"}
          </Button>
        ) : (
          <Link href={donateHref} className="flex-1">
            <Button className="w-full font-normal h-10 bg-primary hover:bg-primary-hover text-white cursor-pointer text-xs sm:text-sm">
              {ctaLabel}
            </Button>
          </Link>
        )}
        <ShareDropdown
          url={getCampaignDetailHref(campaign)}
          title={campaign.title}
          description={campaign.excerpt}
          customCta={
            isZakat
              ? "Tunaikan kewajiban zakat Anda dengan tepat sasaran melalui lembaga resmi Yayasan Payung Berkah:"
              : "Mari bersama alirkan kepedulian untuk mendukung program kebaikan ini melalui Yayasan Payung Berkah:"
          }
          variant="icon"
          align="end"
          className="h-10 w-10 rounded-lg border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-50 shrink-0"
        />
      </div>
    </div>
  );
}

