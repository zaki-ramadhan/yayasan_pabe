"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, ArrowRight, X, Loader2 } from "lucide-react";
import { formatRupiah } from "@/lib/formatters";
import { toast } from "@/hooks/useToast";
import { safeFetch } from "@/lib/safeFetch";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

/**
 * Banner Pengingat Tagihan Aktif Donatur (Pending Invoice Reminder)
 * Ditampilkan di atas dashboard ringkasan jika donatur memiliki tagihan yang belum diselesaikan.
 *
 * @param {object} props
 * @param {Array<object>} props.invoices - Daftar invoice aktif yang berstatus PENDING
 * @param {Function} [props.onInvoiceCancelled] - Callback saat donatur membatalkan invoice
 */
export function DonorPendingInvoiceBanner({ invoices = [], onInvoiceCancelled }) {
  const [cancellingInvoiceId, setCancellingInvoiceId] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  // Saring hanya tagihan yang aktif dan memiliki tanggal kedaluwarsa
  const sortedInvoices = [...(invoices || [])]
    .filter((inv) => Boolean(inv?.expiredAt))
    .sort((a, b) => new Date(a.expiredAt).getTime() - new Date(b.expiredAt).getTime());

  const activeInvoice = sortedInvoices[0] || null;
  const additionalCount = Math.max(0, sortedInvoices.length - 1);

  const [prevExpiredAt, setPrevExpiredAt] = useState(activeInvoice?.expiredAt);
  if (activeInvoice?.expiredAt !== prevExpiredAt) {
    setPrevExpiredAt(activeInvoice?.expiredAt);
    if (!activeInvoice?.expiredAt) {
      setTimeLeft("");
    }
  }

  useEffect(() => {
    if (!activeInvoice?.expiredAt) return;

    const targetTime = new Date(activeInvoice.expiredAt).getTime();

    let interval = null;

    const updateCountdown = () => {
      const difference = targetTime - Date.now();
      if (difference <= 0) {
        setTimeLeft("");
        if (interval) clearInterval(interval);
        onInvoiceCancelled?.(activeInvoice.invoiceId);
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      if (hours > 0) {
        setTimeLeft(`${hours}j ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${minutes}m ${seconds < 10 ? `0${seconds}` : seconds}s`);
      }
    };

    updateCountdown();
    if (targetTime > Date.now()) {
      interval = setInterval(updateCountdown, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeInvoice?.expiredAt, activeInvoice?.invoiceId, onInvoiceCancelled]);

  if (!activeInvoice) {
    return null;
  }

  const handleExecuteCancel = async () => {
    const invoiceId = activeInvoice?.invoiceId;
    if (!invoiceId) return;

    try {
      setCancellingInvoiceId(invoiceId);
      const res = await safeFetch("/api/user/donations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId,
          action: "cancel",
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal membatalkan tagihan.");
      }

      toast.success("Tagihan donasi berhasil dibatalkan.");
      setIsConfirmOpen(false);
      onInvoiceCancelled?.(invoiceId);
    } catch (err) {
      toast.error(err.message || "Terjadi kesalahan saat membatalkan tagihan.");
    } finally {
      setCancellingInvoiceId(null);
    }
  };

  return (
    <>
      <aside
        aria-label="Pengingat donasi menunggu pembayaran"
        className="relative overflow-hidden rounded-xl border border-stone-800 bg-gradient-to-r from-[#BC430D] via-[#6F2908] to-[#241705] p-4 sm:p-4.5 text-stone-100 shadow-md transition-all"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          {/* Kolom Informasi Tagihan */}
          <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
            {/* 3D Warning Icon Badge Glowing Amber */}
            <div className="relative inline-flex items-center justify-center shrink-0 mt-0.5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/15 border border-white/20 flex items-center justify-center shadow-xs">
                <div className="w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-full bg-gradient-to-b from-[#F09410] via-[#FF884D] to-[#BC430D] border-t border-t-[#FFB77D] border-x border-x-[#F09410] border-b-[2.5px] border-b-[#7A2402] text-white flex items-center justify-center shadow-[inset_0_1.5px_1.5px_rgba(255,255,255,0.6),0_4px_8px_rgba(240,148,16,0.4)]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4.5 h-4.5 sm:w-5 sm:h-5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
                    aria-hidden="true"
                  >
                    <line x1="12" y1="6" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-white/15 border border-white/20 px-2.5 py-0.5 text-xs font-bold text-amber-200 shadow-2xs">
                  <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>Sisa waktu: {timeLeft}</span>
                </span>
                {additionalCount > 0 && (
                  <span className="text-xs font-semibold text-white/90 bg-white/15 border border-white/20 px-1.5 py-0.5 rounded shadow-2xs">
                    +{additionalCount} tagihan lainnya
                  </span>
                )}
              </div>

              <p className="text-sm font-medium text-stone-200 leading-snug">
                Ada donasi menunggu pembayaran sebesar{" "}
                <span className="font-bold text-amber-300 underline decoration-amber-400/50 decoration-2 underline-offset-2">
                  {formatRupiah(activeInvoice.amount)}
                </span>{" "}
                {activeInvoice.campaignTitle ? (
                  <>
                    untuk program{" "}
                    <span className="font-bold text-white">
                      {activeInvoice.campaignTitle}
                    </span>
                  </>
                ) : (
                  <span className="font-bold text-white">
                    (Donasi Umum)
                  </span>
                )}
                .
              </p>
            </div>
          </div>

          {/* Kolom Aksi */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={() => setIsConfirmOpen(true)}
              disabled={cancellingInvoiceId === activeInvoice.invoiceId}
              aria-label="Batalkan tagihan"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              {cancellingInvoiceId === activeInvoice.invoiceId ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <X className="w-3.5 h-3.5 text-white/70" />
              )}
              <span>Batalkan</span>
            </button>

            <Link href={`/invoice/${activeInvoice.invoiceId}`}>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg text-xs font-bold text-stone-950 bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:brightness-95 transition-all shadow-xs cursor-pointer"
              >
                <span>Lanjutkan pembayaran</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Modal Dialog Konfirmasi Pembatalan Donasi */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleExecuteCancel}
        title="Batalkan tagihan donasi?"
        description={`Apakah Anda yakin ingin membatalkan tagihan donasi sebesar ${formatRupiah(
          activeInvoice?.amount || 0
        )} untuk program "${activeInvoice?.campaignTitle || ""}"? Tagihan yang dibatalkan tidak dapat dilanjutkan kembali.`}
        confirmLabel="Ya, batalkan"
        confirmVariant="destructive"
        cancelLabel="Kembali"
        isLoading={Boolean(cancellingInvoiceId)}
      />
    </>
  );
}
