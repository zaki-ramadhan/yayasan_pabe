"use client";

import { useState } from "react";
import Image from "next/image";
import { DownloadIcon as Download } from "@solar-icons/react/line-duotone/download";
import { Logout2Icon as LogOut } from "@solar-icons/react/line-duotone/logout-2";
import { VolunteerIdCard } from "./VolunteerIdCard";
import { Button } from "@/components/ui/Button";
import { ShareDropdown } from "@/components/shared/ShareDropdown";
import { downloadVolunteerCardImage } from "@/lib/ktaDownloadHelper";

/**
 * Komponen sub-widget untuk relawan aktif yang telah disetujui (APPROVED).
 * Menggunakan format banner atmosferik yang selaras dengan status pendaftaran (VolunteerPendingCard),
 * menyajikan kartu relawan 2 sisi (CR80), aksi unduh kartu & bagikan tautan, serta tautan validasi dan pengunduran diri.
 */
export function VolunteerApprovedCard({
  volunteer,
  onResignClick,
  className = "",
}) {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!volunteer) return null;

  const handleDownloadImage = async () => {
    if (!volunteer) return;
    setIsDownloading(true);
    try {
      await downloadVolunteerCardImage("volunteer-approved-card-export", {
        volunteerName: volunteer.fullName,
        volunteerId: volunteer.volunteerId,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Banner Identitas Relawan Aktif (Atmosferik Senada dengan VolunteerPendingCard) */}
      <div className="relative w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950 text-white p-5 sm:p-6 shadow-md print:hidden">
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
              Relawan Resmi Terverifikasi
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 max-w-xl font-normal leading-relaxed">
              Anda telah terdaftar sebagai relawan resmi Yayasan Payung Berkah.
            </p>
          </div>

          {/* Konten Kanan: Aksi Bagikan Tautan & Unduh Kartu */}
          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
            <ShareDropdown
              url={`/relawan/validasi/${volunteer.id}`}
              title={`Mandat Resmi Relawan: ${volunteer.fullName}`}
              description={`Verifikasi keabsahan identitas dan mandat tugas relawan resmi Yayasan Payung Berkah atas nama ${volunteer.fullName}.`}
              customCta="Cek dan verifikasi keabsahan kartu relawan resmi melalui tautan:"
              variant="button"
              align="end"
              className="h-9 px-3.5 text-xs sm:text-sm font-medium rounded-md bg-white/10 hover:bg-white/15 text-white border-white/20 hover:border-white/30 backdrop-blur-xs cursor-pointer"
            />
            <Button
              type="button"
              onClick={handleDownloadImage}
              disabled={isDownloading}
              isLoading={isDownloading}
              loadingText="Mengunduh..."
              className="relative inline-flex items-center justify-center h-9 px-3.5 text-xs sm:text-sm font-medium rounded-md bg-emerald-700 hover:bg-emerald-600 text-white border-t border-white/25 shadow-[0_3px_0_0_#064e3b] active:shadow-[0_1px_0_0_#064e3b] active:translate-y-[2px] transition-all cursor-pointer shrink-0 whitespace-nowrap select-none gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Unduh kartu</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Node Render Khusus Unduh Kartu (Kotak Rapi Tanpa Sudut Melengkung) */}
      <div
        id="volunteer-approved-card-export"
        className="fixed -left-[9999px] top-0 pointer-events-none p-6 bg-transparent"
        aria-hidden="true"
      >
        <VolunteerIdCard volunteer={volunteer} mode="both" rounded={false} />
      </div>

      {/* Visualisasi Kartu Relawan 2 Sisi (CR80) */}
      <div className="py-2 p-2 bg-transparent">
        <VolunteerIdCard volunteer={volunteer} />
      </div>

      {/* Opsi Pengunduran Diri */}
      {onResignClick && (
        <div className="flex items-center justify-end pt-2 border-t border-slate-100 text-xs print:hidden">
          <button
            type="button"
            onClick={onResignClick}
            className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-700 hover:underline font-medium cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Berhenti menjadi relawan</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default VolunteerApprovedCard;
