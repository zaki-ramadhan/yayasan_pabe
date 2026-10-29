"use client";

import Image from "next/image";
import { AlertTriangle, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatBytes, formatDate } from "@/lib/formatters";

/**
 * Modal konfirmasi penghapusan berkas sampah R2 (baik satuan maupun banyak berkas sekaligus).
 *
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   onConfirm: () => void,
 *   itemsToDelete: Array<{ key: string, url: string, size: number, lastModified: string|Date, folder: string }>,
 *   isLoading?: boolean,
 * }} props
 */
export function StorageDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  itemsToDelete = [],
  isLoading = false,
}) {
  if (!itemsToDelete || itemsToDelete.length === 0) return null;

  const count = itemsToDelete.length;
  const totalBytes = itemsToDelete.reduce((sum, item) => sum + (item.size || 0), 0);
  const isSingle = count === 1;
  const singleItem = isSingle ? itemsToDelete[0] : null;

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      isLoading={isLoading}
      title={isSingle ? "Hapus berkas sampah dari R2" : `Hapus ${count} berkas sampah dari R2`}
      confirmLabel={isLoading ? "Menghapus..." : isSingle ? "Hapus permanen" : `Hapus ${count} berkas`}
      confirmVariant="destructive"
    >
      <div className="space-y-3 py-1">
        {/* Warning Alert */}
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-rose-900 text-xs leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Tindakan ini tidak dapat dibatalkan.</p>
            <p className="text-rose-700 mt-0.5">
              Berkas fisik akan dihapus permanen dari bucket Cloudflare R2 dan membebaskan kuota sebesar{" "}
              <strong className="text-rose-900 font-semibold">{formatBytes(totalBytes)}</strong>.
            </p>
          </div>
        </div>

        {/* Single Item Preview */}
        {isSingle && singleItem && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
            <div className="w-14 h-14 rounded-md bg-slate-200 overflow-hidden relative shrink-0 border border-slate-300">
              {singleItem.url ? (
                <Image
                  src={singleItem.url}
                  alt={singleItem.key}
                  fill
                  className="object-cover"
                  sizes="56px"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <Trash2 className="w-5 h-5" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 text-xs">
              <p className="font-medium text-slate-900 truncate" title={singleItem.key}>
                {singleItem.key.split("/").pop()}
              </p>
              <p className="text-slate-500 mt-0.5">
                Folder: <span className="font-mono text-slate-700">{singleItem.folder}</span> • {formatBytes(singleItem.size)}
              </p>
              <p className="text-slate-400 mt-0.5">
                Diunggah: {formatDate(singleItem.lastModified, { withDay: false, withTime: true })}
              </p>
            </div>
          </div>
        )}

        {/* Multiple Items List Summary */}
        {!isSingle && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5 max-h-40 overflow-y-auto">
            <p className="font-medium text-slate-800">Daftar berkas yang akan dihapus:</p>
            <ul className="divide-y divide-slate-200/60 font-mono text-[11px] text-slate-600">
              {itemsToDelete.slice(0, 5).map((item) => (
                <li key={item.key} className="py-1 flex items-center justify-between gap-2">
                  <span className="truncate">{item.key}</span>
                  <span className="shrink-0 text-slate-500 font-sans">{formatBytes(item.size)}</span>
                </li>
              ))}
              {count > 5 && (
                <li className="pt-1.5 text-center text-slate-500 font-sans font-medium">
                  ...dan {count - 5} berkas lainnya
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </ConfirmDialog>
  );
}
