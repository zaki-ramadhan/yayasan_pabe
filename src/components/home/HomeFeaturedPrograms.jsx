import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampaignCardMinimal } from "@/components/home/CampaignCardMinimal";
import { isCampaignClosed } from "@/lib/formatters";

/**
 * Featured campaigns showcase on home page (Modern Split Layout)
 * @param {object} props
 * @param {Array} props.campaigns
 * @param {number} props.totalCount
 */
export function HomeFeaturedPrograms({ campaigns = [], totalCount = 0 }) {
  const activeCampaigns = campaigns.filter((c) => !isCampaignClosed(c));
  const displayedCampaigns = activeCampaigns.slice(0, 4);

  if (displayedCampaigns.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-slate-100/80 border-y border-slate-200 py-12 sm:py-16">
      {/* Background Line Decoration Overlay (Full Lebar & Tinggi, Opacity 20%) */}
      <div className="absolute inset-0 pointer-events-none select-none scale-130 overflow-hidden z-0">
        <Image
          src="/img/decorations/line-accent.svg"
          alt=""
          aria-hidden="true"
          draggable={false}
          fill
          sizes="100vw"
          className="object-fill opacity-8 pointer-events-none select-none"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Kolom Kiri: Sticky Header & Navigasi Program */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="space-y-2 sm:space-y-2.5">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-slate-950 tracking-tight leading-tight">
                Program Donasi Pilihan
              </h2>
              <p className="text-base text-slate-700 leading-relaxed font-normal">
                Salurkan kepedulian Anda untuk program pendidikan yatim, kemanusiaan, dan pemberdayaan umat secara amanah serta transparan.
              </p>
            </div>

            {/* Tombol Aksi di Kolom Kiri */}
            <div className="pt-1">
              <Link href="/program" className="inline-block">
                <Button
                  variant="outline"
                  className="h-9 sm:h-9.5 px-4.5 rounded-lg text-xs sm:text-sm font-medium border-slate-300 text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400 shadow-2xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span>Lihat seluruh program</span>
                  {totalCount > 0 && (
                    <span className="text-slate-500 font-normal">({totalCount})</span>
                  )}
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Kolom Kanan: Grid Kartu Program Minimalis (2 Kolom, Tepat 4 Kartu 2x2) */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {displayedCampaigns.map((camp, index) => (
                <div key={camp.id} className="flex h-full">
                  <CampaignCardMinimal campaign={camp} priority={index === 0} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
