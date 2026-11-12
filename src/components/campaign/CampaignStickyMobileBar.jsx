import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { formatRupiah, isCampaignClosed } from "@/lib/formatters";
import { getCampaignDonateHref } from "@/lib/zisFilter";

export function CampaignStickyMobileBar({ campaign }) {
  const isClosed = isCampaignClosed(campaign);
  const isZakat =
    campaign?.slug === "zakat" ||
    campaign?.categoryId === "zakat" ||
    campaign?.categorySlug === "zakat" ||
    campaign?.category?.slug === "zakat" ||
    campaign?.categoryName?.toLowerCase().includes("zakat") ||
    campaign?.categoryName?.toLowerCase().includes("ziswaf");
  const donateHref = isZakat ? "/zakat/bayar" : getCampaignDonateHref(campaign);
  const ctaLabel = isZakat ? "Tunaikan Zakat" : "Donasi Sekarang";

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-300 p-3.5 shadow-lg flex items-center justify-between gap-4">
      <div>
        <span className="text-sm text-slate-700 block">
          {isZakat ? "Zakat Terhimpun" : "Dana Terkumpul"}
        </span>
        <span className="font-semibold text-base sm:text-lg text-primary">
          {formatRupiah(campaign.collectedAmount)}
        </span>
      </div>

      <div className="flex-1 max-w-xs">
        {isClosed ? (
          <Button disabled className="w-full font-normal h-11 bg-slate-200 text-slate-600 cursor-not-allowed shadow-none">
            {isZakat ? "Penyaluran Zakat Ditutup" : "Penggalangan Dana Ditutup"}
          </Button>
        ) : (
          <Link href={donateHref} className="block w-full">
            <Button className="w-full font-normal h-11 bg-primary hover:bg-primary-hover text-white cursor-pointer">
              {ctaLabel}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

