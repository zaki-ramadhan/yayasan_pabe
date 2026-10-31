"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { QRCodeCanvas } from "qrcode.react";
import { RotateCw, Sparkles, AlertCircle } from "lucide-react";
import { generateVolunteerCardFront, generateVolunteerCardBack } from "@/lib/volunteerCardTexture";
import { VolunteerIdCard } from "./VolunteerIdCard";

import { ASSET_PATHS } from "@/lib/assetConstants";
import { useCurrentUser } from "@/hooks/useCurrentUser";

// Dynamic import Lanyard Three.js canvas dengan ssr: false untuk efisiensi bundle
const DynamicLanyard = dynamic(() => import("@/components/ui/3d/Lanyard"), {
  ssr: false,
  loading: () => <LanyardSkeleton />,
});

function LanyardSkeleton() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 select-none pointer-events-none">
      {/* Tali Lanyard Abu-abu Netral */}
      <div className="w-6 h-16 bg-gray-300 rounded-t-sm animate-pulse" />

      {/* Pengait Klem Abu-abu */}
      <div className="w-5 h-2.5 bg-gray-400 rounded-xs -mt-1 -mb-1.5 z-10 animate-pulse" />

      {/* Badan Kartu KTA: Skala & Proporsi S-Curve */}
      <div className="relative w-[260px] sm:w-[280px] aspect-[1/1.42] rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-md flex flex-col justify-between">
        {/* 1. Zona Atas: Area Foto Polos Abu-abu (64% Full-Bleed Tanpa Lingkaran) */}
        <div className="relative w-full h-[64%] bg-gray-200 animate-pulse overflow-hidden" />

        {/* 2. Zona Bawah: Panel Melengkung Organik (Clean White) */}
        <div className="relative w-full h-[40%] bg-white -mt-6 z-10 flex flex-col justify-between pt-3 pb-4 px-5 sm:px-6 shadow-[0_-6px_20px_rgba(0,0,0,0.06)]">
          {/* Lekukan Notch Kurva Halus SVG S-Curve */}
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

          {/* Skeleton Nama: Batang Abu-abu Rata Kiri */}
          <div className="relative -mt-2.5 text-left animate-pulse">
            <div className="h-6 w-36 sm:w-40 rounded-md bg-gray-300" />
          </div>

          {/* Skeleton Baris Informasi Bawah: Kiri Peran & Kanan ID */}
          <div className="flex items-center justify-between mt-auto pt-2 animate-pulse">
            <div className="h-3.5 w-28 sm:w-32 rounded bg-gray-200" />
            <div className="h-3.5 w-14 rounded bg-gray-200 shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function Volunteer3DLanyardCard({ volunteer, className = "", height = 540 }) {
  const { currentUser } = useCurrentUser();
  const qrRef = useRef(null);
  const [textures, setTextures] = useState({ front: "", back: "" });
  const [isReady, setIsReady] = useState(false);

  // Resolve profil foto (pfp) akun login atau profil relawan
  const pfp = volunteer?.avatarUrl || currentUser?.avatar || currentUser?.avatarUrl || currentUser?.image || currentUser?.picture || null;

  // Cek kapabilitas WebGL browser secara lazy
  const [hasWebGl] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      const canvas = document.createElement("canvas");
      return Boolean(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
    } catch {
      return false;
    }
  });

  // Payload URL validasi QR unik
  const validationUrl = useMemo(() => {
    if (!volunteer?.id) return "";
    if (typeof window !== "undefined") {
      return `${window.location.origin}/relawan/validasi/${volunteer.id}`;
    }
    return `https://payungberkah.id/relawan/validasi/${volunteer.id}`;
  }, [volunteer?.id]);

  // Generate dynamic front & back textures begitu QR canvas, pfp, dan aset logo siap
  useEffect(() => {
    if (!volunteer || !hasWebGl) return;

    let isMounted = true;

    function renderTextures(logoImg, avatarImg) {
      try {
        const qrCanvasElement = qrRef.current;
        const front = generateVolunteerCardFront({
          volunteer,
          avatarImage: avatarImg,
        });
        const back = generateVolunteerCardBack({
          volunteer,
          qrCanvas: qrCanvasElement,
          logoImage: logoImg,
        });

        if (isMounted) {
          setTextures({ front, back });
          setIsReady(true);
        }
      } catch (err) {
        console.error("Gagal membentuk tekstur 3D KTA:", err);
      }
    }

    const logoImg = new Image();
    logoImg.crossOrigin = "anonymous";
    logoImg.src = ASSET_PATHS.BRANDING.LOGO;

    let avatarImg = null;
    if (pfp) {
      avatarImg = new Image();
      avatarImg.crossOrigin = "anonymous";
      avatarImg.src = pfp;
    }

    const promises = [
      new Promise((resolve) => {
        logoImg.onload = () => resolve(logoImg);
        logoImg.onerror = () => resolve(null);
      }),
    ];

    if (avatarImg) {
      promises.push(
        new Promise((resolve) => {
          avatarImg.onload = () => resolve(avatarImg);
          avatarImg.onerror = () => resolve(null);
        })
      );
    }

    if (typeof document !== "undefined" && document.fonts?.ready) {
      promises.push(document.fonts.ready.catch(() => null));
    }

    Promise.all(promises).then(([loadedLogo, loadedAvatar]) => {
      if (isMounted) {
        renderTextures(loadedLogo, loadedAvatar || null);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [volunteer, hasWebGl, pfp]);

  if (!volunteer) return null;

  // Fallback ke kartu 2D statis jika device tidak mendukung WebGL
  if (!hasWebGl) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-800 rounded-lg text-xs border border-amber-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Perangkat tidak mendukung WebGL 3D. Menampilkan kartu tanda anggota versi standar.</span>
        </div>
        <VolunteerIdCard volunteer={volunteer} className={className} />
      </div>
    );
  }

  return (
    <div className={`relative w-full flex flex-col items-center ${className}`}>
      {/* Hidden QRCodeCanvas untuk capture piksel QR ke tekstur Three.js */}
      <div className="sr-only pointer-events-none absolute -top-9999px -left-9999px" aria-hidden="true">
        <QRCodeCanvas
          ref={qrRef}
          value={validationUrl}
          size={320}
          level="M"
          includeMargin={false}
        />
      </div>

      {/* Container Kanvas 3D Interaktif */}
      <div
        className="w-full relative rounded-2xl bg-gradient-to-b from-slate-100/80 via-slate-50 to-slate-100/60 border border-slate-200/80 shadow-inner overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ height: `${height}px` }}
      >
        {isReady && textures.front ? (
          <DynamicLanyard
            frontImage={textures.front}
            backImage={textures.back}
            cardColor="#ffffff"
            strapColor="#064e3b"
            finish="glossy"
            orientation="portrait"
            cornerRadius={0.24}
            size={0.72}
            strapLength={0.48}
            strapWidth={0.65}
            metal="silver"
            gravity={0.9}
            damping={0.48}
            elasticity={0.45}
            breeze={0.35}
            interactive={true}
            intro={true}
          />
        ) : (
          <LanyardSkeleton />
        )}
      </div>

      {/* Petunjuk Interaksi di Luar Kanvas (Tidak Menutupi Bagian Bawah Kartu) */}
      <p className="mt-2.5 text-center text-xs text-slate-500 font-medium inline-flex items-center justify-center gap-1.5 select-none">
        <RotateCw className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>Tarik untuk mengayun • Klik kartu untuk melihat QR di belakang</span>
      </p>
    </div>
  );
}

export default Volunteer3DLanyardCard;
