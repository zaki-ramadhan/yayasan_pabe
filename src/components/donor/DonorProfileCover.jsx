/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Camera, MapPin, Calendar, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/formatters";
import { sanitizeImageUrl, maskEmail } from "@/lib/security";
import { DonorProfileBannerCanvas } from "@/components/donor/DonorProfileBannerCanvas";

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
];

function getInitials(name, email) {
  if (name && typeof name === "string") {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    if (parts.length === 1 && parts[0].length >= 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
  }
  if (email && typeof email === "string") {
    return email.slice(0, 2).toUpperCase();
  }
  return "U";
}

export function DonorProfileCover({
  profile,
  onUpdateImage,
  isUpdating = false,
  children,
}) {
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState("");

  const displayName = profile?.name || "Pengguna";
  const initials = getInitials(profile?.name, profile?.email);

  const handleSaveAvatar = async () => {
    const cleanUrl = sanitizeImageUrl(newAvatarUrl);
    if (!cleanUrl) return;
    await onUpdateImage({ avatar: cleanUrl });
    setIsAvatarModalOpen(false);
    setNewAvatarUrl("");
  };

  const handleRemoveAvatar = async () => {
    await onUpdateImage({ avatar: "" });
    setIsAvatarModalOpen(false);
    setNewAvatarUrl("");
  };

  return (
    <div className="rounded-md border border-slate-200/90 bg-sidebar overflow-hidden shadow-2xs">
      <DonorProfileBannerCanvas seed={profile?.email || profile?.id || profile?.name} />

      <div className="px-4 sm:px-6 md:px-8 pb-6 bg-sidebar">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6">
            <div className="relative group shrink-0 -mt-12 sm:-mt-14 z-10">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-sidebar bg-slate-100 shadow-md overflow-hidden flex items-center justify-center">
                {profile?.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={displayName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const fb = e.currentTarget.parentElement?.querySelector(".avatar-fallback");
                      if (fb) fb.classList.remove("hidden");
                    }}
                  />
                ) : null}
                <div
                  className={`avatar-fallback ${
                    profile?.avatar ? "hidden" : "flex"
                  } w-full h-full bg-slate-900 text-white font-medium text-2xl sm:text-3xl items-center justify-center select-none`}
                >
                  {initials}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setNewAvatarUrl(profile?.avatar || "");
                  setIsAvatarModalOpen(true);
                }}
                className="absolute bottom-0 right-0 p-2 bg-slate-900 text-white rounded-full border-2 border-sidebar shadow-md hover:bg-slate-800 transition-colors cursor-pointer"
                title="Ganti foto profil"
                aria-label="Ganti foto profil"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-center sm:text-left space-y-1.5 pt-1 sm:pt-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-lg sm:text-xl font-medium text-slate-950 tracking-tight">
                  {displayName}
                </h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200">
                  {profile?.role === "SUPER_ADMIN"
                    ? "Super Admin"
                    : profile?.role === "ADMIN"
                    ? "Admin Yayasan"
                    : "Akun terverifikasi"}
                </span>
              </div>

              {profile?.email && (
                <p className="text-sm font-normal text-slate-500">
                  {maskEmail(profile.email)}
                </p>
              )}

              {profile?.bio && (
                <p className="text-sm font-normal text-slate-700 max-w-xl line-clamp-2">
                  {profile.bio}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-sm font-normal text-slate-500">
                {profile?.city && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{profile.city}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>
                    Bergabung {formatDate(profile?.createdAt, { month: "long" })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {children && (
        <div className="border-t border-slate-200/80">
          {children}
        </div>
      )}

      <Dialog open={isAvatarModalOpen} onOpenChange={setIsAvatarModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-medium text-slate-950">
              Pengaturan foto profil
            </DialogTitle>
            <DialogDescription className="text-sm font-normal text-slate-600">
              Pilih avatar atau tempel tautan foto representatif Anda. Jika dihapus, sistem akan otomatis menggunakan inisial nama Anda.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label htmlFor="input-avatar-url" className="text-sm font-medium text-slate-700 block mb-1.5">
                URL foto profil
              </label>
              <Input
                id="input-avatar-url"
                type="url"
                placeholder="https://..."
                value={newAvatarUrl}
                onChange={(e) => setNewAvatarUrl(e.target.value)}
                className="text-sm h-9.5 rounded-md border-slate-200"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">
                Pilihan avatar:
              </p>
              <div className="flex flex-wrap gap-2.5">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setNewAvatarUrl(preset)}
                    className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                      newAvatarUrl === preset
                        ? "border-primary ring-2 ring-primary/20 scale-105"
                        : "border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    <img
                      src={preset}
                      alt={`Pilihan avatar ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {profile?.avatar && (
              <div className="pt-2 border-t border-slate-100 flex justify-start">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveAvatar}
                  disabled={isUpdating}
                  className="text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Gunakan inisial nama (hapus foto)</span>
                </Button>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAvatarModalOpen(false)}
              className="text-sm font-medium border-slate-200 rounded-md"
            >
              Batal
            </Button>
            <Button
              size="sm"
              disabled={!newAvatarUrl || isUpdating}
              onClick={handleSaveAvatar}
              className="text-sm font-medium rounded-md"
            >
              {isUpdating ? "Menyimpan..." : "Simpan foto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
