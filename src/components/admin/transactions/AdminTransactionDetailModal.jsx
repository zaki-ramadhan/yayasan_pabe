"use client";

import { Copy, Check, Heart } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { formatRupiah, formatDate, formatPaymentChannel } from "@/lib/formatters";
import { maskEmail, maskPhone } from "@/lib/security";
import { copyToClipboard } from "@/lib/clipboard";
import { toast } from "@/hooks/useToast";

export function AdminTransactionDetailModal({
  isOpen,
  onClose,
  transaction = null,
}) {
  const [copied, setCopied] = useState(false);

  if (!transaction) return null;

  const handleCopyInvoice = async () => {
    const success = await copyToClipboard(transaction.invoiceId);
    if (success) {
      setCopied(true);
      toast.success("Nomor invoice berhasil disalin.");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl max-h-[85vh] p-0 overflow-hidden flex flex-col bg-white border border-slate-200">
        <DialogHeader className="border-b border-slate-100">
          <DialogTitle className="text-base sm:text-lg font-medium text-slate-900 leading-tight">
            Rincian mutasi donasi
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 sm:px-6 space-y-5 text-sm">
          {/* Section 1: Identitas Donatur */}
          <div className="space-y-3 pb-5 border-b border-slate-100">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-700 font-normal shrink-0">Nama donatur</span>
              <span className="text-slate-900 text-right">
                {transaction.donorName}
                {transaction.isAnonymous && (
                  <span className="ml-1.5 text-xs text-slate-500 font-normal">(Anonim)</span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-700 font-normal shrink-0">Email</span>
              <span className="text-slate-900 text-right truncate">
                {transaction.donorEmail ? maskEmail(transaction.donorEmail) : "-"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-700 font-normal shrink-0">Nomor telepon</span>
              <span className="text-slate-900 text-right tabular-nums">
                {transaction.donorPhone ? maskPhone(transaction.donorPhone) : "-"}
              </span>
            </div>
          </div>

          {/* Section 2: Informasi Invoice & Pembayaran */}
          <div className="space-y-3 pb-5 border-b border-slate-100">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-700 font-normal shrink-0">Nomor invoice</span>
              <div className="flex items-center gap-1.5 text-right">
                <span className="text-slate-900 select-all font-mono text-xs sm:text-sm">{transaction.invoiceId}</span>
                <button
                  type="button"
                  onClick={handleCopyInvoice} aria-label="Salin invoice"
                  className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-700 font-normal shrink-0">Nominal donasi</span>
              <span className="text-slate-900 text-right tabular-nums">{formatRupiah(transaction.amount)}</span>
            </div>

            {transaction.uniqueCode > 0 && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-700 font-normal shrink-0">Penyesuaian sistem lama</span>
                <span className="text-slate-700 text-right tabular-nums">+{transaction.uniqueCode}</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-100">
              <span className="text-slate-900 font-medium shrink-0">Total pembayaran</span>
              <span className="font-semibold text-emerald-700 text-base text-right tabular-nums">
                {formatRupiah(transaction.totalAmount || transaction.amount)}
              </span>
            </div>
          </div>

          {/* Section 3: Program & Penyaluran */}
          <div className="space-y-3 pb-2">
            <div className="flex items-start justify-between gap-4">
              <span className="text-slate-700 font-normal shrink-0">Program donasi</span>
              <span className="text-slate-900 text-right max-w-[65%] leading-snug">
                {transaction.campaignTitle || transaction.campaign?.title || "Donasi Umum Yayasan"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-700 font-normal shrink-0">Saluran donasi</span>
              <span className="text-slate-900 text-right">
                {formatPaymentChannel(transaction.paymentChannel)}
                {transaction.paymentRef && (
                  <span className="text-xs text-slate-500 font-normal ml-1.5">({transaction.paymentRef})</span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-700 font-normal shrink-0">Waktu diterima</span>
              <span className="text-slate-900 text-right">
                {formatDate(transaction.paidAt || transaction.createdAt, { withDay: true, withTime: true })}
              </span>
            </div>
          </div>

          {/* Doa / Pesan Donatur */}
          {transaction.prayer && (
            <div className="pt-4 border-t border-slate-100 space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-xs font-medium uppercase tracking-wider">Doa &amp; pesan dari donatur</span>
              </div>
              <p className="text-sm text-slate-700 italic leading-relaxed bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                &ldquo;{transaction.prayer}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 sm:px-6 sm:py-3.5 border-t border-slate-100 bg-white shrink-0 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-9 min-w-[84px]"
          >
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
