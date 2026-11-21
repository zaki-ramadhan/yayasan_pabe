"use client";

import Image from "next/image";
import { TrashBinTrashIcon as Trash2 } from "@solar-icons/react/line-duotone/trash-bin-trash";
import { VideoFrameIcon as Video } from "@solar-icons/react/line-duotone/video-frame";
import { Button } from "@/components/ui/Button";
import { formatBytes } from "@/lib/formatters";
import { getFileIconAsset, isDocumentFile } from "@/lib/fileIconHelper";

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
          {imageCount} foto{videoCount > 0 ? `, ${videoCount} video sorotan` : ""}), total: {formatBytes(totalBytes)}
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

      <div className="flex flex-col max-h-[300px] overflow-y-auto divide-y divide-slate-100 pr-1">
        {files.map((item, idx) => (
          <div
            key={item.id || idx}
            className="flex items-center gap-3.5 py-2.5 transition-colors"
          >
            {isDocumentFile(item.name || item.previewUrl) ? (
              <Image
                src={getFileIconAsset(
                  item.name || item.previewUrl,
                  item.type || (item.file instanceof File ? item.file.type : "")
                )}
                alt={item.name}
                width={36}
                height={36}
                className="w-9 h-9 object-contain shrink-0 select-none"
              />
            ) : (
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
            )}

            <div className="flex-1 min-w-0 pr-1">
              <p className="text-sm font-medium text-slate-900 truncate">
                {item.name}
              </p>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                {item.isVideo
                  ? item.size > 0 && item.durationFormatted
                    ? `${formatBytes(item.size)} (${item.durationFormatted})`
                    : item.size > 0
                      ? formatBytes(item.size)
                      : item.durationFormatted
                        ? `Video (${item.durationFormatted})`
                        : "Video"
                  : item.size > 0
                    ? formatBytes(item.size)
                    : isDocumentFile(item.name || item.previewUrl)
                      ? "Dokumen"
                      : "Foto"}
              </p>
            </div>

            {!isUploading && onRemoveFile && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemoveFile(item.id)}
                className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors shrink-0 rounded-lg cursor-pointer"
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
