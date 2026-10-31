"use client";

import { useState } from "react";
import { Play, Video as VideoIcon } from "lucide-react";
import { YouTubeIcon } from "@/components/icons/SocialIcons";
import { formatRupiah, formatDate } from "@/lib/formatters";
import { SafeImage } from "@/components/ui/SafeImage";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { VideoPlayer } from "@/components/shared/VideoPlayer";
import { isVideoUrl, isYouTubeUrl, getYouTubeThumbnail } from "@/lib/galleryGroupHelper";

/**
 * Komponen item pembaruan / bukti penyaluran program donasi.
 * Mendukung dokumentasi foto maupun pemutaran video langsung (R2 & YouTube).
 *
 * @param {object} props
 * @param {object} props.update - Data pembaruan program & penyaluran
 */
export function CampaignUpdateItem({ update }) {
  const [activeVideoUrl, setActiveVideoUrl] = useState(null);

  let mediaList = [];
  if (Array.isArray(update.images)) {
    mediaList = update.images.filter(Boolean);
  } else if (typeof update.images === "string" && update.images.trim()) {
    try {
      const parsed = JSON.parse(update.images);
      mediaList = Array.isArray(parsed) ? parsed.filter(Boolean) : [update.images];
    } catch {
      mediaList = [update.images];
    }
  } else if (update.image) {
    mediaList = [update.image];
  }

  return (
    <div className="py-5 first:pt-0 last:pb-0 space-y-2.5">
      <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 flex-wrap gap-2">
        <span className="text-slate-500 font-normal">
          {formatDate(update.date, { withDay: true, month: "short" })}
        </span>
        {update.disbursedAmount ? (
          <span className="text-slate-600">
            Tersalurkan:{" "}
            <span className="font-semibold text-emerald-700">
              {formatRupiah(update.disbursedAmount)}
            </span>
          </span>
        ) : null}
      </div>

      <div className="space-y-1">
        <h4 className="font-semibold text-slate-950 text-base sm:text-lg leading-snug">
          {update.title}
        </h4>
        <p className="text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-line">
          {update.content}
        </p>
      </div>

      {/* Grid Dokumentasi Foto & Video Penyaluran */}
      {mediaList.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 mt-2">
          {mediaList.map((mediaUrl, idx) => {
            const isVid = isVideoUrl(mediaUrl);
            const isYt = isYouTubeUrl(mediaUrl);
            const ytThumb = isYt ? getYouTubeThumbnail(mediaUrl) : null;

            if (isVid || isYt) {
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveVideoUrl(mediaUrl)}
                  aria-label={`Tonton video dokumentasi ${update.title}`}
                  className="group relative block w-full aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-900 text-left cursor-pointer hover:border-slate-300 transition-colors"
                >
                  {isYt && ytThumb ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={ytThumb}
                      alt={`Dokumentasi ${update.title} ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <video
                      src={mediaUrl}
                      preload="metadata"
                      muted
                      playsInline
                      className="w-full h-full object-cover pointer-events-none group-hover:scale-105 transition-transform duration-300"
                    />
                  )}

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-white/95 text-slate-900 shadow-md flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-4 h-4 fill-slate-900 ml-0.5 text-slate-900" />
                    </div>
                  </div>

                  {/* Badge penanda jenis video */}
                  <div className="absolute left-1.5 bottom-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/65 backdrop-blur-xs text-white text-3xs font-medium pointer-events-none">
                    {isYt ? (
                      <>
                        <YouTubeIcon className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span>YouTube</span>
                      </>
                    ) : (
                      <>
                        <VideoIcon className="w-3 h-3 text-emerald-400" />
                        <span>Video</span>
                      </>
                    )}
                  </div>
                </button>
              );
            }

            // Foto dokumentasi standar
            return (
              <a
                key={idx}
                href={mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Lihat foto dokumentasi ${idx + 1}`}
                className="block relative w-full aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-100 hover:opacity-90 transition-opacity"
              >
                <SafeImage
                  src={mediaUrl}
                  alt={`Dokumentasi ${update.title} ${idx + 1}`}
                  sizes="(max-width: 640px) 50vw, 380px"
                  fallbackText="Dokumentasi"
                />
              </a>
            );
          })}
        </div>
      )}

      {/* Modal Dialog Pemutar Video Terpadu */}
      {activeVideoUrl && (
        <Dialog
          open={Boolean(activeVideoUrl)}
          onOpenChange={(isOpen) => !isOpen && setActiveVideoUrl(null)}
        >
          <DialogContent
            hideCloseButton={false}
            className="max-w-2xl bg-black border-slate-800 p-0 overflow-hidden"
          >
            <div className="sr-only">
              <DialogTitle>{`Dokumentasi Video - ${update.title}`}</DialogTitle>
              <DialogDescription>Pemutar media video laporan penyaluran donasi</DialogDescription>
            </div>
            <div className="relative aspect-video w-full bg-black">
              <VideoPlayer
                src={activeVideoUrl}
                title={`Dokumentasi Video - ${update.title}`}
                isActive={Boolean(activeVideoUrl)}
                className="w-full h-full"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
