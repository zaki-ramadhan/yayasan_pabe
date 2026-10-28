"use client";

import { UploadCloud, FileCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Sub-komponen visual kotak unggah seret & lepas (Drag and Drop) terstandarisasi.
 * Menjamin konsistensi tinggi, proporsi, radius sudut, dan token warna di seluruh modal admin.
 */
export function FileUploadDropzone({
  isDragging = false,
  isUploading = false,
  uploadProgressText = "",
  isPdf = false,
  multiple = false,
  hasFiles = false,
  helperText,
  onClick,
  onDrop,
  onDragOver,
  onDragLeave,
  className = "",
}) {
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
        isUploading && "pointer-events-none opacity-80",
        className
      )}
    >
      {isUploading ? (
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-2" />
          <p className="text-sm font-medium text-slate-800">
            {uploadProgressText || (isPdf ? "Mengunggah dokumen PDF..." : "Mengompresi dan mengunggah ke R2...")}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Mohon jangan menutup jendela ini
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          {isPdf ? (
            <FileCheck className="w-8 h-8 text-slate-400 mb-2" />
          ) : (
            <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
          )}

          <p className="text-sm font-medium text-slate-700">
            {multiple
              ? hasFiles
                ? "Klik atau seret untuk menambah berkas lagi"
                : "Pilih atau seret berkas sekaligus"
              : isPdf
              ? "Klik untuk memilih dokumen PDF atau seret ke sini"
              : "Klik untuk memilih atau seret berkas ke sini"}
          </p>

          {helperText && (
            <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
              {helperText}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
