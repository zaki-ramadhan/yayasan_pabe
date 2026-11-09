"use client";

import { useState } from "react";
import { Trash2, Video, Image as ImageIcon } from "lucide-react";
import { YouTubeIcon } from "@/components/icons/SocialIcons";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { FileUploadZone } from "@/components/admin/shared/FileUploadZone";
import { isVideoUrl, isYouTubeUrl, getYouTubeThumbnail } from "@/lib/galleryGroupHelper";
import { FIELD_LIMITS } from "@/constants/fieldValidationLimits";

function ExistingMediaCard({ mediaUrl, index, isUploading, onRemove }) {
  const [hasError, setHasError] = useState(false);
  const isYt = isYouTubeUrl(mediaUrl);
  const isVid = isVideoUrl(mediaUrl);
  const ytThumb = isYt ? getYouTubeThumbnail(mediaUrl) : null;

  const resolvedSrc =
    typeof mediaUrl === "string" && mediaUrl.includes(".r2.dev/")
      ? `/api/media/${mediaUrl.split(".r2.dev/")[1]}`
      : mediaUrl;

  return (
    <div className="group relative aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-900 shadow-2xs">
      {isYt && ytThumb ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={ytThumb}
          alt={`Dokumentasi tersimpan ${index + 1}`}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : isVid ? (
        <video
          src={resolvedSrc}
          preload="metadata"
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      ) : hasError ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400 p-2 text-center select-none">
          <ImageIcon className="w-5 h-5 text-slate-400 mb-1" />
          <span className="text-3xs text-slate-400 line-clamp-1">Gagal memuat cover</span>
        </div>
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={resolvedSrc}
          alt={`Dokumentasi tersimpan ${index + 1}`}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      )}

      {/* Badge penanda jenis media */}
      <div className="absolute left-1.5 bottom-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-3xs font-medium pointer-events-none">
        {isYt ? (
          <>
            <YouTubeIcon className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span>YouTube</span>
          </>
        ) : isVid ? (
          <>
            <Video className="w-3 h-3 text-emerald-400" />
            <span>Video</span>
          </>
        ) : (
          <span>Foto</span>
        )}
      </div>

      {/* Tombol hapus media */}
      {!isUploading && onRemove && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/70 text-white/90 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
          title="Hapus media ini"
          aria-label="Hapus media"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

/**
 * Sub-komponen modular untuk mengelola media dokumentasi penyaluran donasi (SRP & DRY).
 * Mendukung foto dan video langsung (Cloudflare R2) serta tautan video YouTube opsional.
 */
export function AdminDistributionMediaFields({
  existingMedia = [],
  onRemoveExistingMedia,
  selectedFiles = [],
  onFilesChange,
  youtubeUrl = "",
  onYoutubeUrlChange,
  isUploading = false,
  uploadProgressText = "",
  error = "",
}) {
  return (
    <div className="space-y-4 pt-1">
      {/* 1. Pratinjau media yang sudah tersimpan sebelumnya (Mode Edit) */}
      {existingMedia.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-slate-800 block select-none">
              Media dokumentasi tersimpan ({existingMedia.length} berkas)
            </span>
            <span className="text-slate-500 text-xs">Klik ikon tong sampah untuk melepas</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-[220px] overflow-y-auto">
            {existingMedia.map((mediaUrl, index) => (
              <ExistingMediaCard
                key={`${mediaUrl}-${index}`}
                mediaUrl={mediaUrl}
                index={index}
                isUploading={isUploading}
                onRemove={onRemoveExistingMedia}
              />
            ))}
          </div>
        </div>
      )}

      {/* 2. Zona Unggah Foto & Video Sorotan (Direct R2) */}
      <FileUploadZone
        multiple={true}
        allowVideo={true}
        files={selectedFiles}
        onFilesChange={onFilesChange}
        label={existingMedia.length > 0 ? "Tambah foto / video baru" : "Foto & video dokumentasi penyaluran"}
        hint="Pilih foto (JPG, PNG, WebP maks. 8MB) atau video sorotan (MP4, WebM maks. 25MB, durasi < 1 mnt)"
        isUploading={isUploading}
        uploadProgressText={uploadProgressText}
        error={error}
      />

      {/* 3. Tautan Video YouTube Opsional (Long-form Video) */}
      <FormField label="Tautan video YouTube (opsional)">
        <Input
          type="url"
          inputMode="url"
          minLength={FIELD_LIMITS.MEDIA_URL.min}
          maxLength={FIELD_LIMITS.MEDIA_URL.max}
          spellCheck={false}
          placeholder="https://www.youtube.com/watch?v=... atau https://youtu.be/..."
          value={youtubeUrl}
          onChange={(e) => onYoutubeUrlChange(e.target.value.replace(/\s+/g, "").slice(0, FIELD_LIMITS.MEDIA_URL.max))}
          onBlur={() => onYoutubeUrlChange(youtubeUrl.trim())}
          className="h-10 text-sm bg-white"
        />
        <p className="text-xs text-slate-500 mt-1">
          Tempel tautan video YouTube (publik/unlisted). Sangat disarankan untuk video dokumentasi berdurasi panjang (&gt; 1 menit).
        </p>
      </FormField>
    </div>
  );
}
