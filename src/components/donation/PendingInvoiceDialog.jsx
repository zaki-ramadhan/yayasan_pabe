"use client";

import { useState, useEffect } from "react";
import { ClockCircleIcon as Clock } from "@solar-icons/react/line-duotone/clock-circle";
import { ArrowRightIcon as ArrowRight } from "@solar-icons/react/line-duotone/arrow-right";
import { LoaderIcon as Loader2 } from "@solar-icons/react/linear/loader";
import { formatRupiah, formatPaymentChannel } from "@/lib/formatters";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";

function useNow(intervalMs = 1000, enabled = true) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!enabled) return;
    const timer = setInterval(() => {
      setNow(Date.now());
    }, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs, enabled]);

  return now;
}

function formatRemainingLive(ms) {
  if (ms <= 0) return "Kedaluwarsa";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours} jam ${minutes} menit`;
  }
  if (minutes > 0) {
    return `${minutes} menit ${seconds} dtk`;
  }
  return `${seconds} dtk`;
}

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

  const now = useNow(1000, isOpen && Boolean(invoice?.expiredAt));

  if (!invoice) return null;

  const remainingMs = invoice?.expiredAt
    ? Math.max(0, new Date(invoice.expiredAt).getTime() - now)
    : 0;
  const isExpired = remainingMs <= 0;

  const isZakatContext =
    isZakat ||
    invoice.campaignSlug === "zakat" ||
    (typeof invoice.campaignTitle === "string" &&
      invoice.campaignTitle.toLowerCase().includes("zakat"));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isCancelling && onClose()}>
      <DialogContent
        className="sm:min-w-[420px] sm:max-w-md min-h-[220px] max-h-[85vh] p-0 overflow-hidden flex flex-col bg-white border border-slate-200 shadow-xl"
        hideCloseButton={false}
      >
        <DialogHeader hideCloseButton={false}>
          <DialogTitle className="text-base sm:text-lg font-medium text-slate-900 leading-tight">
            {isExpired
              ? isZakatContext
                ? "Tagihan zakat telah kedaluwarsa"
                : "Tagihan donasi telah kedaluwarsa"
              : isZakatContext
                ? "Tagihan zakat masih aktif"
                : "Tagihan donasi masih aktif"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-3.5 text-sm">
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            {isExpired ? (
              <>
                Tagihan {isZakatContext ? "zakat" : "donasi"} sebelumnya untuk{" "}
                <strong className="font-semibold text-slate-900">{invoice.campaignTitle}</strong>{" "}
                telah melewati batas waktu pembayaran. Anda dapat langsung menerbitkan tagihan baru.
              </>
            ) : isZakatContext ? (
              <>
                Anda masih memiliki tagihan zakat aktif untuk{" "}
                <strong className="font-semibold text-slate-900">{invoice.campaignTitle}</strong>.
                Apakah Anda ingin melanjutkan pembayaran tagihan ini atau membuat tagihan baru?
              </>
            ) : (
              <>
                Anda masih memiliki tagihan donasi aktif untuk program{" "}
                <strong className="font-semibold text-slate-900">{invoice.campaignTitle}</strong>.
                Apakah Anda ingin melanjutkan pembayaran tagihan ini atau membuat tagihan baru?
              </>
            )}
          </p>

          <div className="py-2.5 border-y border-slate-100 text-xs sm:text-sm space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Nomor invoice</span>
              <span className="font-mono font-medium text-slate-900">
                {invoice.invoiceId}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">{isZakatContext ? "Nominal zakat" : "Nominal donasi"}</span>
              <span className="font-semibold text-slate-900">
                {formatRupiah(invoice.amount)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Saluran pembayaran</span>
              <span className="text-slate-800">
                {formatPaymentChannel(invoice.paymentChannel)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Sisa waktu bayar
              </span>
              <span
                className={
                  isExpired
                    ? "font-medium text-rose-600"
                    : "font-medium text-amber-700"
                }
              >
                {formatRemainingLive(remainingMs, invoice.remainingLabel)}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            {isExpired ? (
              <span>
                Tagihan lama tidak dapat digunakan lagi dan akan otomatis digantikan oleh tagihan baru.
              </span>
            ) : (
              <>
                Catatan: Memilih{" "}
                <span className="font-medium text-slate-700">&ldquo;Buat tagihan baru&rdquo;</span>{" "}
                akan otomatis membatalkan tagihan lama.
              </>
            )}
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2.5 sm:gap-3 bg-white border-t border-slate-100">
          <Button
            type="button"
            variant={isExpired ? "default" : "outline"}
            onClick={onCreateNew}
            disabled={isCancelling}
            className="w-full sm:w-auto min-w-[84px] h-9 px-4 text-xs sm:text-sm font-medium border-slate-300 cursor-pointer"
          >
            {isCancelling ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                Menyiapkan tagihan...
              </>
            ) : (
              <span>Buat tagihan baru</span>
            )}
          </Button>

          {!isExpired && (
            <Button
              type="button"
              variant="default"
              onClick={handleContinue}
              disabled={isCancelling}
              className="w-full sm:w-auto min-w-[96px] h-9 px-4 text-xs sm:text-sm font-medium cursor-pointer"
            >
              <span>Lanjutkan tagihan lama</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
