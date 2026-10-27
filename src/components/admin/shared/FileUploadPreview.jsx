"use client";

import { FileCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Sub-komponen representasi berkas terunggah di Cloudflare R2.
 * Menampilkan thumbnail gambar / ikon dokumen, indikator status, dan tombol aksi.
 */
export function FileUploadPreview({
  value,
  isPdf = false,
  uploadMeta = null,
  isUploading = false,
  onReplace,
  onRemove,
}) {
  const fileName = value.split("/").pop() || "Berkas terpilih";

  return (
    <div className="relative rounded-xl border border-slate-200 bg-slate-50/70 p-3 overflow-hidden">
      <div className="flex items-center gap-3">
        {!isPdf ? (
          <div className="relative w-20 h-16 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Preview Berkas"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
            <FileCheck className="w-6 h-6" />
          </div>
        )}

        <div className="flex-1 min-w-0 pr-2">
          <p className="text-sm font-medium text-slate-800 truncate">{fileName}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
              Tersimpan di Cloudflare R2
            </span>
            {uploadMeta && (
              <span className="text-xs text-slate-500">
                {uploadMeta.sizeKb} KB
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onReplace}
            disabled={isUploading}
            className="h-8 px-2.5 text-xs font-medium text-slate-700 hover:bg-white"
          >
            Ganti
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            disabled={isUploading}
            className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            title="Hapus berkas"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
