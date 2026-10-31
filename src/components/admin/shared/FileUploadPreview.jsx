"use client";

import { useState } from "react";
import { FileCheck, Trash2, Edit2, Image as ImageIcon, Video } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { isVideoUrl } from "@/lib/galleryGroupHelper";

/**
 * Sub-komponen representasi berkas terunggah di Cloudflare R2.
 * Menampilkan thumbnail gambar / ikon dokumen, indikator status, dan tombol aksi tanpa card wrapper kaku.
 */
export function FileUploadPreview({
  value,
  previewSrc = "",
  isPdf = false,
  uploadMeta = null,
  isUploading = false,
  onReplace,
  onRemove,
}) {
  const [failedSrc, setFailedSrc] = useState(null);
  const activeSrc = previewSrc || value;

  // Otomatis arahkan domain *.r2.dev ke proxy internal /api/media/... jika diblokir oleh ISP Indonesia
  const resolvedSrc =
    typeof activeSrc === "string" && activeSrc.includes(".r2.dev/")
      ? `/api/media/${activeSrc.split(".r2.dev/")[1]}`
      : activeSrc;

  // Derived state: error hanya aktif jika URL yang gagal memuat identik dengan resolvedSrc aktif
  const isError = Boolean(failedSrc && failedSrc === resolvedSrc);
  const isVideo = Boolean(typeof resolvedSrc === "string" && isVideoUrl(resolvedSrc));
  
  let fileName = "Berkas terpilih";
  if (value instanceof File) {
    fileName = value.name;
  } else if (typeof value === "string" && value) {
    if (value.startsWith("data:")) {
      fileName = "Gambar Base64";
    } else {
      try {
        const urlObj = new URL(value);
        const pathLeaf = urlObj.pathname.split("/").filter(Boolean).pop();
        fileName = decodeURIComponent(pathLeaf || urlObj.hostname || "Berkas terpilih");
      } catch {
        fileName = decodeURIComponent((value || "").split("/").pop() || "Berkas terpilih");
      }
    }
  }

  return (
    <div className="flex items-center gap-3.5 p-3 rounded-xl border border-slate-200 bg-white shadow-2xs">
      {!isPdf ? (
        <div
          className="relative w-20 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0 flex items-center justify-center"
        >
          {isError || !resolvedSrc ? (
            <div className="flex flex-col items-center justify-center text-slate-400 p-1">
              <ImageIcon className="w-5 h-5 text-slate-400" />
            </div>
          ) : isVideo ? (
            <>
              <video
                src={resolvedSrc}
                className="w-full h-full object-cover"
                muted
                playsInline
                autoPlay
                preload="auto"
                onLoadedData={(e) => {
                  try {
                    const p = e.target.play();
                    if (p !== undefined) p.catch(() => {});
                  } catch {}
                }}
                onTimeUpdate={(e) => {
                  const vid = e.target;
                  if (vid.currentTime >= 0.12 || (vid.duration > 0 && vid.currentTime >= vid.duration / 2)) {
                    vid.pause();
                  }
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-slate-950/20">
                <Video className="w-5 h-5 text-white drop-shadow-md" />
              </div>
            </>
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={resolvedSrc}
              src={resolvedSrc}
              alt="Preview Berkas"
              className="w-full h-full object-cover"
              onError={() => setFailedSrc(resolvedSrc)}
            />
          )}
        </div>
      ) : (
        <div className="w-14 h-14 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
          <FileCheck className="w-6 h-6" />
        </div>
      )}

      <div className="flex-1 min-w-0 pr-1">
        <p className="text-sm font-normal text-slate-800 truncate">
          {fileName}
        </p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {isVideo ? (
            <span className="inline-flex items-center rounded-md border border-amber-200/80 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
              Video dokumentasi
            </span>
          ) : value instanceof File ? (
            <span className="inline-flex items-center rounded-md border border-slate-300 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
              Siap disimpan
            </span>
          ) : typeof value === "string" && (value.includes(".r2.dev") || value.includes("r2.cloudflarestorage.com") || value.startsWith("/api/media/")) ? (
            <span className="inline-flex items-center rounded-md border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
              Tersimpan di cloud
            </span>
          ) : (
            <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
              Tautan gambar eksternal
            </span>
          )}
          {(uploadMeta?.sizeKb || value instanceof File) && (
            <span className="text-xs text-slate-500 font-normal">
              {uploadMeta?.sizeKb || Math.round((value.size || 0) / 1024)} KB
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onReplace}
          disabled={isUploading}
          className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors disabled:pointer-events-none disabled:cursor-not-allowed" aria-label="Ganti berkas"
          aria-label="Ganti berkas"
        >
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          disabled={isUploading}
          className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors disabled:pointer-events-none disabled:cursor-not-allowed" aria-label="Hapus berkas"
          aria-label="Hapus berkas"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
