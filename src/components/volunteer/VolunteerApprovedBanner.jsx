"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

/**
 * Komponen banner atmosferik untuk pengguna yang telah terdaftar sebagai relawan resmi.
 * Digunakan pada halaman pendaftaran relawan (/relawan) untuk menginformasikan status
 * keanggotaan dan mengarahkan langsung ke halaman kartu relawan di panel donatur tanpa menampilkan ID Card.
 */
export function VolunteerApprovedBanner({
  volunteer,
  viewCardHref = "/donatur/relawan",
  className = "",
}) {
  if (!volunteer) return null;

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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(5,150,105,0.45)_0%,_rgba(15,23,42,0.85)_55%,_rgba(2,6,23,0.96)_100%)]" />
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        {/* Konten Kiri: Status, Judul & Penjelasan */}
        <div className="space-y-1.5">
          <div className="text-xs font-medium text-emerald-400">
            Status: Relawan Aktif
          </div>
          <h3 className="font-semibold text-white text-base sm:text-lg">
            Selamat, Anda Relawan Resmi
          </h3>
          <p className="text-xs sm:text-sm text-slate-200 max-w-xl font-normal leading-relaxed">
            Anda telah terdaftar dan terverifikasi secara resmi sebagai relawan Yayasan Payung Berkah. Kartu identitas relawan dapat diakses melalui panel donatur.
          </p>
        </div>

        {/* Konten Kanan: Tombol Tunggal ke Halaman Kartu Relawan (Teks Murni Tanpa Ikon) */}
        <div className="shrink-0 self-start sm:self-auto">
          <Button
            asChild
            className="relative inline-flex items-center justify-center h-9 px-4 text-xs sm:text-sm font-medium rounded-md bg-emerald-700 hover:bg-emerald-600 text-white border-t border-white/25 shadow-[0_3px_0_0_#064e3b] active:shadow-[0_1px_0_0_#064e3b] active:translate-y-[2px] transition-all cursor-pointer whitespace-nowrap select-none"
          >
            <Link href={viewCardHref}>
              Lihat kartu relawan
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default VolunteerApprovedBanner;

