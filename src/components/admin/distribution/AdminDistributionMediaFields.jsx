"use client";

import { Trash2, Video } from "lucide-react";
import { YouTubeIcon } from "@/components/icons/SocialIcons";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { FileUploadZone } from "@/components/admin/shared/FileUploadZone";
import { isVideoUrl, isYouTubeUrl, getYouTubeThumbnail } from "@/lib/galleryGroupHelper";

/**
 * Sub-komponen modular untuk mengelola media dokumentasi penyaluran donasi (SRP & DRY).
 * Mendukung foto dan video langsung (Cloudflare R2) serta tautan video YouTube opsional.
 *
 * @param {object} props
 * @param {Array<string>} props.existingMedia - Daftar URL media yang sudah tersimpan di database
 * @param {Function} props.onRemoveExistingMedia - Handler menghapus media tersimpan
 * @param {Array<File>} props.selectedFiles - Daftar berkas baru yang dipilih di browser
 * @param {Function} props.onFilesChange - Handler perubahan berkas baru
 * @param {string} props.youtubeUrl - Nilai tautan video YouTube opsional
 * @param {Function} props.onYoutubeUrlChange - Handler perubahan tautan YouTube
 * @param {boolean} props.isUploading - Status proses unggah berjalan
 * @param {string} props.uploadProgressText - Keterangan progres unggah berkas
 * @param {string} [props.error] - Pesan kesalahan validasi media
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
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-700">
            <span className="font-medium text-slate-800">
              Media dokumentasi tersimpan ({existingMedia.length} berkas)
            </span>
            <span className="text-slate-500 text-2xs">Klik ikon tong sampah untuk melepas media</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-[220px] overflow-y-auto p-1.5 rounded-xl border border-slate-200 bg-slate-50/70">
            {existingMedia.map((mediaUrl, index) => {
              const isYt = isYouTubeUrl(mediaUrl);
              const isVid = isVideoUrl(mediaUrl);
              const ytThumb = isYt ? getYouTubeThumbnail(mediaUrl) : null;

              return (
                <div
                  key={`${mediaUrl}-${index}`}
                  className="group relative aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-900 shadow-2xs"
                >
                  {isYt && ytThumb ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={ytThumb}
                      alt={`Dokumentasi tersimpan ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : isVid ? (
                    <video
                      src={mediaUrl}
                      preload="metadata"
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={mediaUrl}
                      alt={`Dokumentasi tersimpan ${index + 1}`}
                      className="w-full h-full object-cover"
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
                  {!isUploading && onRemoveExistingMedia && (
                    <button
                      type="button"
                      onClick={() => onRemoveExistingMedia(index)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/70 text-white/90 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                      title="Hapus media ini"
                      aria-label="Hapus media"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
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
          maxLength={500}
          spellCheck={false}
          placeholder="https://www.youtube.com/watch?v=... atau https://youtu.be/..."
          value={youtubeUrl}
          onChange={(e) => onYoutubeUrlChange(e.target.value.replace(/\s+/g, "").slice(0, 500))}
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
