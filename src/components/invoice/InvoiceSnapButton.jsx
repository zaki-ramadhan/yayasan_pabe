"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2, Sparkles, ExternalLink } from "lucide-react";
import { useMidtransSnap } from "@/hooks/useMidtransSnap";

/**
 * Interactive button to trigger Midtrans Snap popup payment
 * @param {object} props
 * @param {object} props.donation
 * @param {string} [props.snapToken]
 */
export function InvoiceSnapButton({ donation, snapToken }) {
  const router = useRouter();
  const { isReady, isLoadingScript, payWithSnap } = useMidtransSnap();
  const [isProcessing, setIsProcessing] = useState(false);

  const activeToken = snapToken || donation?.snapToken;

  if (donation?.status === "PAID") {
    return null;
  }

  const handlePay = () => {
    if (!activeToken) {
      // If token is missing, redirect to fallback or show feedback
      return;
    }

    setIsProcessing(true);
    payWithSnap(activeToken, {
      onSuccess: () => {
        setIsProcessing(false);
        router.refresh();
      },
      onPending: () => {
        setIsProcessing(false);
        router.refresh();
      },
      onError: () => {
        setIsProcessing(false);
      },
      onClose: () => {
        setIsProcessing(false);
      },
    });
  };

  if (!activeToken) {
    return null;
  }

  return (
    <div className="p-4 rounded-xl bg-linear-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 shadow-2xs space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-900 tracking-wide uppercase">
            Instan & Otomatis
          </span>
        </div>
        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
          Midtrans Gateway
        </span>
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
          Bayar Cepat via Pop-up Midtrans
        </h3>
        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
          Pilih QRIS (GoPay/ShopeePay/BCA/dll) atau Virtual Account resmi. Status donasi otomatis lunas seketika.
        </p>
      </div>

      <button
        type="button"
        onClick={handlePay}
        disabled={isProcessing || isLoadingScript}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-sm transition-all shadow-xs hover:shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Membuka Pembayaran...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 text-white" />
            <span>Buka Pop-up Pembayaran</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </>
        )}
      </button>
    </div>
  );
}
