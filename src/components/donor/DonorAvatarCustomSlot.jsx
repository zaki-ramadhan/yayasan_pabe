"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { UploadIcon as Upload } from "@solar-icons/react/line-duotone/upload";
import { TrashBinTrashIcon as Trash2 } from "@solar-icons/react/line-duotone/trash-bin-trash";
import { LoaderIcon as Loader2 } from "@solar-icons/react/linear/loader";
import { CheckIcon as Check } from "@solar-icons/react/line-duotone/check";
import { Button } from "@/components/ui/Button";
import { uploadFileToServer } from "@/services/uploadService";
import { toast } from "@/hooks/useToast";

/**
 * Sub-komponen pemilihan / pengunggahan foto profil dari perangkat.
 * Menampilkan bar horizontal minimalis di bagian bawah sesuai layout referensi:
 * Kiri: Teks deskripsi status foto dari perangkat
 * Kanan: Tombol aksi (Unggah / Ganti / Hapus / Gunakan Kembali)
 */
export function DonorAvatarCustomSlot({
  customAvatar = "",
  isActive = false,
  provider = "",
  onSelect,
  onUploadSuccess,
  onRemove,
  disabled = false,
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [thumbError, setThumbError] = useState(false);
  const fileInputRef = useRef(null);

  const isGoogle =
    customAvatar.includes("googleusercontent.com") ||
    provider === "GOOGLE";
  const isFacebook =
    customAvatar.includes("facebook.com") ||
    customAvatar.includes("fbcdn.net") ||
    provider === "FACEBOOK";

  const slotTitle = isGoogle
    ? "Foto akun Google"
    : isFacebook
    ? "Foto akun Facebook"
    : customAvatar
    ? "Foto profil kustom"
    : "Unggah foto dari perangkat";

  const slotDescription = isGoogle
    ? isActive
      ? "Sedang digunakan sebagai foto profil aktif Anda."
      : "Foto profil dari akun Google Anda saat mendaftar/masuk."
    : isFacebook
    ? isActive
      ? "Sedang digunakan sebagai foto profil aktif Anda."
      : "Foto profil dari akun Facebook Anda saat mendaftar/masuk."
    : customAvatar
    ? isActive
      ? "Sedang digunakan sebagai foto profil aktif Anda."
      : "Foto yang Anda unggah dari perangkat."
    : "Mendukung format JPG, PNG, atau WebP (Maksimal 2MB).";

  const processFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Format tidak didukung",
        description: "Hanya berkas gambar JPG, PNG, atau WebP yang diperbolehkan.",
        variant: "destructive",
      });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Ukuran terlalu besar",
        description: "Ukuran foto maksimal adalah 2MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const res = await uploadFileToServer({
        file,
        context: "USER_AVATAR",
      });

      if (res?.url) {
        onUploadSuccess(res.url);
        toast({
          title: "Berhasil",
          description: "Foto profil berhasil diunggah.",
          variant: "success",
        });
      }
    } catch (err) {
      toast({
        title: "Gagal mengunggah",
        description: err.message || "Terjadi kesalahan saat mengunggah foto.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) processFile(file);
  };

  return (
    <div className="flex flex-col gap-2.5 p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {customAvatar && (
            <div className="relative w-9 h-9 rounded-full overflow-hidden border border-slate-200 shrink-0 bg-slate-100 flex items-center justify-center">
              {!thumbError ? (
                <Image
                  src={customAvatar}
                  alt="Foto Akun"
                  fill
                  sizes="36px"
                  onError={() => setThumbError(true)}
                  unoptimized={
                    !customAvatar.startsWith("/") &&
                    !customAvatar.includes("unsplash.com") &&
                    !customAvatar.includes("lh3.googleusercontent.com")
                  }
                  className="object-cover"
                />
              ) : (
                <span className="text-slate-600 font-bold text-xs">U</span>
              )}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {slotTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {customAvatar && !isActive && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSelect}
              disabled={disabled || isUploading}
              className="h-8 px-2.5 text-xs text-slate-700 hover:bg-white gap-1.5 cursor-pointer rounded-md border-slate-200"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Gunakan</span>
            </Button>
          )}

          <Button
            type="button"
            variant={customAvatar ? "outline" : "default"}
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            className={`h-8 px-2.5 text-xs gap-1.5 cursor-pointer rounded-md ${
              !customAvatar
                ? "bg-slate-900 hover:bg-slate-800 text-white font-medium"
                : "border-slate-200 text-slate-700 hover:bg-white"
            }`}
          >
            {isUploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            <span>{isUploading ? "Mengunggah..." : customAvatar ? "Ganti foto" : "Unggah foto"}</span>
          </Button>

          {customAvatar && !isGoogle && !isFacebook && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRemove}
              disabled={disabled || isUploading}
              className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer rounded-md"
              aria-label="Hapus foto dari perangkat"
              title="Hapus foto dari perangkat"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-500 font-normal leading-relaxed border-t border-slate-200/60 pt-2">
        {slotDescription}
      </p>
    </div>
  );
}
