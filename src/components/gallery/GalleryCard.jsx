"use client";

import { formatDate, decodeHtmlEntities } from "@/lib/formatters";
import { GalleryCardCarousel } from "./GalleryCardCarousel";

export function GalleryCard({ item }) {
  const displayTitle = decodeHtmlEntities(item.title || "Dokumentasi Kegiatan");
  const displayDate = item.activityDate || item.createdAt;
  const categoryName = decodeHtmlEntities(item.category || "Umum");
  const images = Array.isArray(item.images) && item.images.length > 0
    ? item.images
    : [item.mainImage || item.imageUrl || "/img/branding/logo-ypabe.webp"];

  return (
    <div className="bg-white rounded-xl border border-slate-300 p-3.5 sm:p-4 flex flex-col justify-between group">
      <GalleryCardCarousel images={images} />

      <div className="space-y-2 mt-3 pt-0.5">
        <h3
          className="font-medium text-base text-slate-900 line-clamp-2 min-h-[2.5rem] leading-snug"
        >
          {displayTitle}
        </h3>

        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="truncate max-w-[55%] text-slate-600 font-medium text-xs">
            {categoryName}
          </span>

          {displayDate && (
            <time dateTime={displayDate} className="shrink-0 text-slate-600 text-xs font-medium">
              {formatDate(displayDate)}
            </time>
          )}
        </div>
      </div>
    </div>
  );
}
