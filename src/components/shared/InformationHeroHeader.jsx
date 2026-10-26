import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * InformationHeroHeader: Reusable full-width dark hero section with texture overlay
 * Used across sub-pages under "Informasi" (Kalkulator Zakat, Distribusi, Laporan, Karier, Ketentuan Transaksi).
 *
 * @param {object} props
 * @param {React.ReactNode} props.title - Page title
 * @param {React.ReactNode} [props.description] - Subtitle description
 * @param {React.ReactNode} [props.badge] - Category or status badge pill
 * @param {string} [props.imageSrc="/img/textures/texture-overlay-4.webp"] - Background texture image
 * @param {string} [props.imageAlt="Latar Belakang Header Yayasan PABE"] - Image alt text
 * @param {string} [props.className=""] - Additional custom classes
 */
export function InformationHeroHeader({
  title,
  description,
  badge,
  imageSrc = "/img/textures/texture-overlay-4.webp",
  imageAlt = "Latar Belakang Header Yayasan PABE",
  className = "",
}) {
  return (
    <header
      className={cn(
        "relative w-full overflow-hidden bg-slate-950 pt-10 sm:pt-14 pb-8 sm:pb-10 border-b border-slate-800",
        className
      )}
    >
      {/* Background Image Texture */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <Image
          src={imageSrc}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center pointer-events-none select-none"
          draggable={false}
          aria-hidden="true"
        />
        {/* Subtle Dark Overlays for Optimal Text Readability & Contrast */}
        <div className="absolute inset-0 bg-slate-950/40 pointer-events-none select-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/50 to-slate-950/90 pointer-events-none select-none" />
      </div>

      {/* Inner Content bounded to standard body width to prevent ultra-wide stretching */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          {badge && <div className="mb-2 flex justify-center">{badge}</div>}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white tracking-tight leading-tight">
            {title}
          </h1>
          {description && (
            <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-normal">
              {description}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
