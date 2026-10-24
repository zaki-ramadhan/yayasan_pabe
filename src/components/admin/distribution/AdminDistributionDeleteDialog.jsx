"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatRupiah } from "@/lib/formatters";

export function AdminDistributionDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  distribution = null,
  isLoading = false,
}) {
  if (!distribution) return null;

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      isLoading={isLoading}
      title="Hapus rekam penyaluran"
      confirmLabel={isLoading ? "Menghapus..." : "Hapus sekarang"}
      confirmVariant="destructive"
    >
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 space-y-1.5 my-2">
        <div>
          <span className="text-xs text-slate-500 block font-normal">Judul kegiatan:</span>
          <p className="font-medium text-slate-900 leading-snug">
            {distribution.title}
          </p>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-slate-200">
          <span className="text-xs text-slate-500 font-normal">Alokasi dana:</span>
          <span className="font-medium text-slate-900">
            {formatRupiah(distribution.disbursedAmount)}
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        Tindakan ini permanen. Pastikan data alokasi dana dan dokumentasi kegiatan tidak lagi diperlukan untuk laporan audit.
      </p>
    </ConfirmDialog>
  );
}
