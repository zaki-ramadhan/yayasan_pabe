"use client";

import { ShieldCheck, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border border-slate-200">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-medium text-slate-900 leading-tight">
                Verifikasi manual donasi
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 font-normal mt-0.5">
                Konfirmasi penerimaan dana transfer pada rekening yayasan.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm space-y-1.5 my-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 font-normal">Nomor invoice:</span>
            <span className="font-medium text-slate-900">{transaction.invoiceId}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 font-normal">Donatur:</span>
            <span className="font-medium text-slate-900">{transaction.donorName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 font-normal">Program tujuan:</span>
            <span className="font-medium text-slate-900 line-clamp-1 max-w-[220px]">
              {transaction.campaignTitle || "Donasi Umum"}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-200">
            <span className="text-sm text-slate-700 font-medium">Nominal mutasi:</span>
            <span className="font-medium text-emerald-600 text-sm">
              {formatRupiah(transaction.amount)}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2 p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg text-sm text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-normal">
            Setelah diverifikasi, status transaksi akan berubah menjadi <strong>Berhasil (PAID)</strong> dan dana akan langsung terakumulasi ke dalam kas program terkait.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="w-full sm:w-auto px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isLoading ? "Memproses..." : "Ya, verifikasi sekarang"}</span>
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
