"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ImageFallback } from "@/components/ui/ImageFallback";

export function SafeImage({
  src,
  alt = "Gambar",
  fill = true,
  width,
  height,
  className,
  fallbackClassName,
  priority = false,
  loading,
  quality,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
}) {
  const [failedSrc, setFailedSrc] = useState(null);

  const normalizedSrc = typeof src === "string" ? src.trim() : src;
  const resolvedSrc =
    typeof normalizedSrc === "string" && normalizedSrc.includes(".r2.dev/")
      ? `/api/media/${normalizedSrc.split(".r2.dev/")[1]}`
      : normalizedSrc;

  const hasError = Boolean(resolvedSrc && failedSrc === resolvedSrc);

  if (!resolvedSrc || hasError) {
    return <ImageFallback alt={alt} className={fallbackClassName} />;
  }

  const isUnoptimized =
    typeof resolvedSrc === "string" &&
    (resolvedSrc.includes("fbcdn.net") ||
      resolvedSrc.includes("cdninstagram.com") ||
      resolvedSrc.includes("instagram.com") ||
      resolvedSrc.startsWith("http://") ||
      resolvedSrc.startsWith("https://"));

  const loadingProp = !priority && loading ? { loading } : {};

  if (fill) {
    return (
      <Image
        src={resolvedSrc}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        {...loadingProp}
        {...(quality ? { quality } : {})}
        unoptimized={isUnoptimized}
        referrerPolicy="no-referrer"
        onError={() => setFailedSrc(resolvedSrc)}
        className={cn("object-cover transition-opacity duration-300", className)}
      />
    );
  }

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      width={width || 600}
      height={height || 400}
      sizes={sizes}
      priority={priority}
      {...loadingProp}
      {...(quality ? { quality } : {})}
      unoptimized={isUnoptimized}
      referrerPolicy="no-referrer"
      onError={() => setFailedSrc(resolvedSrc)}
      className={cn("object-cover transition-opacity duration-300", className)}
    />
  );
}
