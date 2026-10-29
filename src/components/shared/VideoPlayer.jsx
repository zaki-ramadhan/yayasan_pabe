"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Play, Video as VideoIcon } from "lucide-react";
import {
  isYouTubeUrl,
  getYouTubeVideoId,
  getYouTubeThumbnail,
} from "@/lib/galleryGroupHelper";

/**
 * Komponen Pemutar Media Video Terpadu (Single Responsibility Principle).
 * Mendukung video langsung (MP4/WebM/MOV) dan tautan YouTube tanpa memicu permintaan jaringan sebelum tombol Play ditekan.
 * Mencegah pop-up download otomatis oleh aplikasi pihak ketiga (seperti IDM) saat halaman dimuat.
 *
 * @param {object} props
 * @param {string} props.src - URL berkas video langsung atau URL YouTube
 * @param {string} [props.poster] - URL gambar poster kustom
 * @param {string} [props.title] - Judul video untuk aksesibilitas
 * @param {boolean} [props.isActive=true] - Status keaktifan slide/tampilan. Jika false, video otomatis dijeda dan direset.
 * @param {string} [props.className] - Kelas CSS wadah luar
 * @param {"cover" | "contain"} [props.objectFit="cover"] - Penyesuaian rasio video
 */
/**
 * Menghasilkan URL streaming aman untuk berkas video lokal/R2.
 * Menambahkan suffix /stream agar IDM atau pengunduh otomatis tidak mendeteksi URL sebagai berkas unduhan .mp4 mentah.
 */
function getStreamingUrl(url) {
  if (!url || typeof url !== "string") return url;
  if (url.startsWith("/api/media/") || url.includes("/api/media/")) {
    const clean = url.split("?")[0].replace(/\/+$/, "");
    if (!clean.endsWith("/stream")) {
      return `${clean}/stream`;
    }
  }
  return url;
}

export function VideoPlayer({
  src,
  poster,
  title = "Video Dokumentasi",
  isActive = true,
  className = "",
  objectFit = "cover",
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  const isYt = isYouTubeUrl(src);
  const ytVideoId = isYt ? getYouTubeVideoId(src) : null;
  const resolvedPoster = poster || (isYt ? getYouTubeThumbnail(src) : null);
  const resolvedSrc = isYt ? src : getStreamingUrl(src);

  // Auto-pause & reset saat berpindah slide carousel atau tidak aktif
  useEffect(() => {
    if (!isActive && isPlaying) {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      setIsPlaying(false);
    }
  }, [isActive, isPlaying]);

  const handleStartPlay = (e) => {
    e.stopPropagation();
    setIsPlaying(true);
    if (!isYt && videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleContainerTouchOrClick = (e) => {
    // Mencegah interaksi pemutar media memicu navigasi kartu atau pergeseran swipe induk
    e.stopPropagation();
  };

  if (!src) {
    return (
      <div className={`w-full h-full bg-slate-900 flex items-center justify-center text-slate-400 text-xs ${className}`}>
        Sumber video tidak valid
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-slate-950 select-none ${className}`}
      onClick={handleContainerTouchOrClick}
      onTouchStart={isPlaying ? handleContainerTouchOrClick : undefined}
      onTouchEnd={isPlaying ? handleContainerTouchOrClick : undefined}
    >
      {isYt ? (
        // Mode Video YouTube
        isPlaying && ytVideoId ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${ytVideoId}?autoplay=1&rel=0&modestbranding=1`}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div
            onClick={handleStartPlay}
            className="relative w-full h-full cursor-pointer group/player"
            role="button"
            tabIndex={0}
            aria-label={`Putar video YouTube: ${title}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleStartPlay(e);
              }
            }}
          >
            {resolvedPoster ? (
              <Image
                src={resolvedPoster}
                alt={title}
                fill
                className={`object-${objectFit}`}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-slate-900" />
            )}

            {/* Lencana Sumber Media */}
            <span className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-950/80 text-white text-xs font-medium tracking-normal shadow-2xs backdrop-blur-xs border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              YouTube
            </span>

            {/* Tombol Play Khas YouTube */}
            <div className="absolute inset-0 bg-slate-950/25 group-hover/player:bg-slate-950/40 transition-colors flex items-center justify-center">
              <div className="w-12 h-8.5 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-lg group-hover/player:scale-110 transition-transform">
                <Play className="w-4 h-4 fill-white text-white ml-0.5" />
              </div>
            </div>
          </div>
        )
      ) : (
        // Mode Video Langsung (Cloudflare R2 / MP4 / WebM / MOV)
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            src={`${resolvedSrc}#t=0.001`}
            poster={resolvedPoster || undefined}
            controls={isPlaying}
            playsInline
            muted={!isPlaying}
            preload="metadata"
            className={`w-full h-full object-${objectFit}`}
            onEnded={() => setIsPlaying(false)}
          />

          {/* Overlay Siap Putar (Hanya Muncul Saat Belum Dimainkan) */}
          {!isPlaying && (
            <div
              onClick={handleStartPlay}
              className="absolute inset-0 z-10 cursor-pointer group/player bg-slate-950/20 hover:bg-slate-950/35 transition-colors flex items-center justify-center"
              role="button"
              tabIndex={0}
              aria-label={`Putar video: ${title}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleStartPlay(e);
                }
              }}
            >
              {/* Lencana Video Langsung */}
              <span className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-950/80 text-white text-xs font-medium tracking-normal shadow-2xs backdrop-blur-xs border border-white/10 pointer-events-none">
                <VideoIcon className="w-3 h-3 text-slate-300" />
                Video
              </span>

              {/* Tombol Play Beranimasi Halus */}
              <div className="w-12 h-12 rounded-full bg-slate-950/75 hover:bg-slate-950 text-white flex items-center justify-center shadow-lg group-hover/player:scale-110 transition-all border border-white/20 backdrop-blur-xs">
                <Play className="w-5 h-5 fill-white text-white ml-0.5" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
