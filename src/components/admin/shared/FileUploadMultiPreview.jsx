"use client";

import { Trash2, Video } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatBytes } from "@/lib/formatters";

/**
 * Sub-komponen visual daftar pratinjau multi-berkas terpilih.
 * Menampilkan thumbnail foto/video, ukuran data, durasi, serta tombol hapus per berkas.
 */
export function FileUploadMultiPreview({
  files = [],
  onRemoveFile,
  onClearFiles,
  isUploading = false,
}) {
  if (!files || files.length === 0) return null;

  const totalBytes = files.reduce((acc, curr) => acc + (curr.size || 0), 0);
  const videoCount = files.filter((f) => f.isVideo).length;
  const imageCount = files.length - videoCount;

  return (
    <div className="space-y-2.5 pt-1">
      <div className="flex items-center justify-between text-xs text-slate-600 px-0.5">
        <span>
          <strong className="text-slate-900 font-medium">{files.length}</strong> berkas terpilih (
          {imageCount} foto{videoCount > 0 ? `, ${videoCount} video sorotan` : ""})
          {" • "}Total: {formatBytes(totalBytes)}
        </span>
        {!isUploading && onClearFiles && (
          <button
            type="button"
            onClick={onClearFiles}
            className="text-rose-600 hover:text-rose-700 hover:underline cursor-pointer flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus semua</span>
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
        {files.map((item, idx) => (
          <div
            key={item.id || idx}
            className="flex items-center gap-3.5 p-2.5 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition-colors"
          >
            {/* Thumbnail di sisi kiri */}
            <div className="relative w-20 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-800 shrink-0 flex items-center justify-center">
              {item.isVideo ? (
                <>
                  {item.thumbnailUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.thumbnailUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={item.previewUrl}
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
                  )}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-slate-950/20">
                    <Video className="w-5 h-5 text-white drop-shadow-md" />
                  </div>
                </>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={item.previewUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Informasi berkas di tengah */}
            <div className="flex-1 min-w-0 pr-1">
              <p className="text-sm font-medium text-slate-800 truncate" title={item.name}>
                {item.name}
              </p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-700">
                  {formatBytes(item.size)}
                </span>
                {item.isVideo ? (
                  <span className="inline-flex items-center rounded-md border border-amber-200/80 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                    {item.durationFormatted ? `Video (${item.durationFormatted})` : "Video sorotan"}
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-md border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                    Foto siap diunggah
                  </span>
                )}
              </div>
            </div>

            {/* Tombol aksi hapus di sisi kanan */}
            {!isUploading && onRemoveFile && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemoveFile(item.id)}
                className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors shrink-0 rounded-lg cursor-pointer"
                title="Hapus berkas ini"
                aria-label="Hapus berkas ini"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
