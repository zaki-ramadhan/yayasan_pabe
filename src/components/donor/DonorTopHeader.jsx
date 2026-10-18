"use client";

import Link from "next/link";
import { Bell, Home, HeartHandshake } from "lucide-react";

export function DonorTopHeader({ currentUser }) {
  const firstName = currentUser?.name ? currentUser.name.split(" ")[0] : "Donatur";

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Greeting */}
      <div>
        <span className="text-base sm:text-lg font-medium text-slate-950 leading-tight block">
          Halo, {firstName}
        </span>
      </div>

      {/* Right: Quick Website Shortcuts & Notification Bell */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition-colors shadow-2xs"
          title="Kembali ke Beranda Utama Yayasan PABE"
        >
          <Home className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Ke Website Utama</span>
        </Link>

        <Link
          href="/program"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition-colors shadow-2xs"
          title="Katalog Program Donasi"
        >
          <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">Donasi Program</span>
        </Link>

        <Link
          href="/donatur/riwayat"
          className="relative p-2 rounded-md border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          title="Notifikasi Penyaluran"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white" />
        </Link>
      </div>
    </header>
  );
}
