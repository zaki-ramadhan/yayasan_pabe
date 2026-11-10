"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { USER_AVATAR_PRESETS, ASSET_PATHS } from "@/lib/assetConstants";
import { useStagedUploads } from "@/hooks/useStagedUploads";
import { DonorAvatarCustomSlot } from "./DonorAvatarCustomSlot";
import { DonorAvatarPresetPicker } from "./DonorAvatarPresetPicker";

/**
 * Dialog pengaturan dan pemilihan foto profil donatur.
 * Mengikuti tata letak referensi:
 * 1. Lingkaran foto profil terpilih / terunggah di tengah (Center Profile Picture)
 * 2. Deretan pilihan avatar karakter default
 * 3. Garis pemisah dengan teks "ATAU"
 * 4. Bagian unggah dari perangkat (dengan tombol unggah / ganti / hapus)
 */
export function DonorAvatarDialog({
  isOpen,
  onOpenChange,
  currentAvatar = "",
  customAvatar = "",
  onSaveAvatar,
  isUpdating = false,
}) {
  const isPreset = (url) =>
    USER_AVATAR_PRESETS.includes(url) ||
    url === ASSET_PATHS.AVATARS.MALE ||
    url === ASSET_PATHS.AVATARS.FEMALE;

  const initialCustomAvatar =
    customAvatar || (currentAvatar && !isPreset(currentAvatar) ? currentAvatar : "");

  const [selectedAvatar, setSelectedAvatar] = useState(
    currentAvatar || initialCustomAvatar || USER_AVATAR_PRESETS[0] || ""
  );
  const [stagedCustomAvatar, setStagedCustomAvatar] = useState(initialCustomAvatar);
  const { trackUpload, commitUploads, discardUploads } = useStagedUploads();

  const handleCustomUploadSuccess = (url) => {
    trackUpload(url);
    setStagedCustomAvatar(url);
    setSelectedAvatar(url);
  };

  const handleCustomSelect = () => {
    if (stagedCustomAvatar) {
      setSelectedAvatar(stagedCustomAvatar);
    }
  };

  const handleCustomRemove = () => {
    setStagedCustomAvatar("");
    if (selectedAvatar === stagedCustomAvatar) {
      setSelectedAvatar(USER_AVATAR_PRESETS[0] || "");
    }
  };

  const handlePresetSelect = (preset) => {
    setSelectedAvatar(preset);
  };

  const handleSave = async () => {
    commitUploads();
    await onSaveAvatar({
      avatar: selectedAvatar,
      customAvatar: stagedCustomAvatar,
    });
    onOpenChange(false);
  };

  const handleClose = (open) => {
    if (!open) {
      discardUploads();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[85vh] p-0 overflow-hidden flex flex-col bg-white border border-slate-200">
        <DialogHeader>
          <DialogTitle>
            Pengaturan foto profil
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 sm:px-6 space-y-5">
          {/* 1. Lingkaran Utama di Tengah (Foto Terpilih / Terunggah) */}
          <div className="flex flex-col items-center justify-center text-center">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-slate-100 bg-slate-50 shadow-sm overflow-hidden flex items-center justify-center transition-all duration-200">
              {selectedAvatar ? (
                <Image
                  src={selectedAvatar}
                  alt="Foto profil terpilih"
                  fill
                  sizes="112px"
                  unoptimized={
                    !selectedAvatar.startsWith("/") &&
                    !selectedAvatar.includes("unsplash.com") &&
                    !selectedAvatar.includes("lh3.googleusercontent.com")
                  }
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 text-slate-700 font-semibold text-3xl flex items-center justify-center select-none">
                  U
                </div>
              )}
            </div>

            <p className="text-xs font-normal text-slate-500 mt-2">
              Pratinjau foto profil aktif
            </p>
          </div>

          {/* 2. Pilihan Avatar Karakter Default */}
          <DonorAvatarPresetPicker
            selectedAvatar={selectedAvatar}
            onSelect={handlePresetSelect}
            disabled={isUpdating}
          />

          {/* 3. Garis Pemisah dengan Teks "ATAU" */}
          <div className="relative flex items-center justify-center py-0.5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/80" />
            </div>
            <span className="relative bg-white px-3 text-sm font-medium uppercase tracking-wider text-slate-400">
              Atau
            </span>
          </div>

          {/* 4. Unggah Foto dari Perangkat */}
          <DonorAvatarCustomSlot
            customAvatar={stagedCustomAvatar}
            isActive={Boolean(stagedCustomAvatar && selectedAvatar === stagedCustomAvatar)}
            onSelect={handleCustomSelect}
            onUploadSuccess={handleCustomUploadSuccess}
            onRemove={handleCustomRemove}
            disabled={isUpdating}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleClose(false)}
            disabled={isUpdating}
            className="h-9 px-4 min-w-[84px] text-sm font-medium border-slate-200 rounded-md cursor-pointer"
          >
            Batal
          </Button>
          <Button
            size="sm"
            disabled={isUpdating || !selectedAvatar}
            onClick={handleSave}
            className="h-9 px-4 min-w-[96px] text-sm font-medium rounded-md cursor-pointer"
          >
            {isUpdating ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
