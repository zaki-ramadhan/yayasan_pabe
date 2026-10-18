/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Camera, MapPin, Calendar, CheckCircle2 } from "lucide-react";
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

const COVER_PRESETS = [
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80",
];

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
];

export function DonorProfileCover({ profile, onUpdateImage, isUpdating = false }) {
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [newCoverUrl, setNewCoverUrl] = useState("");
  const [newAvatarUrl, setNewAvatarUrl] = useState("");

  const handleSaveCover = async () => {
    if (!newCoverUrl) return;
    await onUpdateImage({ coverImage: newCoverUrl });
    setIsCoverModalOpen(false);
    setNewCoverUrl("");
  };

  const handleSaveAvatar = async () => {
    if (!newAvatarUrl) return;
    await onUpdateImage({ avatar: newAvatarUrl });
    setIsAvatarModalOpen(false);
    setNewAvatarUrl("");
  };

  const defaultCover =
    profile?.coverImage ||
    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80";

  const defaultAvatar =
    profile?.avatar ||
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80";

  const salutation = profile?.salutation ? `${profile.salutation} ` : "";
  const displayName = `${salutation}${profile?.name || "Donatur"}`;

  return (
    <div className="rounded-md border border-slate-200/90 bg-sidebar overflow-hidden">
      {/* 1. Cover Photo Banner */}
      <div className="relative h-44 sm:h-56 md:h-64 lg:h-72 w-full bg-slate-200 overflow-hidden group">
        <img
          src={defaultCover}
          alt="Foto Sampul Profil"
          className="w-full h-full object-cover"
        />

        {/* Edit Cover Photo Floating Button */}
        <div className="absolute right-3 bottom-3 sm:right-5 sm:bottom-5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setNewCoverUrl(defaultCover);
              setIsCoverModalOpen(true);
            }}
            className="h-8.5 px-3 rounded-md text-sm font-medium bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-sm backdrop-blur-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Camera className="w-4 h-4 text-slate-600" />
            <span>Ubah Sampul</span>
          </Button>
        </div>
      </div>

      {/* 2. Overlapping Facebook-style Avatar & Identity Header */}
      <div className="px-4 sm:px-6 md:px-8 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 -mt-16 sm:-mt-20">
            {/* Circular Avatar */}
            <div className="relative group shrink-0">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-white bg-slate-100 shadow-md overflow-hidden flex items-center justify-center">
                <img
                  src={defaultAvatar}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Camera Icon Button */}
              <button
                type="button"
                onClick={() => {
                  setNewAvatarUrl(defaultAvatar);
                  setIsAvatarModalOpen(true);
                }}
                className="absolute bottom-1 right-1 p-2 bg-slate-900 text-white rounded-full border-2 border-white shadow-md hover:bg-primary transition-colors cursor-pointer"
                title="Ganti Foto Profil"
                aria-label="Ganti Foto Profil"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Identity Information */}
            <div className="text-center sm:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-medium text-slate-950 tracking-tight">
                  {displayName}
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium text-emerald-800 bg-white border border-slate-200">
                  {profile?.role === "SUPER_ADMIN" ? "Super Admin" : "Donatur Aktif"}
                </span>
              </div>

              <p className="text-sm font-medium text-slate-600">
                {profile?.title || "Donatur & Muzakki Tetap Yayasan PABE"}
              </p>

              {profile?.bio && (
                <p className="text-sm font-normal text-slate-700 max-w-xl line-clamp-2">
                  {profile.bio}
                </p>
              )}

              {/* Metadata strip (City & Joined Date) */}
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

      {/* Modal Dialog: Ganti Foto Sampul */}
      <Dialog open={isCoverModalOpen} onOpenChange={setIsCoverModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-medium text-slate-950">
              Ganti Foto Sampul
            </DialogTitle>
            <DialogDescription className="text-sm font-normal text-slate-600">
              Pilih dari koleksi gambar sampul pilihan atau masukkan tautan URL
              gambar Anda sendiri.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">
                URL Gambar Sampul
              </label>
              <Input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={newCoverUrl}
                onChange={(e) => setNewCoverUrl(e.target.value)}
                className="text-sm h-9 rounded-md border-slate-200"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">
                Pilihan Gambar Sampul:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {COVER_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setNewCoverUrl(preset)}
                    className={`h-16 rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                      newCoverUrl === preset
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    <img
                      src={preset}
                      alt={`Pilihan Sampul ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCoverModalOpen(false)}
              className="text-sm font-medium border-slate-200 rounded-md"
            >
              Batal
            </Button>
            <Button
              size="sm"
              disabled={!newCoverUrl || isUpdating}
              onClick={handleSaveCover}
              className="text-sm font-medium rounded-md"
            >
              {isUpdating ? "Menyimpan..." : "Simpan Foto Sampul"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Dialog: Ganti Foto Profil */}
      <Dialog open={isAvatarModalOpen} onOpenChange={setIsAvatarModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-medium text-slate-950">
              Ganti Foto Profil
            </DialogTitle>
            <DialogDescription className="text-sm font-normal text-slate-600">
              Pilih foto profil representatif Anda atau tempel tautan URL gambar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">
                URL Foto Profil
              </label>
              <Input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={newAvatarUrl}
                onChange={(e) => setNewAvatarUrl(e.target.value)}
                className="text-sm h-9 rounded-md border-slate-200"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">
                Pilihan Avatar Profil:
              </p>
              <div className="flex flex-wrap gap-2.5">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setNewAvatarUrl(preset)}
                    className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                      newAvatarUrl === preset
                        ? "border-primary ring-2 ring-primary/20 scale-105"
                        : "border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    <img
                      src={preset}
                      alt={`Pilihan Avatar ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
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
              {isUpdating ? "Menyimpan..." : "Simpan Foto Profil"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
