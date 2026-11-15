"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { VolunteerPublicProfileCover } from "./VolunteerPublicProfileCover";
import { VolunteerPublicDataCard } from "./VolunteerPublicDataCard";
import { ASSET_PATHS } from "@/lib/assetConstants";
import { ORG_PROFILE } from "@/data/orgProfile";

/**
 * Halaman Verifikasi Profil Publik Relawan (Standalone Public Profile).
 *
 * Mengadopsi tata letak halaman profil pengguna:
 * - Menggunakan foto resmi yayasan sebagai banner cover.
 * - Berdiri sendiri tanpa sidebar navigasi dashboard.
 * - Menampilkan avatar tanpa tombol upload/kamera.
 * - Menampilkan nama relawan dengan ikon verified badge resmi.
 * - Menyajikan data diri dalam layout form profil namun murni teks read-only (tanpa input).
 * - Tanpa tab keamanan akun/ganti password.
 */
export function VolunteerPublicProfileView({ volunteer }) {
  return (
    <div className="min-h-screen w-full bg-slate-50/70 text-slate-900 flex flex-col justify-between">
      {/* 1. Top Navigation Bar: Logo Yayasan & Tautan Kembali */}
      <header className="w-full bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3.5 sticky top-0 z-20 shadow-2xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-950 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Beranda yayasan</span>
          </Link>

          <div className="flex items-center gap-2">
            <Image
              src={ASSET_PATHS.BRANDING.LOGO}
              alt={ORG_PROFILE.name}
              width={110}
              height={28}
              className="h-6 w-auto object-contain"
              priority
            />
          </div>
        </div>
      </header>

      {/* 2. Main Kanvas Profil Relawan Publik */}
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1">
        <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
          {/* Banner Foto Yayasan + Avatar + Nama & Verified Badge */}
          <VolunteerPublicProfileCover volunteer={volunteer} />

          {/* Susunan Data Diri Murni Teks (Identik Form Profil, Tanpa Input & Tanpa Tab Keamanan) */}
          <VolunteerPublicDataCard volunteer={volunteer} />
        </div>
      </main>

      {/* 3. Footer Bersih */}
      <footer className="w-full max-w-4xl mx-auto px-4 py-6 text-center text-xs text-slate-400 font-normal">
        <p>© {new Date().getFullYear()} {ORG_PROFILE.name}</p>
      </footer>
    </div>
  );
}

export default VolunteerPublicProfileView;

