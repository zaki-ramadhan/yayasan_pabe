/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DonorMobileHeader({ currentUser, isOpen, onToggle }) {
  const displayName = currentUser?.name || "Pengguna";

  return (
    <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggle}
          aria-label={isOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
          className="h-9 w-9 p-0 rounded-md border-slate-200 text-slate-700 hover:bg-slate-100"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>

        <Link href="/" className="flex items-center gap-2" title="Kembali ke Beranda Utama Yayasan PABE">
          <div className="relative w-8 h-8 rounded-md overflow-hidden bg-white shrink-0 p-0.5 border border-slate-200 flex items-center justify-center">
            <Image
              src="/logo_yayasan_GSM.png"
              alt="Logo Yayasan PABE"
              width={32}
              height={32}
              className="w-full h-full object-contain rounded-xs"
            />
          </div>
          <div>
            <span className="font-medium text-sm block text-slate-950 leading-tight">
              Yayasan PABE
            </span>
            <span className="text-xs font-normal text-slate-500 block">
              Beranda Utama
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/"
          title="Ke Beranda Utama"
          className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-colors"
        >
          <Home className="w-4 h-4" />
        </Link>

        {currentUser && (
          <Link
            href="/donatur/profil"
            title={displayName}
            className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center hover:ring-2 hover:ring-primary/20 transition-all"
          >
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={displayName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="font-medium text-sm text-slate-700">
                {currentUser.initials || "U"}
              </span>
            )}
          </Link>
        )}
      </div>
    </header>
  );
}
