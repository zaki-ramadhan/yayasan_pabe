"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import {
  isVideoUrl,
  isYouTubeUrl,
  getYouTubeVideoId,
  getYouTubeThumbnail,
} from "@/lib/galleryGroupHelper";

/**
 * Sub-komponen Carousel Media ala Instagram untuk kartu galeri kegiatan.
 * - Menggunakan horizontal slide track (transform: translateX) untuk efek slide-in & slide-out mulus tanpa kedip
 * - Mendukung navigasi panah kiri/kanan di desktop
 * - Mendukung navigasi gestur swipe geser di smartphone
 * - Indikator urutan foto (misal: 1/5) di pojok kanan atas berlatar putih
 * - Indikator titik (dots indicator) di bagian bawah foto
 * - Deteksi otomatis video Cloudflare R2 (loop autoplay) dan video YouTube (poster + embed player)
 *
 * @param {object} props
 * @param {Array<string>} props.images - Daftar URL foto/video
 * @param {string} props.title - Judul dokumentasi untuk atribut alt
 */
export function GalleryCardCarousel({ images = [], title = "Dokumentasi Kegiatan" }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeYtIndex, setActiveYtIndex] = useState(null);
  const touchStartX = useRef(0);

  const mediaList = Array.isArray(images) && images.length > 0
    ? images
    : ["/img/branding/logo-ypabe.webp"];

  const total = mediaList.length;

  const handlePrev = (e) => {
    e.stopPropagation();
    setActiveYtIndex(null);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setActiveYtIndex(null);
    setCurrentIndex((prev) => (prev < total - 1 ? prev + 1 : prev));
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    const threshold = 35; // Jarak minimal swipe dalam pixel

    if (diff > threshold && currentIndex < total - 1) {
      setActiveYtIndex(null);
      setCurrentIndex((prev) => prev + 1);
    } else if (diff < -threshold && currentIndex > 0) {
      setActiveYtIndex(null);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div
      className="relative aspect-[16/10] bg-slate-100 rounded-lg overflow-hidden select-none group/carousel"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 1. Track Sliding Horizontal Mulus (Efek Slide-In & Slide-Out Tanpa Kedip) */}
      <div
        className="flex w-full h-full transition-transform duration-300 ease-out will-change-transform"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {mediaList.map((url, idx) => {
          const isYt = isYouTubeUrl(url);
          const isVid = isVideoUrl(url);

          return (
            <div key={idx} className="relative w-full h-full shrink-0">
              {isYt ? (
                <div className="relative w-full h-full bg-slate-900">
                  {activeYtIndex === idx ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${getYouTubeVideoId(url)}?autoplay=1&rel=0&modestbranding=1`}
                      title={`${title} - Video YouTube`}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveYtIndex(idx);
                      }}
                      className="relative w-full h-full cursor-pointer group/yt"
                    >
                      <Image
                        src={getYouTubeThumbnail(url)}
                        alt={`${title} - Video YouTube`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-slate-950/25 group-hover/yt:bg-slate-950/40 transition-colors flex items-center justify-center">
                        <div className="w-12 h-8.5 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-lg group-hover/yt:scale-110 transition-transform">
                          <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-slate-950/80 text-white text-2xs font-medium tracking-wide">
                        YouTube
                      </span>
                    </div>
                  )}
                </div>
              ) : isVid ? (
                <div className="relative w-full h-full">
                  <video
                    src={url}
                    muted
                    playsInline
                    autoPlay={idx === currentIndex}
                    loop
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />
                  {/* Indikator Pemutar Video Halus */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-slate-950/15">
                    <div className="w-10 h-10 rounded-full bg-slate-950/65 text-white flex items-center justify-center shadow-md">
                      <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                    </div>
                  </div>
                </div>
              ) : (
                <Image
                  src={url}
                  alt={`${title} - Foto ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  loading={idx === 0 ? "eager" : "lazy"}
                  unoptimized
                />
              )}
            </div>
          );
        })}
      </div>

      {/* 2. Floating Indicator Urutan Foto di Kanan Atas (Gaya Instagram) */}
      {total > 1 && (
        <div
          className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-md bg-white/95 text-slate-800 border border-slate-200/90 shadow-2xs backdrop-blur-xs text-xs font-medium select-none pointer-events-none"
          title={`Foto ${currentIndex + 1} dari ${total}`}
        >
          {currentIndex + 1}/{total}
        </div>
      )}

      {/* 3. Tombol Panah Navigasi Kiri (Desktop) */}
      {total > 1 && currentIndex > 0 && (
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Foto sebelumnya"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs border border-slate-200/70 opacity-90 hover:opacity-100"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* 4. Tombol Panah Navigasi Kanan (Desktop) */}
      {total > 1 && currentIndex < total - 1 && (
        <button
          type="button"
          onClick={handleNext}
          aria-label="Foto berikutnya"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs border border-slate-200/70 opacity-90 hover:opacity-100"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* 5. Overlay Gradasi Gelap ke Transparan di Bawah Foto (Agar slider & dots terlihat kontras dan jelas) */}
      {total > 1 && (
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/45 via-slate-950/15 to-transparent pointer-events-none z-5"
        />
      )}

      {/* 6. Indikator Titik (Dots) di Bawah Foto ala Instagram Carousel */}
      {total > 1 && (
        <div
          aria-hidden="true"
          className="absolute bottom-2.5 inset-x-0 z-10 flex items-center justify-center gap-1.5 pointer-events-none"
        >
          {mediaList.slice(0, 7).map((_, idx) => {
            const isActive = idx === currentIndex;
            return (
              <span
                key={idx}
                className={`transition-all duration-300 rounded-full shadow-2xs ${
                  isActive
                    ? "w-4 h-1.5 bg-white"
                    : "w-1.5 h-1.5 bg-white/60"
                }`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
