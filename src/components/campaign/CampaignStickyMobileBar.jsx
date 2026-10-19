import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatRupiah, isCampaignClosed } from "@/lib/formatters";

export function CampaignStickyMobileBar({ campaign }) {
  const isClosed = isCampaignClosed(campaign);

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-300 p-3.5 shadow-lg flex items-center justify-between gap-4">
      <div>
        <span className="text-sm text-slate-700 block">Dana Terkumpul</span>
        <span className="font-semibold text-base sm:text-lg text-primary">
          {formatRupiah(campaign.collectedAmount)}
        </span>
      </div>

      <div className="flex-1 max-w-xs">
        {isClosed ? (
          <Button disabled className="w-full font-normal h-11 bg-slate-200 text-slate-600 cursor-not-allowed shadow-none">
            Penggalangan Dana Ditutup
          </Button>
        ) : (
          <Link href={`/campaign/${campaign.slug}/donate`} className="block w-full">
            <Button className="w-full font-normal h-11 bg-primary hover:bg-primary-hover text-white cursor-pointer">
              Donasi Sekarang
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

