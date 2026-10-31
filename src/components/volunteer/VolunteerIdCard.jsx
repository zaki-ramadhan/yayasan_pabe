"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { RotateCw } from "lucide-react";
import { formatDate } from "@/lib/formatters";
import { formatVolunteerId, formatVolunteerBadgeName } from "@/lib/volunteerUtils";
import { ASSET_PATHS } from "@/lib/assetConstants";
import { useCurrentUser } from "@/hooks/useCurrentUser";

/**
 * Komponen potret studio netral elegan jika relawan belum memiliki foto profil
 */
function StudioPortraitFallback() {
  return (
    <div className="w-full h-full bg-gradient-to-b from-slate-800 via-slate-900 to-[#022c22] flex flex-col items-center justify-end relative overflow-hidden select-none">
      <svg
        viewBox="0 0 200 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full max-h-[95%] object-contain mt-auto"
        aria-label="Ilustrasi Relawan"
      >
        {/* Torso & Pakaian Turtleneck Putih Bersih */}
        <path
          d="M15 240 C20 185 55 160 100 160 C145 160 180 185 185 240 Z"
          fill="#f8fafc"
        />
        {/* Garis Lipatan Kerah Turtleneck */}
        <path
          d="M80 170 H120"
          stroke="#cbd5e1"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Leher */}
        <rect x="85" y="125" width="30" height="40" fill="#e2e8f0" rx="4" />
        {/* Kepala Potret */}
        <circle cx="100" cy="95" r="38" fill="#e2e8f0" />
        {/* Gaya Rambut Modern Rapi */}
        <path
          d="M62 88 C62 58 76 46 100 46 C124 46 138 58 138 88 C138 88 132 70 118 68 C105 66 95 72 88 68 C77 66 62 88 62 88 Z"
          fill="#0f172a"
        />
      </svg>
    </div>
  );
}

