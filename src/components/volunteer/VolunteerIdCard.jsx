"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { formatDate } from "@/lib/formatters";
import { ASSET_PATHS } from "@/lib/assetConstants";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export const CARD_BG_COLOR = "#FFFFFF";

/**
 * Skeleton loader presisi 1:1 dengan rasio CR80 (54 x 85.6 mm) untuk kedua sisi kartu.
 */
export function VolunteerIdCardSkeleton({ className = "", rounded = true }) {
  return (
    <div className={`w-full max-w-2xl mx-auto select-none ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start justify-center">
        <div className="flex flex-col items-center w-full max-w-[320px] mx-auto">
          <div className={`relative w-full aspect-[54/85.6] overflow-hidden shadow-md border border-slate-200/90 bg-white flex flex-col justify-between ${
            rounded ? "rounded-2xl" : "rounded-none"
          }`}>
            <div className="absolute left-0 right-0 top-[26%] h-[38%] bg-slate-50 z-0 animate-pulse" />

            <div className="relative z-10 w-full flex-1 flex flex-col justify-between p-4.5 pb-2">
              <div className="flex flex-col items-center w-full">
                <div className="w-10 h-2 invisible pointer-events-none select-none mx-auto" aria-hidden="true" />
                <div className="h-6 w-28 bg-slate-100 rounded mx-auto mt-3 animate-pulse" />
              </div>

              <div className="w-24 h-24 sm:w-26 sm:h-26 rounded-full ring-6 ring-white shadow-md bg-slate-100 mx-auto my-auto animate-pulse" />

              <div className="w-full text-center pb-2 -translate-y-5 sm:-translate-y-6 space-y-1.5 flex flex-col items-center">
                <div className="h-4.5 w-36 bg-slate-200/80 rounded animate-pulse" />
                <div className="h-3.5 w-24 bg-slate-100 rounded animate-pulse" />
              </div>
            </div>

            <div className="w-full h-8 bg-slate-200/80 shrink-0 animate-pulse" />
          </div>
        </div>

        <div className="flex flex-col items-center w-full max-w-[320px] mx-auto">
          <div className={`relative w-full aspect-[54/85.6] overflow-hidden shadow-md border border-[#092B21] bg-[#0D3B2E] flex flex-col justify-between p-5 ${
            rounded ? "rounded-2xl" : "rounded-none"
          }`}>
            <div className="absolute inset-0 bg-white/5 z-0 animate-pulse" />

            <div className="relative z-10 flex flex-col items-center w-full pt-0.5">
              <div className="w-10 h-2 invisible pointer-events-none select-none mx-auto" aria-hidden="true" />
              <div className="h-4 w-36 bg-white/20 rounded mx-auto mt-3 animate-pulse" />
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center my-auto space-y-3">
              <div className="w-[140px] h-[140px] rounded-xl border border-white/25 bg-white/10 animate-pulse" />
              <div className="h-3 w-44 bg-white/20 rounded animate-pulse" />
            </div>

            <div className="relative z-10 pt-3 pb-0.5 border-t border-white/20 flex justify-between items-center w-full">
              <div className="h-3 w-24 bg-white/20 rounded animate-pulse" />
              <div className="h-3 w-20 bg-white/20 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Komponen Kartu Relawan CR80 Cetak Fisik (85.6 x 54 mm).
 * Menampilkan tampak depan dan tampak belakang secara beriringan (side-by-side).
 */
export function VolunteerIdCard({
  volunteer,
  mode = "both",
  rounded = true,
  validationUrl: customValidationUrl,
  className = "",
}) {
  const { currentUser } = useCurrentUser();
  const [imgError, setImgError] = useState(false);
  const [isClientMounted, setIsClientMounted] = useState(false);

  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  const isCardOwner = Boolean(
    currentUser?.email &&
      volunteer?.email &&
      currentUser.email.trim().toLowerCase() === volunteer.email.trim().toLowerCase()
  );

  const pfp =
    volunteer?.avatarUrl ||
    volunteer?.avatar ||
    volunteer?.photoUrl ||
    (isCardOwner
      ? (currentUser?.avatar ||
         currentUser?.customAvatar ||
         currentUser?.providerAvatar ||
         currentUser?.avatarUrl ||
         currentUser?.image ||
         currentUser?.picture)
      : null) ||
    null;

  const validationUrl = useMemo(() => {
    if (customValidationUrl) return customValidationUrl;
    if (!volunteer?.id) return "";

    let origin = "";
    if (isClientMounted && typeof window !== "undefined" && window.location?.origin) {
      origin = window.location.origin;
    } else {
      origin = process.env.NEXT_PUBLIC_APP_URL || "https://payungberkah.org";
    }
    const baseUrl = origin.replace(/\/+$/, "");
    return `${baseUrl}/relawan/validasi/${volunteer.id}`;
  }, [customValidationUrl, volunteer?.id, isClientMounted]);

  const fullName =
    volunteer?.fullName ||
    (isCardOwner ? currentUser?.name : "") ||
    "Anggota Relawan";

  const { nameClass, roleClass, containerOffset } = useMemo(() => {
    const len = fullName.length;
    if (len > 30) {
      return {
        nameClass: "text-sm sm:text-[15px] leading-snug font-bold",
        roleClass: "text-[11px] sm:text-xs font-semibold text-emerald-800 tracking-wide",
        containerOffset: "-translate-y-4 sm:-translate-y-5",
      };
    }
    if (len > 20) {
      return {
        nameClass: "text-base sm:text-lg leading-snug font-semibold",
        roleClass: "text-xs sm:text-[13px] font-medium text-emerald-800",
        containerOffset: "-translate-y-4 sm:-translate-y-5",
      };
    }
    if (len > 14) {
      return {
        nameClass: "text-lg sm:text-xl leading-snug font-semibold",
        roleClass: "text-xs sm:text-sm font-medium text-emerald-800",
        containerOffset: "-translate-y-5 sm:-translate-y-6",
      };
    }
    return {
      nameClass: "text-xl sm:text-[22px] leading-snug font-semibold",
      roleClass: "text-sm sm:text-[15px] font-medium text-emerald-800",
      containerOffset: "-translate-y-6 sm:-translate-y-8",
    };
  }, [fullName.length]);

  if (!volunteer) return null;

  const userInitial = fullName.trim().charAt(0).toUpperCase() || "A";

  const joinDate = formatDate(volunteer.createdAt, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const rawInterest =
    !volunteer.interest ||
    volunteer.interest.toLowerCase().includes("relawan kebaikan") ||
    volunteer.interest.trim().toLowerCase() === "relawan" ||
    volunteer.interest.trim().toLowerCase() === "anggota"
      ? "Anggota Relawan"
      : volunteer.interest;
  const roleText = rawInterest.charAt(0).toUpperCase() + rawInterest.slice(1);

  const showFront = mode === "both" || mode === "front";
  const showBack = mode === "both" || mode === "back";

  return (
    <div className={`w-full ${mode === "both" ? "max-w-2xl mx-auto" : "max-w-[340px] sm:max-w-[360px] mx-auto"} ${className}`}>
      <div
        id="volunteer-id-card-print"
        className={`grid gap-6 items-start justify-center print:grid-cols-2 print:gap-4 print:max-w-none ${
          mode === "both" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 w-full mx-auto"
        }`}
      >
        {showFront && (
        <div className="flex flex-col items-center w-full mx-auto">
          <div
            style={{
              backgroundColor: "#FFFFFF",
              fontFamily: 'var(--font-plus-jakarta-sans), "Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
            }}
            className={`relative w-full aspect-[54/85.6] overflow-hidden shadow-md border border-slate-200/90 bg-white select-none flex flex-col justify-between ${
              rounded ? "rounded-2xl print:rounded-none" : "rounded-none"
            }`}
          >
            <div
              className="absolute left-0 right-0 top-[26%] h-[38%] z-0 pointer-events-none select-none overflow-hidden"
              aria-hidden="true"
            >
              <Image
                src={ASSET_PATHS.CARDS.PATTERN_HORIZONTAL}
                alt=""
                fill
                sizes="(max-width: 768px) 320px, 400px"
                className="object-contain object-center pointer-events-none select-none"
                priority
              />
            </div>

            <div className="relative z-10 w-full flex-1 flex flex-col justify-between p-4.5 pb-2 select-none">
              <div className="flex flex-col items-center w-full">
                <div className="w-10 h-2 invisible pointer-events-none select-none" aria-hidden="true" />

                <div className="w-full flex items-center justify-between px-2 -mt-1 select-none pointer-events-none">
                  <Image
                    src={ASSET_PATHS.CARDS.DECORATION}
                    alt=""
                    width={24}
                    height={24}
                    className="w-5.5 h-5.5 sm:w-6 sm:h-6 object-contain"
                    unoptimized
                    priority
                  />
                  <Image
                    src={ASSET_PATHS.CARDS.DECORATION}
                    alt=""
                    width={24}
                    height={24}
                    className="w-5.5 h-5.5 sm:w-6 sm:h-6 object-contain"
                    unoptimized
                    priority
                  />
                </div>

                <div className="flex items-center justify-center pt-0.5">
                  <Image
                    src={ASSET_PATHS.BRANDING.LOGO}
                    alt="Logo Yayasan Payung Berkah"
                    width={130}
                    height={36}
                    className="h-7 w-auto object-contain drop-shadow-xs"
                    priority
                  />
                </div>
              </div>

              <div className="relative mx-auto my-auto flex items-center justify-center">
                <div className="relative w-24 h-24 sm:w-26 sm:h-26 rounded-full ring-6 ring-white shadow-lg overflow-hidden bg-white flex items-center justify-center">
                  {pfp && !imgError ? (
                    <Image
                      src={pfp}
                      alt=""
                      fill
                      className="object-cover"
                      onError={() => setImgError(true)}
                      unoptimized
                      priority
                    />
                  ) : (
                    <span className="text-emerald-800 font-bold text-3xl sm:text-4xl select-none">
                      {userInitial}
                    </span>
                  )}
                </div>
              </div>

              <div
                className={`w-full text-center pb-2 px-2 ${containerOffset}`}
              >
                <h3
                  className={`${nameClass} text-slate-900 break-words`}
                >
                  {fullName}
                </h3>
                <p
                  className={`${roleClass} mt-1 truncate`}
                >
                  {roleText}
                </p>
              </div>
            </div>

            <div className="relative z-10 w-full bg-[#0D3B2E] py-2 px-3 text-center text-white text-[11px] font-medium select-none shrink-0 border-t border-emerald-900/40">
              Yayasan Payung Berkah
            </div>
          </div>
        </div>
        )}

        {showBack && (
        <div className="flex flex-col items-center w-full mx-auto">
          <div
            style={{
              fontFamily: 'var(--font-plus-jakarta-sans), "Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
            }}
            className={`relative w-full aspect-[54/85.6] overflow-hidden shadow-md border border-[#092B21] bg-[#0D3B2E] select-none flex flex-col justify-between p-5 ${
              rounded ? "rounded-2xl print:rounded-none" : "rounded-none"
            }`}
          >
            <div
              className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden opacity-[0.10] mix-blend-overlay"
              aria-hidden="true"
            >
              <Image
                src={ASSET_PATHS.CARDS.PATTERN_BACKFACE}
                alt=""
                fill
                sizes="(max-width: 768px) 320px, 400px"
                className="object-cover object-center pointer-events-none select-none"
                priority
              />
            </div>

            <div className="relative z-10 flex flex-col items-center w-full pt-0.5">
              <div className="w-10 h-2 invisible pointer-events-none select-none" aria-hidden="true" />
              <p className="mt-3 text-xs font-medium text-white">
                Kartu Resmi Relawan
              </p>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center my-auto space-y-3.5">
              <div className="p-2.5 bg-white rounded-xl shadow-md border border-white/20 flex items-center justify-center">
                <QRCodeSVG
                  value={validationUrl}
                  size={118}
                  level="M"
                  fgColor="#0D3B2E"
                  bgColor="#FFFFFF"
                  includeMargin={false}
                />
              </div>
              <p className="text-xs text-white/90 font-medium text-center tracking-wide">
                Scan untuk verifikasi resmi
              </p>
            </div>

            <div className="relative z-10 w-full pt-3 pb-0.5 border-t border-white/20 text-xs flex justify-between items-center select-none">
              <span className="text-white/80 font-medium">Terdaftar sejak:</span>
              <span className="text-white font-medium">{joinDate}</span>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

export default VolunteerIdCard;
