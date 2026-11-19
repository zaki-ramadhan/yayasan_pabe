"use client";

import { useState } from "react";
import Image from "next/image";
import { formatDate, getInitials } from "@/lib/formatters";
import { ASSET_PATHS } from "@/lib/assetConstants";
import { resolveUserAvatar } from "@/lib/userParser";

/**
 * Cover Banner & Identitas Profil Publik Relawan.
 * Menampilkan foto resmi yayasan sebagai banner, satu ikon verified solid di samping nama,
 * serta email dan tanggal bergabung di bawah nama (persis profil pengguna, tanpa ID di bawah nama).
 */
export function VolunteerPublicProfileCover({ volunteer }) {
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  const fullName = volunteer?.fullName || "Relawan Terdaftar";
  const initials = getInitials(fullName);
  const avatarSrc = resolveUserAvatar(volunteer);
  const displayEmail = volunteer?.maskedEmail || volunteer?.email;
  const bannerSrc =
    ASSET_PATHS.BANNERS.VOLUNTEER_COVER ||
    ASSET_PATHS.BANNERS.HERO_SLIDE_1 ||
    "/img/banners/covers/volunteer-cover.webp";

  return (
    <div className="relative w-full">
      <div className="h-36 sm:h-48 md:h-56 w-full relative overflow-hidden select-none bg-slate-800">
        <Image
          src={bannerSrc}
          alt="Kegiatan Yayasan Payung Berkah"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 800px"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
      </div>

      <div className="px-4 sm:px-6 md:px-8 pb-5 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
          <div className="relative shrink-0 -mt-12 sm:-mt-14 z-10 self-center sm:self-auto">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white bg-slate-100 shadow-md overflow-hidden flex items-center justify-center">
              {avatarSrc && !avatarLoadError ? (
                <Image
                  src={avatarSrc}
                  alt={fullName}
                  fill
                  sizes="(max-width: 640px) 96px, 112px"
                  unoptimized={
                    typeof avatarSrc === "string" &&
                    !avatarSrc.startsWith("/") &&
                    !avatarSrc.includes("unsplash.com") &&
                    !avatarSrc.includes("lh3.googleusercontent.com")
                  }
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={() => setAvatarLoadError(true)}
                  priority
                />
              ) : null}
              <div
                className={`avatar-fallback ${
                  avatarSrc && !avatarLoadError ? "hidden" : "flex"
                } w-full h-full bg-slate-200 text-slate-700 font-semibold text-2xl sm:text-3xl items-center justify-center select-none`}
              >
                {initials}
              </div>
            </div>
          </div>

          <div className="text-center sm:text-left space-y-1.5 pt-3 sm:pt-4.5 flex-1 min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-1.5">
              <h1 className="text-lg sm:text-xl font-medium text-slate-950 tracking-tight truncate">
                {fullName}
              </h1>

              <svg
                className="w-5 h-5 text-emerald-600 shrink-0 inline-block drop-shadow-2xs"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Terverifikasi"
              >
                <path
                  d="M10.584 2.378a2 2 0 0 1 2.832 0l1.246 1.246a2 2 0 0 0 1.414.586h1.763a2 2 0 0 1 2 2v1.763a2 2 0 0 0 .586 1.414l1.246 1.246a2 2 0 0 1 0 2.832l-1.246 1.246a2 2 0 0 0-.586 1.414v1.763a2 2 0 0 1-2 2h-1.763a2 2 0 0 0-1.414.586l-1.246 1.246a2 2 0 0 1-2.832 0l-1.246-1.246a2 2 0 0 0-1.414-.586H7.83a2 2 0 0 1-2-2v-1.763a2 2 0 0 0-.586-1.414L3.998 13.41a2 2 0 0 1 0-2.832l1.246-1.246a2 2 0 0 0 .586-1.414V6.155a2 2 0 0 1 2-2h1.763a2 2 0 0 0 1.414-.586l1.246-1.246Z"
                  fill="currentColor"
                />
                <path
                  d="m9 12 2 2 4-4"
                  stroke="#ffffff"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {displayEmail && (
              <p className="text-sm font-normal text-slate-500 truncate">
                {displayEmail}
              </p>
            )}

            <p className="text-sm font-normal text-slate-500">
              Bergabung {formatDate(volunteer?.createdAt, { month: "long" })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VolunteerPublicProfileCover;
