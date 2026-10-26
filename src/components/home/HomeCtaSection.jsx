import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ASSET_PATHS } from "@/lib/assetConstants";

export function HomeCtaSection({ defaultCampaignSlug = "beasiswa-santri-penghafal-quran" }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Banner Card dengan Radial Gradient (Fokus di Tengah Bawah) & Warna Biru Lebih Teduh */}
      <div className="relative overflow-hidden text-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 lg:p-4 shadow-xl border border-slate-800/80 bg-[radial-gradient(ellipse_130%_110%_at_50%_100%,#1e3a8a_0%,#172554_45%,#0f172a_100%)]">
        {/* Background Texture Overlay 3 (Samar / Tipis) */}
        <div className="absolute inset-0 z-0 bg-fit bg-center pointer-events-none opacity-50 mix-blend-overlay bg-[url('/img/textures/texture-overlay-3.webp')]" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-center">
          {/* Kolom Kiri: Teks & Tombol dengan Padding Pas */}
          <div className="lg:col-span-7 px-3 py-3 sm:px-5 sm:py-4 lg:pl-7 lg:pr-3 space-y-3.5 sm:space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.25rem] font-normal text-white tracking-tight leading-[1.15] sm:leading-[1.12]">
              Siap Berbagi Kebaikan untuk Generasi Masa Depan?
            </h2>

            <p className="text-base text-slate-300 leading-relaxed max-w-xl font-normal">
              Salurkan kepedulian Anda melalui program pendidikan Al-Qur&apos;an dan kemandirian santri yatim secara amanah, transparan, dan tepat sasaran.
            </p>

            <div className="pt-1.5">
              <Button
                asChild
                className="h-10 sm:h-11 px-6 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-semibold text-xs sm:text-sm transition-colors shadow-sm cursor-pointer border-0"
              >
                <Link href="/program">
                  Lihat Program Donasi
                </Link>
              </Button>
            </div>
          </div>

          {/* Kolom Kanan: Foto dengan Padding Ringkas & Proporsional */}
          <div className="lg:col-span-5 p-1 sm:p-1.5">
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-white/10 ring-1 ring-slate-900/60 pointer-events-none select-none">
              <Image
                src={ASSET_PATHS.BANNERS.CTA_MAIN}
                alt=""
                fill
                loading="eager"
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-center pointer-events-none select-none"
                draggable={false}
                aria-hidden="true"
              />

              {/* Overlay tipis dan natural agar foto tetap cerah & jelas */}
              <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-slate-950/25 via-transparent to-transparent" />
              <div className="absolute inset-0 z-10 pointer-events-none bg-slate-950/[0.08]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
