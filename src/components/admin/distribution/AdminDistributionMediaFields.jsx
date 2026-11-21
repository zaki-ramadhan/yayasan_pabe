"use client";

import { useState } from "react";
import { TrashBinTrashIcon as Trash2 } from "@solar-icons/react/line-duotone/trash-bin-trash";
import { VideoFrameIcon as Video } from "@solar-icons/react/line-duotone/video-frame";
import { ImageFallback } from "@/components/ui/ImageFallback";
import { SafeImage } from "@/components/ui/SafeImage";
import { YouTubeIcon } from "@/components/icons/SocialIcons";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { FileUploadZone } from "@/components/admin/shared/FileUploadZone";
import { isVideoUrl, isYouTubeUrl, getYouTubeThumbnail, getVideoPosterUrl } from "@/lib/galleryGroupHelper";
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
    <div className="group relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-2xs">
      {isYt && ytThumb ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={ytThumb}
          alt={`Dokumentasi tersimpan ${index + 1}`}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : isVid ? (
        <SafeImage
          src={getVideoPosterUrl(mediaUrl)}
          alt={`Dokumentasi tersimpan ${index + 1}`}
          sizes="240px"
        />
      ) : hasError ? (
        <ImageFallback alt={`Dokumentasi tersimpan ${index + 1}`} />
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={resolvedSrc}
          alt={`Dokumentasi tersimpan ${index + 1}`}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      )}

      {(isYt || isVid) && (
        <div className="absolute left-2 bottom-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/65 backdrop-blur-xs text-white text-3xs font-medium pointer-events-none">
          {isYt ? (
            <>
              <YouTubeIcon className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span>YouTube</span>
            </>
          ) : (
            <>
              <Video className="w-3.5 h-3.5 text-emerald-400" />
              <span>Video</span>
            </>
          )}
        </div>
      )}

      {!isUploading && onRemove && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-rose-600 text-white transition-all cursor-pointer shadow-xs active:scale-95"
          title="Hapus media ini"
          aria-label="Hapus media"
        >
          <Trash2 className="w-4 h-4" />
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
      {existingMedia.length > 0 && (
        <div className="space-y-2">
          <span className="text-sm font-medium text-slate-800 block select-none">
            Media dokumentasi tersimpan ({existingMedia.length} berkas)
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[260px] overflow-y-auto pr-0.5">
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

      <FormField
        label="Tautan video YouTube (opsional)"
        helperText="Khusus tautan video publik YouTube untuk dokumentasi penyaluran berdurasi panjang."
      >
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
      </FormField>
    </div>
  );
}
