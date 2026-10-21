"use client";

import { useMemo } from "react";
import { generateBannerMesh } from "@/lib/bannerGradient";

export function DonorProfileBannerCanvas({ seed, className = "" }) {
  const mesh = useMemo(() => generateBannerMesh(seed), [seed]);

  return (
    <div
      className={`h-24 sm:h-28 w-full relative overflow-hidden select-none ${className}`}
      style={mesh.backgroundStyle}
      aria-hidden="true"
    >
      <div className="absolute inset-0 pointer-events-none" style={mesh.splash1Style} />
      <div className="absolute inset-0 pointer-events-none" style={mesh.splash2Style} />
      <div className="absolute inset-0 pointer-events-none" style={mesh.splash3Style} />
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
    </div>
  );
}
