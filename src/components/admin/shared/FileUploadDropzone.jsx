"use client";

import { UploadCloud, FileCheck, Loader2 } from "lucide-react";

/**
 * Sub-komponen visual kotak unggah drag & drop.
 * Menangani tampilan visual interaksi seret-lepas dan animasi status unggah.
 */
export function FileUploadDropzone({
  isDragging,
  isUploading,
  isPdf = false,
  helperText,
  onClick,
  onDrop,
  onDragOver,
  onDragLeave,
}) {
  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={!isUploading ? onClick : undefined}
      className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
        isDragging
          ? "border-emerald-500 bg-emerald-50/50 scale-[0.99]"
          : "border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50"
      } ${isUploading ? "pointer-events-none opacity-80" : ""}`}
    >
      <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-500 mb-2">
        {isUploading ? (
          <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
        ) : isPdf ? (
          <FileCheck className="w-5 h-5 text-emerald-600" />
        ) : (
          <UploadCloud className="w-5 h-5 text-emerald-600" />
        )}
      </div>

      <div className="text-center">
        <p className="text-sm font-medium text-slate-700">
          {isUploading
            ? "Mengompresi dan mengunggah ke R2..."
            : "Klik untuk memilih atau seret berkas ke sini"}
        </p>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          {helperText}
        </p>
      </div>
    </div>
  );
}
