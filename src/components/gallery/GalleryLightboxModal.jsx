"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, Calendar, Tag, ChevronLeft, ChevronRight, Images, Play } from "lucide-react";
import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatDate, decodeHtmlEntities } from "@/lib/formatters";
import {
  isVideoUrl,
  isYouTubeUrl,
  getYouTubeVideoId,
  getYouTubeThumbnail,
} from "@/lib/galleryGroupHelper";
import { AdminInlineEditButton } from "@/components/shared/AdminInlineEditButton";

/**
 * Modal Lightbox Galeri Interaktif:
 * - Mendukung navigasi multi-foto dalam satu album/koleksi (Next/Prev & Keyboard Arrows)
 * - Strip pemilih thumbnail foto untuk akses langsung
 * - Informasi lengkap: Kategori, Tanggal pelaksanaan, Judul, dan Narasi dokumentasi
 *
 * @param {object} props
 * @param {object|null} props.item - Entitas koleksi galeri atau null
 * @param {Function} props.onClose - Callback saat modal ditutup
 */
export function GalleryLightboxModal({ item = null, onClose }) {
  // Normalisasi data album foto
  const collection = item?.item || item;
  const initialIndex = item?.initialIndex ?? 0;

  const images = Array.isArray(collection?.images) && collection.images.length > 0
    ? collection.images
    : collection?.imageUrl
      ? [collection.imageUrl]
      : [];

  const [prevItem, setPrevItem] = useState(item);
  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.min(initialIndex, Math.max(0, images.length - 1))
  );

  if (item !== prevItem) {
    setPrevItem(item);
    setCurrentIndex(Math.min(initialIndex, Math.max(0, images.length - 1)));
  }

  const rawItems = collection?.rawItems || [];
  const currentRawItem = rawItems[currentIndex] || rawItems[0] || collection;

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!item) return;

    function handleKeyDown(e) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [item, handlePrev, handleNext]);

  if (!collection) return null;

  const displayTitle = decodeHtmlEntities(currentRawItem?.title || collection.title || "Dokumentasi Kegiatan");
  const displayDate = currentRawItem?.activityDate || collection.activityDate || collection.createdAt;
  const displayDescription = decodeHtmlEntities(currentRawItem?.description || collection.description || "");
  const categoryName = decodeHtmlEntities(collection.category || "Umum");
  const activeImageUrl = images[currentIndex] || "/img/branding/logo-ypabe.webp";
  const hasMultiplePhotos = images.length > 1;

  return (
    <Dialog open={Boolean(item)} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay className="bg-slate-950/85 backdrop-blur-sm z-50" />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 pointer-events-none">
          <div className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] pointer-events-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Tombol Tutup Floating */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-slate-950/60 hover:bg-slate-950 text-white flex items-center justify-center transition-colors cursor-pointer shadow-md"
              title="Tutup pratinjau"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Container Foto Utama / Video / High-Res Viewport */}
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-slate-950 flex items-center justify-center overflow-hidden select-none">
              {isYouTubeUrl(activeImageUrl) ? (
                <iframe
                  key={activeImageUrl}
                  src={`https://www.youtube-nocookie.com/embed/${getYouTubeVideoId(activeImageUrl)}?autoplay=1&rel=0`}
                  title={displayTitle}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : isVideoUrl(activeImageUrl) ? (
                <video
                  key={activeImageUrl}
                  src={activeImageUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : (
                <Image
                  key={activeImageUrl}
                  src={activeImageUrl}
                  alt={`${displayTitle} - Media ${currentIndex + 1}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 1200px"
                  priority
                  unoptimized
                />
              )}

              {/* Indikator Urutan Media */}
              {hasMultiplePhotos && (
                <div className="absolute top-3.5 left-3.5 z-20 px-2.5 py-1 rounded-full bg-slate-950/70 text-white text-xs font-medium flex items-center gap-1.5 shadow-sm backdrop-blur-xs">
                  <Images className="w-3.5 h-3.5 text-slate-300" />
                  <span>
                    Media {currentIndex + 1} dari {images.length}
                  </span>
                </div>
              )}

              {/* Tombol Panah Navigasi Kiri & Kanan */}
              {hasMultiplePhotos && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                    className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-950/60 hover:bg-slate-950 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
                    title="Media sebelumnya (Panah Kiri)"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-950/60 hover:bg-slate-950 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
                    title="Media berikutnya (Panah Kanan)"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Strip Thumbnail Selector untuk Multi-Media */}
            {hasMultiplePhotos && (
              <div className="bg-slate-900 px-3 py-2 border-t border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-thin">
                {images.map((imgUrl, idx) => {
                  const isActive = idx === currentIndex;
                  const isThumbVideo = isVideoUrl(imgUrl);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`relative w-12 h-9 sm:w-14 sm:h-10 rounded-md overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        isActive
                          ? "border-primary ring-1 ring-primary shadow-sm scale-105"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                      title={`Pilih media ${idx + 1}`}
                    >
                      {isYouTubeUrl(imgUrl) ? (
                        <div className="relative w-full h-full bg-slate-900">
                          <Image
                            src={getYouTubeThumbnail(imgUrl)}
                            alt={`Thumbnail ${idx + 1}`}
                            fill
                            sizes="60px"
                            className="object-cover"
                            unoptimized
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/30">
                            <Play className="w-3 h-3 fill-white text-white" />
                          </div>
                        </div>
                      ) : isThumbVideo ? (
                        <div className="relative w-full h-full bg-slate-950 flex items-center justify-center">
                          <Play className="w-3 h-3 fill-white text-white" />
                        </div>
                      ) : (
                        <Image
                          src={imgUrl}
                          alt={`Thumbnail ${idx + 1}`}
                          fill
                          sizes="60px"
                          className="object-cover"
                          unoptimized
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Panel Metadata & Narasi Dokumentasi */}
            <div className="p-4 sm:p-5 bg-white space-y-2 border-t border-slate-100 overflow-y-auto">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="gap-1 font-normal text-xs bg-slate-100 text-slate-800">
                    <Tag className="w-3 h-3 text-slate-400" />
                    {categoryName}
                  </Badge>
                  {displayDate && (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(displayDate)}
                    </span>
                  )}
                </div>

                <AdminInlineEditButton
                  href={`/admin/galeri?edit=${currentRawItem?.id || collection.id}`}
                  label="Edit foto"
                />
              </div>

              <h2 className="text-sm sm:text-base font-semibold text-slate-950 leading-snug">
                {displayTitle}
              </h2>

              {displayDescription && (
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                  {displayDescription}
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogPortal>
    </Dialog>
  );
}
