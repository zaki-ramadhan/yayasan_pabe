"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export function AuthVisualPanel() {
  return (
    <div className="hidden lg:block h-[100dvh] max-h-screen sticky top-0 p-2 overflow-hidden">
      <div className="h-full w-full rounded-3xl relative overflow-hidden flex flex-col justify-end items-center text-center p-6 sm:p-8 lg:p-10 pb-5 lg:pb-6 shadow-2xl border border-slate-800/80 bg-slate-950">
        {/* Top-Left Icon-Only Back to Home Button */}
        <div className="absolute top-5 left-5 lg:top-6 lg:left-6 z-20">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-900/50 hover:bg-slate-900/80 text-white/90 hover:text-white border border-white/20 backdrop-blur-md transition-all shadow-md group cursor-pointer"
            aria-label="Kembali ke Beranda"
            title="Kembali ke Beranda"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          </Link>
        </div>
        {/* Base Photographic Background Image */}
        <Image
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1600&auto=format&fit=crop&q=80"
          alt="Kegiatan Sosial Yayasan PABE"
          fill
          sizes="(max-width: 1200px) 50vw, 40vw"
          className="object-cover object-center brightness-[0.45] contrast-[1.05] saturate-60"
          priority
        />

        {/* Artistic Texture Overlay 2 */}
        <div className="absolute inset-0 mix-blend-overlay opacity-45 pointer-events-none">
          <Image
            src="/img/texture_overlay_2.jpeg"
            alt="Texture Overlay"
            fill
            sizes="(max-width: 1200px) 50vw, 40vw"
            className="object-cover object-center"
          />
        </div>

        {/* Gradient Layer for Text Legibility & Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-900/30 pointer-events-none" />

        {/* Ambient Glow Accents */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />

        {/* Bottom Aligned Content Group */}
        <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center">
          {/* Inviting Action Headline & Subheading */}
          <div className="space-y-3 text-center">
            <h1 className="text-2xl sm:text-3xl xl:text-4xl font-medium text-white tracking-tight leading-snug">
              Mari Melangkah Bersama, Wujudkan Kebaikan Nyata
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto font-normal">
              Satu langkah kepedulian Anda menghadirkan masa depan yang lebih mandiri dan penuh harapan bagi santri, yatim, dan dhuafa.
            </p>
          </div>

          {/* Generous Spacing Before Copyright */}
          <div className="mt-10 sm:mt-12 lg:mt-14 xl:mt-16 text-center">
            <p className="text-[11px] sm:text-xs text-slate-400 font-normal">
              © {new Date().getFullYear()} Yayasan PABE
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
