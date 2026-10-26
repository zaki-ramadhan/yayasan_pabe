"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export function AuthMobileHeader() {
  return (
    <div className="flex items-center justify-between w-full max-w-md mx-auto lg:hidden mb-6">
      <Link href="/" className="flex items-center gap-2">
        <div className="relative w-8 h-8 rounded-lg bg-white p-0.5 shadow-xs shrink-0 flex items-center justify-center overflow-hidden border border-slate-200">
          <Image
            src="/img/branding/logo-ypabe.webp"
            alt="Logo Yayasan PABE"
            fill
            sizes="32px"
            className="object-contain"
          />
        </div>
        <span className="font-medium text-sm text-slate-900">
          Yayasan PABE
        </span>
      </Link>

      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-950 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Kembali ke Beranda</span>
      </Link>
    </div>
  );
}
