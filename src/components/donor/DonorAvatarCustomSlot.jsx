"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, Trash2, Loader2, Check } from "lucide-react";
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
  onSelect,
  onUploadSuccess,
  onRemove,
  disabled = false,
}) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-lg bg-slate-50/80 border border-slate-200/80">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-center gap-2.5 min-w-0 text-center sm:text-left">
        {customAvatar && (
          <div className="relative w-9 h-9 rounded-full overflow-hidden border border-slate-200 shrink-0 hidden sm:block">
            <Image
              src={customAvatar}
              alt="Foto Anda"
              fill
              sizes="36px"
              unoptimized={
                !customAvatar.startsWith("/") &&
                !customAvatar.includes("unsplash.com") &&
                !customAvatar.includes("lh3.googleusercontent.com")
              }
              className="object-cover"
            />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-800 truncate">
            {customAvatar ? "Foto profil dari perangkat Anda" : "Pilih foto profil dari perangkat"}
          </p>
          <p className="text-[11px] text-slate-500">
            {customAvatar
              ? isActive
                ? "Sedang digunakan sebagai avatar aktif di atas"
                : "Tersimpan • Anda dapat beralih kembali kapan saja"
              : "Mendukung format JPG, PNG, atau WebP (Maks. 2MB)"}
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
            <span>Gunakan foto</span>
          </Button>
        )}

        <Button
          type="button"
          variant={customAvatar ? "outline" : "default"}
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className={`h-8 px-3 text-xs gap-1.5 cursor-pointer rounded-md ${
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

        {customAvatar && (
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
  );
}
