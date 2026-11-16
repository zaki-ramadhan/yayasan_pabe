"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRightUpIcon as ArrowUpRight } from "@solar-icons/react/line-duotone/arrow-right-up";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Skeleton loader yang proporsional untuk VolunteerPendingCard.
 */
export function VolunteerPendingSkeleton({ className = "", showViewCardButton = true }) {
  const pathname = usePathname();
  const isAlreadyOnCardPage = pathname === "/donatur/relawan" || pathname?.startsWith("/donatur/relawan");
  const shouldShowViewCard = showViewCardButton && !isAlreadyOnCardPage;

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-5 sm:p-6 shadow-md animate-pulse ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="space-y-2.5 w-full max-w-xl">
          <Skeleton className="h-3 w-36 bg-slate-800 rounded" />
          <Skeleton className="h-5 sm:h-6 w-64 bg-slate-800 rounded" />
          <Skeleton className="h-4 w-80 max-w-full bg-slate-800/80 rounded" />
          {shouldShowViewCard && <Skeleton className="h-3.5 w-36 bg-slate-800/60 rounded pt-1" />}
        </div>
        <Skeleton className="h-9 w-36 bg-slate-800 rounded-md shrink-0 self-start sm:self-auto" />
      </div>
    </div>
  );
}

/**
 * Komponen status kartu pendaftaran relawan yang sedang dalam proses verifikasi (PENDING).
 * Menggunakan format ads banner yang simpel, bersih, dan konsisten dengan banner yayasan.
 */
export function VolunteerPendingCard({
  volunteer,
  onCancelClick,
  showViewCardButton = true,
  viewCardHref = "/donatur/relawan",
  className = "",
}) {
  const pathname = usePathname();
  if (!volunteer) return null;

  const isAlreadyOnCardPage = pathname === "/donatur/relawan" || pathname?.startsWith("/donatur/relawan");
  const shouldShowViewCard = showViewCardButton && !isAlreadyOnCardPage;

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950 text-white p-5 sm:p-6 shadow-md ${className}`}
    >
      {/* Atmospheric Background Image & Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        <Image
          src="/img/banners/covers/volunteer-cover.webp"
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 800px"
          className="object-cover opacity-30 pointer-events-none select-none"
          draggable={false}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(180,83,9,0.45)_0%,_rgba(15,23,42,0.85)_55%,_rgba(2,6,23,0.96)_100%)]" />
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        {/* Konten Kiri: Status, Judul, Penjelasan, & Teks Link Buka/Periksa Kartu */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-amber-400">
            Status: Menunggu Persetujuan
          </div>
          <h3 className="font-semibold text-white text-base sm:text-lg">
            Pendaftaran Anda Sedang Diperiksa
          </h3>
          <p className="text-xs sm:text-sm text-slate-200 max-w-xl font-normal leading-relaxed">
            Berkas pendaftaran Anda sudah kami terima dan sedang diproses.
          </p>

          {shouldShowViewCard && (
            <div className="pt-0.5">
              <Link
                href={viewCardHref}
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-normal text-slate-200 hover:text-white hover:underline transition-colors"
              >
                <span>Lihat kartu relawan</span>
                <ArrowUpRight className="w-4 h-4 text-slate-300" />
              </Link>
            </div>
          )}
        </div>

        {/* Konten Kanan: Tombol Batalkan Berlatar Merah (Gaya CTA) */}
        {onCancelClick && (
          <Button
            type="button"
            onClick={onCancelClick}
            className="relative inline-flex items-center justify-center h-9 px-3.5 text-xs sm:text-sm font-medium rounded-md bg-rose-700 hover:bg-rose-600 text-white border-t border-white/25 shadow-[0_3px_0_0_#881337] active:shadow-[0_1px_0_0_#881337] active:translate-y-[2px] transition-all cursor-pointer shrink-0 whitespace-nowrap self-start sm:self-auto select-none"
          >
            Batalkan pendaftaran
          </Button>
        )}
      </div>
    </div>
  );
}

export default VolunteerPendingCard;
