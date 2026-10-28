"use client";

import { Calendar } from "lucide-react";
import { formatDate, decodeHtmlEntities } from "@/lib/formatters";
import { GalleryCardCarousel } from "./GalleryCardCarousel";

/**
 * Kartu dokumentasi galeri kegiatan ala Instagram Carousel:
 * - Wadah kartu: bg-white, border-slate-300, rounded-xl, padding p-3.5 sm:p-4 (konsisten dengan kartu program)
 * - Foto/media: GalleryCardCarousel dengan aspect-[16/10], navigasi geser panah & swipe, indikator titik dan counter
 * - Detail bawah: Judul line-clamp-2 (min-h-[2.5rem]) dan baris kategori vs tanggal (between)
 * - Nilai rounded, gap, ukuran foto, dan ukuran teks dipertahankan secara presisi
 *
 * @param {object} props
 * @param {object} props.item - Entitas koleksi galeri
 */
export function GalleryCard({ item }) {
  const displayTitle = decodeHtmlEntities(item.title || "Dokumentasi Kegiatan");
  const displayDate = item.activityDate || item.createdAt;
  const categoryName = decodeHtmlEntities(item.category || "Umum");
  const images = Array.isArray(item.images) && item.images.length > 0
    ? item.images
    : [item.mainImage || item.imageUrl || "/img/branding/logo-ypabe.webp"];

  return (
    <div className="bg-white rounded-xl border border-slate-300 p-3.5 sm:p-4 flex flex-col justify-between group">
      {/* 1. Media Carousel ala Instagram */}
      <GalleryCardCarousel images={images} title={displayTitle} />

      {/* 2. Detail Informasi: Judul (Line-Clamp 2) & Baris Kategori vs Tanggal (Between) */}
      <div className="space-y-2 mt-3 pt-0.5">
        <h3
          className="font-medium text-sm text-slate-900 group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem] leading-snug"
          title={displayTitle}
        >
          {displayTitle}
        </h3>

        <div className="flex items-center justify-between gap-2 text-xs">
          {/* Kategori dengan teks tegas */}
          <span className="font-medium text-slate-800 truncate max-w-[55%]">
            {categoryName}
          </span>

          {/* Tanggal dengan teks jelas & kontras */}
          {displayDate && (
            <div className="flex items-center gap-1.5 shrink-0 text-slate-700 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-600" />
              <time dateTime={displayDate}>{formatDate(displayDate)}</time>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
