"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera, MapPin, Phone } from "lucide-react";
import { formatDate, getInitials } from "@/lib/formatters";
import { DonorProfileBannerCanvas } from "@/components/donor/DonorProfileBannerCanvas";
import { DonorAvatarDialog } from "@/components/donor/DonorAvatarDialog";

export function DonorProfileCover({
  profile,
  onUpdateImage,
  isUpdating = false,
  children,
}) {
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  const displayName = profile?.name || "Pengguna";
  const initials = getInitials(profile?.name, profile?.email);


  return (
    <div className="rounded-md border border-slate-200/90 bg-sidebar overflow-hidden shadow-2xs">
      <DonorProfileBannerCanvas seed={profile?.email || profile?.id || profile?.name} />

      <div className="px-4 sm:px-6 md:px-8 pb-6 bg-sidebar">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6">
            <div className="relative group shrink-0 -mt-12 sm:-mt-14 z-10">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-sidebar bg-slate-100 shadow-md overflow-hidden flex items-center justify-center">
                {profile?.avatar && !avatarLoadError ? (
                  <Image
                    src={profile.avatar}
                    alt={displayName}
                    fill
                    sizes="(max-width: 640px) 96px, 112px"
                    unoptimized={typeof profile.avatar === "string" && !profile.avatar.startsWith("/") && !profile.avatar.includes("unsplash.com") && !profile.avatar.includes("lh3.googleusercontent.com")}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={() => setAvatarLoadError(true)}
                  />
                ) : null}
                <div
                  className={`avatar-fallback ${
                    profile?.avatar && !avatarLoadError ? "hidden" : "flex"
                  } w-full h-full bg-slate-100 text-slate-700 font-semibold text-2xl sm:text-3xl items-center justify-center select-none`}
                >
                  {initials}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                className="absolute bottom-0 right-0 p-1.5 sm:p-2 bg-slate-900 text-white rounded-full border-2 border-sidebar shadow-md hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center"
                aria-label="Ganti foto profil"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center sm:text-left space-y-1.5 pt-1 sm:pt-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-lg sm:text-xl font-medium text-slate-950 tracking-tight">
                  {displayName}
                </h2>
              </div>

              {profile?.email && (
                <p className="text-sm font-normal text-slate-500">
                  {profile.email}
                </p>
              )}

              <p className="text-sm font-normal text-slate-500">
                Bergabung {formatDate(profile?.createdAt, { month: "long" })}
              </p>

              {(profile?.phone || profile?.city) && (
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-sm font-normal text-slate-500">
                  {profile?.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                  {profile?.city && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{profile.city}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {children && (
        <div className="border-t border-slate-200/80">
          {children}
        </div>
      )}

      {isAvatarModalOpen && (
        <DonorAvatarDialog
          isOpen={isAvatarModalOpen}
          onOpenChange={setIsAvatarModalOpen}
          currentAvatar={profile?.avatar || ""}
          customAvatar={profile?.customAvatar || ""}
          onSaveAvatar={({ avatar, customAvatar }) =>
            onUpdateImage({ avatar, customAvatar })
          }
          isUpdating={isUpdating}
        />
      )}
    </div>
  );
}