export function VolunteerIdCard({ volunteer, className = "" }) {
  const { currentUser } = useCurrentUser();
  const [side, setSide] = useState("front"); // "front" | "back"

  // Resolve profil foto (pfp) akun login atau profil relawan
  const pfp =
    volunteer?.avatarUrl ||
    currentUser?.avatar ||
    currentUser?.avatarUrl ||
    currentUser?.image ||
    currentUser?.picture ||
    null;

  // Construct absolute validation URL untuk QR code
  const validationUrl = useMemo(() => {
    if (!volunteer?.id) return "";
    if (typeof window !== "undefined") {
      return `${window.location.origin}/relawan/validasi/${volunteer.id}`;
    }
    return `https://payungberkah.id/relawan/validasi/${volunteer.id}`;
  }, [volunteer?.id]);

  if (!volunteer) return null;

  const joinDate = formatDate(volunteer.createdAt, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const regId = volunteer.volunteerId || formatVolunteerId(volunteer.id, volunteer.createdAt);
  const badgeName = formatVolunteerBadgeName(volunteer.fullName, 12);

  return (
    <div className={`flex flex-col items-center w-full max-w-[340px] mx-auto ${className}`}>
      {/* Kontrol Sisi Kartu (Depan / Belakang) */}
      <div className="inline-flex items-center gap-1.5 p-1 mb-3 rounded-xl bg-slate-100 border border-slate-200/80 shadow-2xs print:hidden">
        <button
          type="button"
          onClick={() => setSide("front")}
          className={`px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
            side === "front"
              ? "bg-white text-slate-900 shadow-xs border border-slate-200/60"
              : "text-slate-600 hover:text-slate-900"
          }`}
          aria-pressed={side === "front"}
        >
          Tampak depan
        </button>
        <button
          type="button"
          onClick={() => setSide("back")}
          className={`px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
            side === "back"
              ? "bg-white text-slate-900 shadow-xs border border-slate-200/60"
              : "text-slate-600 hover:text-slate-900"
          }`}
          aria-pressed={side === "back"}
        >
          Tampak belakang (QR code)
        </button>
      </div>

      {/* Container Kartu Cetak */}
      <div
        id="volunteer-id-card-print"
        onClick={() => setSide((prev) => (prev === "front" ? "back" : "front"))}
        style={{ fontFamily: 'var(--font-plus-jakarta-sans), "Plus Jakarta Sans", system-ui, -apple-system, sans-serif' }}
        className="group relative w-full aspect-[1/1.42] rounded-2xl overflow-hidden shadow-xl border border-slate-200/80 select-none cursor-pointer transition-transform duration-300 hover:shadow-2xl"
        title="Klik kartu untuk membalik"
      >
        {/* Tombol Flip Mengambang (Pojok Kanan Atas) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSide((prev) => (prev === "front" ? "back" : "front"));
          }}
          className="absolute top-3 right-3 z-30 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/70 hover:bg-slate-900/90 text-white text-[11px] font-medium backdrop-blur-md shadow-md border border-white/15 transition-colors cursor-pointer print:hidden"
          aria-label="Balik kartu"
        >
          <RotateCw className="w-3 h-3 text-emerald-400 transition-transform group-hover:rotate-45" />
          <span>Balik</span>
        </button>

        {side === "front" ? (
          /* ==================== TAMPAK DEPAN (DESAIN BERUNDAK ASIMETRIS / ALEXANDER BETONOV) ==================== */
          <div className="relative w-full h-full flex flex-col justify-between bg-slate-950 overflow-hidden">
            {/* 1. Zona Atas: Foto Relawan Full-Bleed (PFP Akun Login / Fallback Studio) */}
            <div className="relative w-full h-[64%] overflow-hidden bg-slate-900">
              {pfp ? (
                <Image
                  src={pfp}
                  alt={volunteer.fullName}
                  fill
                  className="object-cover object-top"
                  unoptimized
                  priority
                />
              ) : (
                <StudioPortraitFallback />
              )}
            </div>

            {/* 2. Zona Bawah: Panel Melengkung Organik Sesuai Referensi (Clean White) */}
            <div className="relative w-full h-[40%] bg-white -mt-6 z-10 flex flex-col justify-between pt-3 pb-5 px-6 shadow-[0_-6px_20px_rgba(0,0,0,0.06)]">
              {/* Lekukan Notch Kurva Halus SVG */}
              <svg
                viewBox="0 0 340 36"
                fill="none"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute -top-[35px] left-0 w-full h-[36px] text-white pointer-events-none"
                aria-hidden="true"
              >
                <path
                  d="M0 0 L185 0 C210 0 220 28 250 28 L340 28 L340 36 L0 36 Z"
                  fill="currentColor"
                />
              </svg>

              {/* Teks Nama: Biasa (Tanpa Box), Rata Kiri, Semibold, Hitam Pekat */}
              <div className="relative -mt-3 pr-4 text-left">
                <p
                  className={`${
                    badgeName.line2
                      ? "text-[21px] sm:text-[23px] leading-[1.14]"
                      : "text-[26px] sm:text-[28px] leading-tight"
                  } font-semibold text-black tracking-tight`}
                >
                  {badgeName.line1}
                </p>
                {badgeName.line2 && (
                  <p className="text-[21px] sm:text-[23px] font-semibold text-black tracking-tight leading-[1.14] mt-0.5">
                    {badgeName.line2}
                  </p>
                )}
              </div>

              {/* Baris Informasi Bawah: Teks Hitam Pekat Minimalis Sesuai Referensi */}
              <div className="flex items-center justify-between text-xs sm:text-[12px] font-medium text-black mt-auto pt-2">
                <span className="tracking-tight font-medium">
                  Relawan Kebaikan
                </span>
                <span className="tracking-tight shrink-0 font-medium">
                  ID {regId}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* ==================== TAMPAK BELAKANG (QR CODE VERIFIKASI RESMI) ==================== */
          <div className="relative w-full h-full bg-gradient-to-b from-slate-900 via-slate-950 to-emerald-950 p-6 flex flex-col justify-between text-white border border-emerald-500/25">
            {/* Header: Logo Yayasan & Label KTA */}
            <div className="text-center space-y-1 pt-1">
              <div className="flex justify-center">
                <Image
                  src={ASSET_PATHS.BRANDING.LOGO}
                  alt="Logo Yayasan"
                  width={130}
                  height={38}
                  className="h-7 sm:h-8 w-auto object-contain brightness-0 invert"
                />
              </div>
              <p className="text-[10px] font-semibold text-emerald-300 tracking-[0.2em] uppercase pt-1">
                Kartu Tanda Anggota Resmi
              </p>
              <div className="w-20 h-0.5 bg-amber-400/40 mx-auto rounded-full mt-1.5" />
            </div>

            {/* Tengah: Kotak QR Code Besar untuk Scan Lapangan */}
            <div className="flex flex-col items-center justify-center my-auto space-y-2.5">
              <div className="p-3 bg-white rounded-2xl shadow-xl border border-white/20">
                <QRCodeSVG
                  value={validationUrl}
                  size={135}
                  level="M"
                  includeMargin={false}
                />
              </div>
              <p className="text-[11px] text-slate-300 text-center font-medium">
                Pindai untuk verifikasi keaslian anggota
              </p>
            </div>

            {/* Info Tanggal & Legalitas SK Kemenkumham RI */}
            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Tgl terdaftar</span>
                <span className="text-white font-medium">{joinDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Masa berlaku</span>
                <span className="text-emerald-400 font-medium">Aktif (1 Tahun)</span>
              </div>
              <div className="text-[10px] text-slate-400 text-center pt-2 border-t border-slate-800/80 font-normal">
                SK Kemenkumham RI: AHU-0012345.AH.01.04.Tahun 2023
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VolunteerIdCard;
