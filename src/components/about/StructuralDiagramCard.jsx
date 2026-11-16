"use client";

import { useState } from "react";
import Image from "next/image";
import { MaximizeSquareIcon as Maximize2 } from "@solar-icons/react/line-duotone/maximize-square";
import { CloseIcon as X } from "@solar-icons/react/linear/close";
import { GalleryIcon as FileImage } from "@solar-icons/react/line-duotone/gallery";
import { MagnifierZoomInIcon as ZoomIn } from "@solar-icons/react/line-duotone/magnifier-zoom-in";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";

/**
 * Komponen kartu bagan struktur organisasi dengan skeleton loading bebas layout shift (CLS)
 * dan dialog pratinjau resolusi tinggi (lightbox).
 *
 * @param {object} props
 * @param {string} [props.src] - URL gambar bagan struktural
 * @param {string} [props.alt] - Deskripsi teks gambar
 */
export function StructuralDiagramCard({
  src,
  alt = "Bagan Struktur Organisasi Yayasan Payung Berkah",
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Jika tidak ada URL gambar yang diberikan, komponen tidak dirender
  if (!src) return null;

  return (
    <>
      <div className="space-y-2">
        {/* Kontainer Gambar Utama dengan Skeleton State */}
        <div
          onClick={() => !hasError && setIsOpen(true)}
          className="group relative w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-50 cursor-pointer shadow-2xs hover:border-slate-300 transition-all select-none"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsOpen(true);
            }
          }}
          aria-label="Klik untuk memperbesar bagan struktur organisasi"
        >
          {/* Shimmer Skeleton Placeholder saat gambar sedang dimuat */}
          {isLoading && !hasError && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-100 animate-pulse">
              <div className="p-3 rounded-full bg-slate-200/80 mb-2">
                <FileImage className="w-6 h-6 text-slate-400" />
              </div>
              <span className="text-xs font-medium text-slate-400">
                Memuat bagan struktur...
              </span>
            </div>
          )}

          {/* Gambar Bagan */}
          {!hasError ? (
            <div className="relative w-full min-h-[220px] sm:min-h-[320px] max-h-[460px] flex items-center justify-center p-2 sm:p-3">
              <Image
                src={src}
                alt={alt}
                width={1200}
                height={800}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
                className={`w-full h-auto max-h-[440px] object-contain rounded-lg transition-opacity duration-300 ${
                  isLoading ? "opacity-0" : "opacity-100"
                }`}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setHasError(true);
                }}
                unoptimized={
                  typeof src === "string" &&
                  !src.startsWith("/") &&
                  !src.includes("lh3.googleusercontent.com")
                }
              />

              {/* Hover Overlay Aksi Perbesar */}
              <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none rounded-xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 text-slate-900 text-xs font-medium shadow-md backdrop-blur-xs">
                  <ZoomIn className="w-3.5 h-3.5 text-primary" />
                  Klik untuk perbesar
                </span>
              </div>
            </div>
          ) : (
            /* Fallback jika gambar rusak atau gagal dimuat */
            <div className="py-12 px-4 text-center space-y-2">
              <FileImage className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Bagan visual belum dapat dimuat saat ini.
              </p>
            </div>
          )}
        </div>

        {/* Keterangan & Tombol Aksesibilitas */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>Bagan hierarki pembina, pengawas, dan pengurus harian.</span>
          {!hasError && (
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center gap-1 font-medium text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Perbesar</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal / Dialog Lightbox Resolusi Penuh */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          hideCloseButton={false}
          className="max-w-5xl w-[95vw] max-h-[92vh] p-4 sm:p-6 bg-white overflow-hidden flex flex-col"
        >
          <DialogHeader className="pb-3 border-b border-slate-100">
            <DialogTitle className="text-sm sm:text-base font-semibold text-slate-900">
              Bagan Struktur Organisasi Yayasan Payung Berkah
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-auto py-4 flex items-center justify-center bg-slate-50 rounded-lg min-h-[300px]">
            <Image
              src={src}
              alt={alt}
              width={1920}
              height={1200}
              className="w-full h-auto max-h-[75vh] object-contain rounded-md"
              unoptimized={
                typeof src === "string" &&
                !src.startsWith("/") &&
                !src.includes("lh3.googleusercontent.com")
              }
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

