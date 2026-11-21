"use client";

import { UploadMinimalisticIcon as UploadMinimalistic } from "@solar-icons/react/line-duotone/upload-minimalistic";
import { DangerIcon as AlertOctagon } from "@solar-icons/react/line-duotone/danger";
import { cn } from "@/lib/utils";
import { UploadProgressBar } from "@/components/ui/UploadProgressBar";

function renderResponsiveHelperText(text) {
  if (typeof text !== "string") return text;
  const regex = /([•,]\s*Bisa\s+(?:tempel\s+via\s+)?Ctrl\s*\+\s*V(?:\s+untuk\s+paste)?)/gi;
  if (!regex.test(text)) {
    return text;
  }
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, idx) => {
        if (/Bisa\s+(?:tempel\s+via\s+)?Ctrl\s*\+\s*V/i.test(part)) {
          return (
            <span key={idx} className="hidden sm:inline">
              {part}
            </span>
          );
        }
        return part;
      })}
    </>
  );
}

/**
 * Sub-komponen visual kotak unggah seret & lepas (Drag and Drop) terstandarisasi.
 * Menjamin konsistensi tinggi, proporsi, radius sudut, dan token warna di seluruh modal admin.
 */
export function FileUploadDropzone({
  isDragging = false,
  isUploading = false,
  uploadProgress = 0,
  uploadProgressText = "",
  isPdf = false,
  multiple = false,
  hasFiles = false,
  helperText,
  onClick,
  onDrop,
  onDragOver,
  onDragLeave,
  onCancel,
  className = "",
  isStorageFull = false,
}) {
  if (isStorageFull) {
    return (
      <div
        className={cn(
          "relative flex flex-col items-center justify-center py-7 px-5 min-h-[175px] sm:min-h-[185px] border-2 border-dashed border-rose-300 bg-rose-50/50 rounded-xl select-none text-center",
          className
        )}
      >
        <AlertOctagon className="w-8 h-8 text-rose-500 mb-2" aria-hidden="true" />
        <p className="text-sm font-medium text-rose-900">
          Ruang penyimpanan hampir penuh (≥ 95%)
        </p>
        <p className="text-xs text-rose-600 mt-1 max-w-sm">
          Kapasitas penyimpanan hampir penuh. Pengunggahan berkas ditunda sementara hingga ruang penyimpanan dirapikan.
        </p>
      </div>
    );
  }

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={!isUploading ? onClick : undefined}
      className={cn(
        "relative flex flex-col items-center justify-center py-7 px-5 min-h-[175px] sm:min-h-[185px] border-2 border-dashed rounded-xl cursor-pointer transition-all select-none text-center",
        isDragging
          ? "border-emerald-500 bg-emerald-50/60 scale-[0.99]"
          : "border-slate-300 hover:border-slate-400 bg-slate-50/60 hover:bg-slate-50",
        isUploading && "cursor-default opacity-95",
        className
      )}
    >
      {isUploading ? (
        <UploadProgressBar
          progress={uploadProgress}
          isUploading={isUploading}
          uploadText={uploadProgressText}
          isPdf={isPdf}
          onCancel={onCancel}
          theme="emerald"
        />
      ) : (
        <div className="flex flex-col items-center">
          <UploadMinimalistic className="w-8 h-8 text-slate-400 mb-3" />

          <p className="text-base font-medium text-slate-800">
            {multiple
              ? hasFiles
                ? "Klik atau seret untuk menambah berkas lagi"
                : "Pilih atau seret berkas sekaligus"
              : isPdf
              ? "Klik untuk memilih dokumen PDF atau seret ke sini"
              : "Klik untuk memilih atau seret berkas ke sini"}
          </p>

          {helperText && (
            <p className="text-xs text-slate-500 mt-1 max-w-sm leading-normal">
              {renderResponsiveHelperText(helperText)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
