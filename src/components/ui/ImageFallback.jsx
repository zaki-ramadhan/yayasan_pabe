import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Fallback visual standar untuk gambar/cover/thumbnail yang kosong atau gagal dimuat.
 * Menampilkan bidang putih bersih dengan logo Yayasan PABE proporsional di tengah.
 */
export function ImageFallback({
  alt = "Logo Yayasan PABE",
  className,
  logoClassName,
}) {
  return (
    <div
      className={cn(
        "w-full h-full bg-white flex items-center justify-center p-2 select-none overflow-hidden",
        className
      )}
      aria-label={alt}
    >
      <Image
        src="/img/branding/logo-ypabe.webp"
        alt={alt}
        width={120}
        height={120}
        draggable={false}
        className={cn(
          "w-[42%] h-[42%] max-w-[104px] max-h-[104px] min-w-[24px] min-h-[24px] object-contain opacity-90 select-none pointer-events-none",
          logoClassName
        )}
      />
    </div>
  );
}

