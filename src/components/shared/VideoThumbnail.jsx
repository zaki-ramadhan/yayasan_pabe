"use client";

import { useState } from "react";
import { SafeImage } from "@/components/ui/SafeImage";
import { cn } from "@/lib/utils";
import {
  getVideoPosterUrl,
  getStreamingUrl,
  isDirectVideoUrl,
} from "@/lib/galleryGroupHelper";

/**
 * Render a video poster image with automatic fallback to a companion photo or a paused video frame.
 */
export function VideoThumbnail({
  src,
  fallbackPoster = null,
  alt = "Pratinjau video",
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  className,
  objectFit = "cover",
}) {
  const primaryPoster = getVideoPosterUrl(src);
  const [posterFailed, setPosterFailed] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);

  const fitClass = objectFit === "contain" ? "object-contain" : "object-cover";
  const showPrimary = Boolean(primaryPoster && !posterFailed);
  const showFallback = Boolean(!showPrimary && fallbackPoster && fallbackPoster !== primaryPoster && !fallbackFailed);

  if (showPrimary) {
    return (
      <SafeImage
        src={primaryPoster}
        alt={alt}
        sizes={sizes}
        className={cn(fitClass, className)}
        onError={() => setPosterFailed(true)}
      />
    );
  }

  if (showFallback) {
    return (
      <SafeImage
        src={fallbackPoster}
        alt={alt}
        sizes={sizes}
        className={cn(fitClass, className)}
        onError={() => setFallbackFailed(true)}
      />
    );
  }

  if (isDirectVideoUrl(src)) {
    return (
      <video
        src={`${getStreamingUrl(src)}#t=0.1`}
        preload="metadata"
        muted
        playsInline
        aria-label={alt}
        className={cn("w-full h-full pointer-events-none", fitClass, className)}
      />
    );
  }

  return <SafeImage src={null} alt={alt} className={className} />;
}

