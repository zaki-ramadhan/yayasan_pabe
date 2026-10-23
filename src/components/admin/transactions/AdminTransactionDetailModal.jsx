"use client";

import { Copy, Check, Heart, ShieldCheck, Clock } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatRupiah, formatDate } from "@/lib/formatters";
import { maskEmail } from "@/lib/security";
import { copyToClipboard } from "@/lib/clipboard";
import { toast } from "@/hooks/use-toast";

export function AdminTransactionDetailModal({
  isOpen,
  onClose,
  transaction = null,
  onOpenVerify,
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

  const isPending = transaction.status === "PENDING";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto p-5 sm:p-6 bg-white border border-slate-200">
        <DialogHeader className="pb-3 border-b border-slate-200">
          <div className="flex items-center justify-between gap-2">
            <div>
              <DialogTitle className="text-base sm:text-lg font-medium text-slate-900 leading-tight">
                Rincian mutasi donasi
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 font-normal mt-0.5">
                Informasi lengkap transaksi pembayaran dan amanah donatur.
              </DialogDescription>
            </div>
            {isPending ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 shrink-0">
                Menunggu
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 shrink-0">
                Berhasil
              </span>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-sm">
          {/* Invoice & Nominal Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 font-normal">Nomor invoice:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-slate-900">{transaction.invoiceId}</span>
                <button
                  type="button"
                  onClick={handleCopyInvoice}
                  title="Salin invoice"
                  className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 font-normal">Nominal donasi:</span>
              <span className="font-medium text-slate-900">{formatRupiah(transaction.amount)}</span>
            </div>

            {transaction.uniqueCode > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 font-normal">Kode unik:</span>
                <span className="font-medium text-slate-700">+{transaction.uniqueCode}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1 border-t border-slate-200">
              <span className="text-sm text-slate-700 font-medium">Total pembayaran:</span>
              <span className="font-medium text-primary text-base">
                {formatRupiah(transaction.totalAmount || transaction.amount)}
              </span>
            </div>
          </div>

          {/* Program & Metode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 border border-slate-200 rounded-lg space-y-1">
              <span className="text-sm text-slate-500 block font-normal">Program tujuan:</span>
              <span className="font-medium text-slate-900 line-clamp-2 leading-snug">
                {transaction.campaignTitle || transaction.campaign?.title || "Donasi Umum Yayasan"}
              </span>
            </div>

            <div className="p-3 border border-slate-200 rounded-lg space-y-1">
              <span className="text-sm text-slate-500 block font-normal">Metode pembayaran:</span>
              <span className="font-medium text-slate-900 block uppercase">
                {transaction.paymentChannel}
              </span>
              {transaction.paymentRef && (
                <span className="text-sm text-slate-500 block">Ref: {transaction.paymentRef}</span>
              )}
            </div>
          </div>

          {/* Data Donatur */}
          <div className="p-3.5 border border-slate-200 rounded-lg space-y-2">
            <span className="text-sm text-slate-700 block font-medium">
              Identitas donatur
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-sm text-slate-500 block font-normal">Nama donatur:</span>
                <span className="font-medium text-slate-900">
                  {transaction.donorName}
                  {transaction.isAnonymous && (
                    <span className="ml-1.5 text-sm text-slate-500 font-normal">(Anonim)</span>
                  )}
                </span>
              </div>
              <div>
                <span className="text-sm text-slate-500 block font-normal">Email:</span>
                <span className="font-medium text-slate-900">
                  {transaction.donorEmail ? maskEmail(transaction.donorEmail) : "-"}
                </span>
              </div>
              <div>
                <span className="text-sm text-slate-500 block font-normal">Nomor telepon:</span>
                <span className="font-medium text-slate-900">
                  {transaction.donorPhone || "-"}
                </span>
              </div>
              <div>
                <span className="text-sm text-slate-500 block font-normal">Waktu donasi:</span>
                <span className="font-medium text-slate-900">
                  {formatDate(transaction.createdAt, { withDay: true, withTime: true })}
                </span>
              </div>
            </div>
          </div>

          {/* Doa / Pesan Donatur */}
          {transaction.prayer && (
            <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-lg space-y-1">
              <div className="flex items-center gap-1.5 text-amber-800">
                <Heart className="w-3.5 h-3.5" />
                <span className="text-sm font-medium">Doa &amp; pesan dari donatur:</span>
              </div>
              <p className="text-sm text-slate-800 italic leading-relaxed">
                &ldquo;{transaction.prayer}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
          {isPending && onOpenVerify && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenVerify(transaction);
              }}
              className="h-10 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verifikasi donasi sekarang</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors ml-auto cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
