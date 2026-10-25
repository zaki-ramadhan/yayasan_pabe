"use client";

import { useState } from "react";
import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Generates a lightweight SVG shimmer base64 data URL for LQIP (Low Quality Image Placeholder).
 * Eliminates Cumulative Layout Shift (CLS) during image fetch.
 */
function getShimmerPlaceholder(w = 700, h = 475) {
  const shimmerSvg = `<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><linearGradient id="g"><stop stop-color="#f1f5f9" offset="20%"/><stop stop-color="#e2e8f0" offset="50%"/><stop stop-color="#f1f5f9" offset="70%"/></linearGradient></defs><rect width="${w}" height="${h}" fill="#f1f5f9"/><rect id="r" width="${w}" height="${h}" fill="url(#g)"/></svg>`;
  return `data:image/svg+xml;base64,${typeof window === "undefined" ? Buffer.from(shimmerSvg).toString("base64") : window.btoa(shimmerSvg)}`;
}

export function SafeImage({
  src,
  alt = "Gambar",
  fill = true,
  width,
  height,
  className,
  priority = false,
  quality = 80,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  fallbackText = "Gambar tidak tersedia",
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // If no source provided or error occurred, show clean fallback icon only
  if (!src || hasError) {
    return (
      <div
        className={cn(
          "w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 p-2 select-none",
          className
        )}
      >
        <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400 stroke-[1.75]" />
      </div>
    );
  }

  const isUnoptimized =
    typeof src === "string" &&
    (src.includes("fbcdn.net") ||
      src.includes("cdninstagram.com") ||
      src.includes("instagram.com"));

  const blurUrl = getShimmerPlaceholder(width || 700, height || 475);

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        quality={quality}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        placeholder="blur"
        blurDataURL={blurUrl}
        unoptimized={isUnoptimized}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={cn(
          "object-cover transition-opacity duration-300",
          !isLoaded && "opacity-80",
          className
        )}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 600}
      height={height || 400}
      quality={quality}
      priority={priority}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      placeholder="blur"
      blurDataURL={blurUrl}
      unoptimized={isUnoptimized}
      onLoad={() => setIsLoaded(true)}
      onError={() => setHasError(true)}
      className={cn(
        "object-cover transition-opacity duration-300",
        !isLoaded && "opacity-80",
        className
      )}
    />
  );
}
