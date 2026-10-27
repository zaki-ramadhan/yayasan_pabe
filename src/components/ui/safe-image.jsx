"use client";

import { useState } from "react";
import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function SafeImage({
  src,
  alt = "Gambar",
  fill = true,
  width,
  height,
  className,
  priority = false,
  quality,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  fallbackText = "Gambar tidak tersedia",
}) {
  const [hasError, setHasError] = useState(false);

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

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        {...(quality ? { quality } : {})}
        unoptimized={isUnoptimized}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className={cn("object-cover transition-opacity duration-300", className)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 600}
      height={height || 400}
      sizes={sizes}
      priority={priority}
      {...(quality ? { quality } : {})}
      unoptimized={isUnoptimized}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={cn("object-cover transition-opacity duration-300", className)}
    />
  );
}
