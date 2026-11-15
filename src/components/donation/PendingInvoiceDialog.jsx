"use client";

import { Clock, AlertTriangle, ArrowRight, PlusCircle, Loader2 } from "lucide-react";
import { formatRupiah, formatPaymentChannel } from "@/lib/formatters";
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
  pendingInvoice,
  onContinueExisting,
  onContinue,
  onCreateNew,
  isCancelling = false,
  isZakat = false,
}) {
  const invoice = existingInvoice || pendingInvoice;
  const handleContinue = onContinueExisting || onContinue;
  if (!invoice) return null;

  const isZakatContext =
    isZakat ||
    invoice.campaignSlug === "zakat" ||
    (typeof invoice.campaignTitle === "string" &&
      invoice.campaignTitle.toLowerCase().includes("zakat"));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isCancelling && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[85vh] p-0 overflow-hidden flex flex-col bg-white border border-slate-200" hideCloseButton={false}>
        <DialogHeader hideCloseButton={false}>
          <DialogTitle className="text-base sm:text-lg font-medium text-slate-900 leading-tight">
            {isZakatContext ? "Tagihan zakat masih aktif" : "Tagihan donasi masih aktif"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-4 text-sm">
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-900 text-xs sm:text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {isZakatContext ? (
                <>
                  Anda masih memiliki tagihan zakat aktif untuk{" "}
                  <span className="font-semibold text-slate-900">{invoice.campaignTitle}</span>. Apakah Anda ingin melanjutkan pembayaran tagihan ini atau membuat tagihan baru?
                </>
              ) : (
                <>
                  Anda masih memiliki tagihan donasi aktif untuk program{" "}
                  <span className="font-semibold text-slate-900">{invoice.campaignTitle}</span>. Apakah Anda ingin melanjutkan pembayaran tagihan ini atau membuat tagihan baru?
                </>
              )}
            </p>
          </div>

          {/* Kartu Ringkasan Tagihan Aktif */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 space-y-2 text-xs sm:text-sm">
            <div className="flex items-center justify-between text-slate-600">
              <span>Nomor invoice</span>
              <span className="font-mono font-medium text-slate-900">
                {invoice.invoiceId}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>{isZakatContext ? "Nominal zakat" : "Nominal donasi"}</span>
              <span className="font-semibold text-emerald-800 text-sm sm:text-base">
                {formatRupiah(invoice.amount)}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Saluran pembayaran</span>
              <span className="font-medium text-slate-900">
                {formatPaymentChannel(invoice.paymentChannel)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-amber-200/80 text-amber-900 font-medium">
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Sisa waktu bayar
              </span>
              <span>{invoice.remainingLabel || "Aktif"}</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 italic">
            *Catatan: Memilih &ldquo;Buat tagihan baru&rdquo; akan otomatis membatalkan tagihan lama di atas.
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2.5 sm:gap-3 bg-white border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onCreateNew}
            disabled={isCancelling}
            className="w-full sm:w-auto min-w-[84px] h-9 px-4 text-xs sm:text-sm font-medium border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
          >
            {isCancelling ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                Membatalkan...
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
            onClick={handleContinue}
            disabled={isCancelling}
            className="w-full sm:w-auto min-w-[96px] h-9 px-4 text-xs sm:text-sm font-medium cursor-pointer"
          >
            <span>Lanjutkan tagihan lama</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
