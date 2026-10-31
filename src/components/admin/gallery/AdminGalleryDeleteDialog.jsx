"use client";

import Image from "next/image";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatDate } from "@/lib/formatters";

export function AdminGalleryDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  item = null,
  isLoading = false,
}) {
  if (!item) return null;

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      isLoading={isLoading}
      title="Hapus foto dokumentasi"
      confirmLabel={isLoading ? "Menghapus..." : "Hapus sekarang"}
      confirmVariant="destructive"
    >
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 space-y-2.5 my-2">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-md bg-slate-200 overflow-hidden relative shrink-0 border border-slate-300">
            <Image
              src={item.imageUrl}
              alt={item.title || "Dokumentasi"}
              fill
              className="object-cover"
              sizes="64px"
              unoptimized
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-slate-900 truncate">
              {item.title || "Dokumentasi Kegiatan"}
            </p>
            <span className="text-xs text-slate-500 block">
              Kategori: {item.category || "Umum"}
            </span>
            <span className="text-xs text-slate-400 block">
              {formatDate(item.activityDate || item.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        Foto akan dihapus secara permanen dari sistem.
      </p>
    </ConfirmDialog>
  );
}
