"use client";

import { AlertCircle } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatRupiah } from "@/lib/formatters";

export function AdminTransactionVerifyDialog({
  isOpen,
  onClose,
  onConfirm,
  transaction = null,
  isLoading = false,
}) {
  if (!transaction) return null;

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      isLoading={isLoading}
      title="Verifikasi manual donasi"
      confirmLabel={isLoading ? "Memproses..." : "Ya, verifikasi sekarang"}
      confirmVariant="default"
    >
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm space-y-1.5 my-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500 font-normal">Nomor invoice:</span>
          <span className="font-medium text-slate-900">{transaction.invoiceId}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500 font-normal">Donatur:</span>
          <span className="font-medium text-slate-900">{transaction.donorName}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500 font-normal">Program tujuan:</span>
          <span className="font-medium text-slate-900 line-clamp-1 max-w-[220px]">
            {transaction.campaignTitle || "Donasi Umum"}
          </span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-slate-200">
          <span className="text-xs text-slate-700 font-medium">Nominal mutasi:</span>
          <span className="font-medium text-emerald-600 text-sm">
            {formatRupiah(transaction.amount)}
          </span>
        </div>
      </div>

      <div className="flex items-start gap-2 p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed font-normal">
          Setelah diverifikasi, status transaksi akan berubah menjadi <strong>Berhasil (PAID)</strong> dan dana akan langsung terakumulasi ke dalam kas program terkait.
        </p>
      </div>
    </ConfirmDialog>
  );
}
