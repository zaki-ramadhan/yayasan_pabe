"use client";

import Image from "next/image";

/**
 * BankCardShowcase
 * Komponen mandiri untuk menampilkan visual kartu rekening 3D
 * di dalam backdrop trapesium membulat dengan proteksi interaksi mouse.
 */
export function BankCardShowcase() {
  return (
    <>
      {/* SVG Defs for True Rounded Trapezoid Clip Path */}
      <svg
        width="0"
        height="0"
        className="absolute pointer-events-none opacity-0"
        aria-hidden="true"
      >
        <defs>
          <clipPath id="rounded-trapezoid-clip" clipPathUnits="objectBoundingBox">
            <path d="M 0.04,0 L 0.96,0 Q 1,0 0.995,0.045 L 0.91,0.955 Q 0.90,1 0.86,1 L 0.04,1 Q 0,1 0,0.96 L 0,0.04 Q 0,0 0.04,0 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Card Showcase Wrapper */}
      <div
        className="hidden md:flex md:col-span-6 relative w-full h-72 sm:h-80 md:h-[340px] items-center justify-center select-none"
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Rounded Trapezoid Backdrop Container (Menyatu tanpa border & inset shadow) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ clipPath: "url(#rounded-trapezoid-clip)" }}
        >
          <Image
            src="/img/bank account decoration.jpeg"
            alt="Dekorasi Background Rekening"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-center pointer-events-none select-none"
            draggable={false}
          />
        </div>

        {/* Image Asset Layer (Pop-out 3D proporsional, proteksi klik kanan & drag) */}
        <div className="relative z-10 w-full h-full flex items-center justify-center overflow-visible pointer-events-none select-none">
          <Image
            src="/img/bank_account_cards_new.png"
            alt="Kartu Rekening Resmi Yayasan PABE BRI dan Mandiri"
            fill
            className="object-contain drop-shadow-2xl md:rotate-[-12deg] md:scale-[1.4] md:translate-x-24 md:translate-y-4 transition-transform select-none"
            sizes="(max-width: 768px) 100vw, 50vw"
            draggable={false}
            priority
          />
        </div>
      </div>
    </>
  );
}
