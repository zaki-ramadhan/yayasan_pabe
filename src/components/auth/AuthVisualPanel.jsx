"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { ASSET_PATHS } from "@/lib/assetConstants";
import { cn } from "@/lib/utils";

const AUTH_SLIDES = [
  {
    id: 1,
    image: ASSET_PATHS.BANNERS.AUTH_SLIDE_1,
    title: "Mari Melangkah Bersama, Wujudkan Kebaikan Nyata",
    desc: "Satu langkah kepedulian Anda menghadirkan masa depan yang lebih mandiri dan penuh harapan bagi santri, yatim, dan dhuafa.",
  },
  {
    id: 2,
    image: ASSET_PATHS.BANNERS.AUTH_SLIDE_2,
    title: "Menebar Manfaat, Menjaga Martabat Umat",
    desc: "Dukungan Anda mengalir langsung ke program pendidikan Al-Qur'an dan santunan rutin yang transparan dan amanah.",
  },
  {
    id: 3,
    image: ASSET_PATHS.BANNERS.AUTH_SLIDE_3,
    title: "Hidup Berkah dengan Sedekah",
    desc: "Bersama kita rajut kebahagiaan dan senyuman generasi yatim dhuafa untuk masa depan peradaban yang berakhlak mulia.",
  },
];

export function AuthVisualPanel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % AUTH_SLIDES.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <div className="hidden lg:block h-[100dvh] max-h-screen sticky top-0 p-2 overflow-hidden">
      <div className="h-full w-full rounded-3xl relative overflow-hidden flex flex-col justify-end items-center text-center p-6 sm:p-8 lg:p-10 pb-5 lg:pb-6 shadow-2xl border border-slate-800/80 bg-slate-950">
        {/* Top-Left Icon-Only Back to Home Button */}
        <div className="absolute top-5 left-5 lg:top-6 lg:left-6 z-20">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-900/50 hover:bg-slate-900/80 text-white/90 hover:text-white border border-white/20 backdrop-blur-md transition-all shadow-md group cursor-pointer"
            aria-label="Kembali ke Beranda"
            title="Kembali ke Beranda"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          </Link>
        </div>

        {/* Dynamic Photographic Background Slideshow */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none">
          {AUTH_SLIDES.map((slide, idx) => (
            <div
              key={slide.id}
              className={cn(
                "absolute inset-0 transition-opacity duration-1000 ease-in-out pointer-events-none select-none",
                idx === currentSlide ? "opacity-100" : "opacity-0"
              )}
            >
              <Image
                src={slide.image}
                alt=""
                fill
                sizes="(max-width: 1200px) 50vw, 40vw"
                className="object-cover object-center brightness-[0.45] contrast-[1.05] saturate-60 pointer-events-none select-none"
                draggable={false}
                aria-hidden="true"
                priority={idx === 0}
              />
            </div>
          ))}
        </div>

        {/* Artistic Texture Overlay */}
        <div className="absolute inset-0 mix-blend-overlay opacity-45 pointer-events-none select-none">
          <Image
            src={ASSET_PATHS.TEXTURES.OVERLAY_2}
            alt=""
            fill
            sizes="(max-width: 1200px) 50vw, 40vw"
            className="object-cover object-center pointer-events-none select-none"
            draggable={false}
            aria-hidden="true"
          />
        </div>

        {/* Gradient Layer for Text Legibility & Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-900/30 pointer-events-none" />

        {/* Ambient Glow Accents */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />

        {/* Bottom Aligned Content Group */}
        <div className="relative z-10 w-full max-w-md xl:max-w-lg mx-auto flex flex-col items-center">
          {/* Inviting Action Headline & Subheading with Crossfade */}
          <div className="space-y-4 text-center min-h-[140px] flex flex-col justify-end">
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-crustaceans text-white tracking-tight leading-[1.15] transition-all duration-700">
              {AUTH_SLIDES[currentSlide].title}
            </h1>

            <p className="text-xs sm:text-sm xl:text-base text-slate-400 leading-relaxed max-w-md mx-auto font-normal transition-opacity duration-700">
              {AUTH_SLIDES[currentSlide].desc}
            </p>
          </div>

          {/* Slide Indicator Dots */}
          <div className="flex items-center justify-center gap-1.5 mt-6 mb-2">
            {AUTH_SLIDES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500 cursor-pointer",
                  idx === currentSlide
                    ? "w-6 bg-white shadow-sm"
                    : "w-1.5 bg-white/35 hover:bg-white/60"
                )}
              />
            ))}
          </div>

          {/* Generous Spacing Before Copyright */}
          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-[11px] sm:text-xs text-slate-400 font-normal">
              © {new Date().getFullYear()} Yayasan PABE
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
