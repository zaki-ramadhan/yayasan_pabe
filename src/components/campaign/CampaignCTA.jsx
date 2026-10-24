"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { isCampaignClosed } from "@/lib/formatters";

function subscribeAuth(callback) {
  window.addEventListener("pabe_auth_change", callback);
  window.addEventListener("ygsm_auth_change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("pabe_auth_change", callback);
    window.removeEventListener("ygsm_auth_change", callback);
    window.removeEventListener("storage", callback);
  };
}

function getAuthSnapshot() {
  return localStorage.getItem("pabe_auth_user") || localStorage.getItem("ygsm_auth_user");
}

function getAuthServerSnapshot() {
  return null;
}

export function CampaignCTA({
  campaign,
  title,
  description,
  buttonText,
  buttonHref,
  ignoreAuthCheck = false,
  className = "",
  variant = "blue",
}) {
  const userJson = useSyncExternalStore(subscribeAuth, getAuthSnapshot, getAuthServerSnapshot);

  let isLoggedIn = false;
  try {
    if (userJson) {
      const user = JSON.parse(userJson);
      isLoggedIn = Boolean(user && user.id);
    }
  } catch {
    isLoggedIn = false;
  }

  // Jika di halaman detail program publik: sembunyikan jika program tutup atau user sudah login
  if (!ignoreAuthCheck && campaign && (isCampaignClosed(campaign) || isLoggedIn)) {
    return null;
  }

  const effectiveTitle = title || "Salurkan Sedekah & Doa Terbaik Anda";
  const effectiveDescription =
    description ||
    "Satu sedekah tulus Anda menghadirkan senyuman dan harapan bagi saudara yang membutuhkan.";
  const effectiveButtonText = buttonText || "Ikut Berdonasi Sekarang";
  const effectiveHref =
    buttonHref || (campaign?.slug ? `/campaign/${campaign.slug}/donate` : "/program");
  const effectiveBannerUrl =
    campaign?.bannerUrl ||
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80";

  return (
    <div
      className={`relative w-full overflow-hidden rounded-md border border-slate-700/70 bg-slate-950 text-white p-5 sm:p-6 shadow-md ${
        className || "mt-6"
      }`}
    >
      {/* Atmospheric Background image + radial gradient overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {effectiveBannerUrl && (
          <Image
            src={effectiveBannerUrl}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover opacity-40"
          />
        )}
        <div
          className={
            variant === "emerald"
              ? "absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(5,150,105,0.45)_0%,_rgba(15,23,42,0.75)_55%,_rgba(2,6,23,0.92)_100%)]"
              : "absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(29,78,216,0.5)_0%,_rgba(15,23,42,0.75)_55%,_rgba(2,6,23,0.92)_100%)]"
          }
        />
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-medium text-white text-base sm:text-lg">
            {effectiveTitle}
          </h3>
          <p className="text-xs sm:text-sm text-slate-200 max-w-xl font-normal leading-relaxed">
            {effectiveDescription}
          </p>
        </div>

        <Link
          href={effectiveHref}
          className={
            variant === "emerald"
              ? "relative inline-flex items-center justify-center px-4 sm:px-4.5 py-2.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm border-t border-white/25 shadow-[0_3.5px_0_0_#065f46] active:shadow-[0_1px_0_0_#065f46] active:translate-y-[2.5px] transition-all cursor-pointer shrink-0 whitespace-nowrap self-start sm:self-auto select-none"
              : "relative inline-flex items-center justify-center px-4 sm:px-4.5 py-2.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs sm:text-sm border-t border-white/25 shadow-[0_3.5px_0_0_#1e3a8a] active:shadow-[0_1px_0_0_#1e3a8a] active:translate-y-[2.5px] transition-all cursor-pointer shrink-0 whitespace-nowrap self-start sm:self-auto select-none"
          }
        >
          {effectiveButtonText}
        </Link>
      </div>
    </div>
  );
}
