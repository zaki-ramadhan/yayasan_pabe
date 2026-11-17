"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * Komponen bagan struktur organisasi murni (pure foto) dengan skeleton shimmer loading
 * tanpa kartu pembungkus (no parent card/border), tanpa tombol perbesar, dan tanpa dialog zoom.
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

  if (!src) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-xl">
      {isLoading && !hasError && (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-10 w-full h-full min-h-[220px] sm:min-h-[300px] rounded-xl bg-slate-100 animate-pulse"
        />
      )}

      {!hasError && (
        <Image
          src={src}
          alt={alt}
          width={1400}
          height={900}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 850px"
          className={`w-full h-auto object-contain rounded-xl transition-opacity duration-300 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          priority
          unoptimized={
            typeof src === "string" &&
            !src.startsWith("/") &&
            !src.includes("lh3.googleusercontent.com")
          }
        />
      )}
    </div>
  );
}
