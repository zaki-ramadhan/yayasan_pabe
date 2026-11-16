"use client";

import { useState, useEffect, useRef } from "react";
import { AltArrowLeftIcon as ChevronLeft } from "@solar-icons/react/line-duotone/alt-arrow-left";
import { AltArrowRightIcon as ChevronRight } from "@solar-icons/react/line-duotone/alt-arrow-right";
import { VolunteerIdCard } from "./VolunteerIdCard";
import { toast } from "@/hooks/useToast";

/**
 * Penampil Kartu Relawan Mandiri (Minimalist Slide & Flip Viewer).
 * Fokus murni 100% pada kartu identitas relawan.
 *
 * Fitur:
 * - Ukuran kartu proporsional pasti (w-[290px] xs:w-[325px] sm:w-[355px]) anti-shrink/ciut.
 * - Tombol slide kiri & kanan menempel rapat langsung mengapit tepi kartu.
 * - Animasi 3D Flip yang halus saat kartu dibalik.
 * - Bersih bebas distraksi: tanpa header beranda, tanpa titik slider bawah.
 * - Navigasi interaktif: tombol panah, ketuk kartu langsung, swipe mobile, dan keyboard.
 */
export function VolunteerCardViewer({ volunteer }) {
  const [activeSide, setActiveSide] = useState("front"); // "front" | "back"
  const hasNotifiedRef = useRef(false);
  const touchStartXRef = useRef(null);
  const touchStartYRef = useRef(null);

  useEffect(() => {
    if (!hasNotifiedRef.current) {
      hasNotifiedRef.current = true;
      toast.success("Identitas resmi relawan terverifikasi.");
    }
  }, []);

  const toggleFlip = () => {
    setActiveSide((prev) => (prev === "front" ? "back" : "front"));
  };

  const handlePrev = (e) => {
    e?.stopPropagation();
    setActiveSide((prev) => (prev === "front" ? "back" : "front"));
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    setActiveSide((prev) => (prev === "front" ? "back" : "front"));
  };

  // Navigasi swipe touch di perangkat seluler
  const handleTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartXRef.current;
    const deltaY = touchEndY - touchStartYRef.current;

    // Pastikan gestur swipe horizontal lebih dominan daripada scroll vertikal
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        setActiveSide("back");
      } else {
        setActiveSide("front");
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  // Navigasi keyboard (Panah Kiri/Kanan, Space, Enter)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        setActiveSide("front");
      } else if (e.key === "ArrowRight") {
        setActiveSide("back");
      } else if (e.key === " " && document.activeElement === document.body) {
        e.preventDefault();
        toggleFlip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      className="min-h-screen w-full bg-[#0b0f17] text-white flex items-center justify-center p-3 sm:p-6 select-none overflow-hidden print:bg-white print:p-0 print:text-slate-900"
    >
      <main className="w-full max-w-xl mx-auto flex items-center justify-center gap-3 sm:gap-4.5 px-2">
        {/* Tombol Slide Kiri (Menempel di samping kiri kartu) */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Balik sisi kartu (kiri)"
          className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 shadow-lg transition-all active:scale-95 cursor-pointer shrink-0 print:hidden"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Kontainer 3D Flip Card dengan Ukuran Pasti Presisi */}
        <div
          onClick={toggleFlip}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleFlip();
            }
          }}
          aria-label="Balik sisi kartu relawan"
          className="relative w-[285px] xs:w-[325px] sm:w-[355px] aspect-[54/85.6] select-none [perspective:1200px] cursor-pointer group focus:outline-none shrink-0"
        >
          <div
            className={`relative w-full h-full aspect-[54/85.6] transition-transform duration-500 ease-in-out [transform-style:preserve-3d] ${
              activeSide === "back" ? "[transform:rotateY(180deg)]" : ""
            }`}
          >
            {/* Muka 1: Tampak Depan */}
            <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [-webkit-backface-visibility:hidden]">
              <VolunteerIdCard
                volunteer={volunteer}
                mode="front"
                className="w-full h-full max-w-none"
              />
            </div>

            {/* Muka 2: Tampak Belakang */}
            <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateY(180deg)]">
              <VolunteerIdCard
                volunteer={volunteer}
                mode="back"
                className="w-full h-full max-w-none"
              />
            </div>
          </div>
        </div>

        {/* Tombol Slide Kanan (Menempel di samping kanan kartu) */}
        <button
          type="button"
          onClick={handleNext}
          aria-label="Balik sisi kartu (kanan)"
          className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 shadow-lg transition-all active:scale-95 cursor-pointer shrink-0 print:hidden"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </main>
    </div>
  );
}

export default VolunteerCardViewer;
