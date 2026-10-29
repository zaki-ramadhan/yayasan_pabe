"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

/**
 * Penampil Berkas Legalitas Murni (Mirip Tab Berkas Browser Asli).
 * - Tanpa floating bar/dock agar tampilan ultra-bersih dan bebas distraksi.
 * - Mendukung perbesaran alami melalui Browser Zoom (Ctrl + / -, pinch) & Klik Langsung (Toggle Zoom-In / Zoom-Out).
 * - Mencegah bug 'resize event resetting baseHeight' saat browser di-zoom.
 * - Mencegah bug 'flexbox scroll cutoff' saat dokumen membesar melebihi viewport.
 * - Proteksi berkas: mematikan klik kanan (context menu), drag-and-drop, Ctrl+S, dan shortcut DevTools (F12, Ctrl+Shift+I/J/C, Ctrl+U).
 *
 * @param {object} props
 * @param {object} props.currentDoc - Data dokumen aktif dari SSOT
 */
export function LegalDocumentViewer({ currentDoc }) {
  const router = useRouter();
  const [baseHeight, setBaseHeight] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const baseDprRef = useRef(1);

  useEffect(() => {
    baseDprRef.current = window.devicePixelRatio || 1;

    const calculateBaseHeight = () => {
      const docAspectRatio = 1147 / 1600;
      const fitByHeight = window.innerHeight;
      const fitByWidth = window.innerWidth / docAspectRatio;
      return Math.round(Math.min(fitByHeight, fitByWidth));
    };

    const frameId = requestAnimationFrame(() => {
      setBaseHeight(calculateBaseHeight());
    });

    const handleWindowResize = () => {
      const currentDpr = window.devicePixelRatio || 1;
      if (Math.abs(currentDpr - baseDprRef.current) < 0.01) {
        setBaseHeight(calculateBaseHeight());
      }
    };

    window.addEventListener("resize", handleWindowResize);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleDragStart = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (isZoomed) {
          setIsZoomed(false);
        } else {
          router.push("/tentang-kami");
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        return;
      }
      if (e.key === "F12") {
        e.preventDefault();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "u" || e.key === "U")) {
        e.preventDefault();
        return;
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")
      ) {
        e.preventDefault();
        return;
      }
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("dragstart", handleDragStart);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("dragstart", handleDragStart);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [router, isZoomed]);

  const toggleZoom = () => {
    setIsZoomed((prev) => !prev);
  };

  const currentHeight = baseHeight
    ? isZoomed
      ? Math.round(baseHeight * 2.25)
      : baseHeight
    : null;

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      className="fixed inset-0 w-full h-full bg-[#0e0e0e] text-white font-sans overflow-auto select-none p-0 m-0 print:hidden"
    >
      <main className="min-w-full min-h-full flex p-0 m-0">
        <div
          onClick={toggleZoom}
          className={`relative m-auto inline-flex items-center justify-center select-none ${
            isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
          }`}
          style={{
            height: currentHeight ? `${currentHeight}px` : "100vh",
            width: "auto",
          }}
        >
          <Image
            src={currentDoc.image}
            alt={currentDoc.title}
            width={1147}
            height={1600}
            priority
            unoptimized
            draggable={false}
            style={{
              height: currentHeight ? `${currentHeight}px` : "100vh",
              width: "auto",
              maxWidth: "none",
            }}
            className="object-contain rounded-none shadow-none select-none pointer-events-none"
          />

          <div
            className="absolute inset-0 z-10 select-none bg-transparent"
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            aria-hidden="true"
          />
        </div>
      </main>
    </div>
  );
}
