"use client";

import { Clock, AlertTriangle, ArrowRight, PlusCircle, Loader2 } from "lucide-react";
import { formatRupiah } from "@/lib/formatters";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";

/**
 * Dialog konfirmasi duplikasi invoice:
 * Muncul saat donatur hendak berdonasi pada program yang masih memiliki tagihan PENDING aktif.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {object} props.existingInvoice
 * @param {Function} props.onContinueExisting
 * @param {Function} props.onCreateNew
 * @param {boolean} [props.isCancelling=false]
 */
export function PendingInvoiceDialog({
  isOpen,
  onClose,
  existingInvoice,
  onContinueExisting,
  onCreateNew,
  isCancelling = false,
}) {
  if (!existingInvoice) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isCancelling && onClose()}>
      <DialogContent className="max-w-md" hideCloseButton={false}>
        <DialogHeader hideCloseButton={false}>
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-amber-100 p-2 text-amber-800">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-slate-900">
                Tagihan Donasi Masih Aktif
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Anda memiliki tagihan yang belum diselesaikan
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-5 sm:p-6 space-y-4 text-sm">
          <p className="text-slate-600 leading-relaxed">
            Anda masih memiliki tagihan donasi aktif untuk program{" "}
            <span className="font-semibold text-slate-900">
              {existingInvoice.campaignTitle}
            </span>
            . Apakah Anda ingin melanjutkan pembayaran tagihan ini atau membuat tagihan baru?
          </p>

          {/* Kartu Ringkasan Tagihan Aktif */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 space-y-2 text-xs sm:text-sm">
            <div className="flex items-center justify-between text-slate-600">
              <span>Nomor invoice</span>
              <span className="font-mono font-medium text-slate-900">
                {existingInvoice.invoiceId}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Nominal donasi</span>
              <span className="font-semibold text-emerald-800 text-sm sm:text-base">
                {formatRupiah(existingInvoice.amount)}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Saluran pembayaran</span>
              <span className="font-medium text-slate-900 uppercase">
                {existingInvoice.paymentChannel?.replace("_", " ")}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-amber-200/80 text-amber-900 font-medium">
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Sisa waktu bayar
              </span>
              <span>{existingInvoice.remainingLabel || "Aktif"}</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 italic">
            *Catatan: Memilih &ldquo;Buat tagihan baru&rdquo; akan otomatis membatalkan tagihan lama di atas.
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 bg-slate-50 p-4 sm:p-5 border-t border-slate-200">
          <Button
            type="button"
            variant="outline"
            onClick={onCreateNew}
            disabled={isCancelling}
            className="w-full sm:w-auto h-10 text-xs sm:text-sm font-medium border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
          >
            {isCancelling ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                Membatalkan tagihan lama...
              </>
            ) : (
              <>
                <PlusCircle className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                Buat tagihan baru
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="warning"
            onClick={onContinueExisting}
            disabled={isCancelling}
            className="w-full sm:w-auto h-10 text-xs sm:text-sm font-medium cursor-pointer"
          >
            <span>Lanjutkan tagihan lama</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
