"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QuickDonateFolder } from "@/components/modules/QuickDonateFolder";
import { cn } from "@/lib/utils";
import { ASSET_PATHS } from "@/lib/assetConstants";

const HERO_SLIDES = [
  {
    id: 1,
    image: ASSET_PATHS.BANNERS.HERO_SLIDE_1,
    label: "Pendidikan Al-Qur'an",
  },
  {
    id: 2,
    image: ASSET_PATHS.BANNERS.HERO_SLIDE_2,
    label: "Pemberdayaan Yatim & Dhuafa",
  },
  {
    id: 3,
    image: ASSET_PATHS.BANNERS.HERO_SLIDE_3,
    label: "Musyawarah & Halaqah",
  },
];

export function HomeHero({ defaultCampaignSlug }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <section className="relative overflow-hidden border-b border-slate-300 py-14 sm:py-20">
      {/* Background Image Slideshow Layer */}
      <div
        className="absolute inset-0 z-0 pointer-events-none select-none"
        onContextMenu={(e) => e.preventDefault()}
      >
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={slide.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 ease-in-out pointer-events-none select-none",
              idx === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            <Image
              src={slide.image}
              alt=""
              fill
              priority={idx === 0}
              sizes="100vw"
              className="object-cover object-center transform scale-105 transition-transform duration-10000 ease-out pointer-events-none select-none"
              draggable={false}
              aria-hidden="true"
            />
          </div>
        ))}

        {/* Directional Light Overlay: Solid enough on left so text is 100% crisp & non-faint, transparent on right */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/20 sm:to-white/10 pointer-events-none select-none" />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-12">
          {/* Left Copy: Mengambil sisa ruang dinamis secara leluasa */}
          <div className="flex-1 max-w-2xl space-y-6">
            <div className="space-y-1.5 sm:space-y-2">
              <h1 className="text-5xl sm:text-6xl md:text-6xl lg:text-7xl xl:text-8xl font-crustaceans text-slate-950 leading-[1.08] sm:leading-[1.1] break-words">
                Penyaluran Zakat, Infak, dan Sedekah untuk Santri &amp; Dhuafa
              </h1>

              <p className="text-base text-slate-800 leading-relaxed max-w-xl font-normal -mt-1 sm:-mt-2">
                Yayasan PABE mengelola dan menyalurkan dana amanah untuk pembinaan hafalan Al-Qur&apos;an, kemandirian anak yatim, dan bantuan kemanusiaan secara transparan.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/program">
                <Button
                  size="lg"
                  variant="primary3d"
                  className="h-12 px-6 rounded-lg"
                >
                  Lihat Program Donasi
                </Button>
              </Link>
              <Link href="/kalkulator-zakat">
                <Button
                  size="lg"
                  variant="secondary3d"
                  className="h-12 px-6 rounded-lg"
                >
                  Kalkulator Zakat
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Quick Donation Folder: Ukuran Mandiri Bebas Grid (Mudah Diubah-ubah) */}
          <div className="w-full lg:w-[500px] shrink-0 flex justify-center lg:justify-end">
            <QuickDonateFolder defaultCampaignSlug={defaultCampaignSlug} />
          </div>
        </div>
      </div>
    </section>
  );
}
