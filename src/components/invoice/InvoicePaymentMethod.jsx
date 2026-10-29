"use client";

import Image from "next/image";
import { Check, Copy } from "lucide-react";
import { ASSET_PATHS } from "@/lib/assetConstants";
import { InvoiceSnapButton } from "./InvoiceSnapButton";

/**
 * Payment method presentation (QRIS QR Code or Virtual Account info)
 * @param {object} props
 * @param {object} props.donation
 * @param {boolean} props.copiedVa
 * @param {Function} props.onCopyVa
 */
export function InvoicePaymentMethod({ donation, copiedVa, onCopyVa }) {
  const isQris = donation.paymentChannelType === "QRIS";

  return (
    <div className="space-y-5">
      {/* Tombol Pembayaran Midtrans Snap Interaktif */}
      {donation.snapToken && donation.status === "PENDING" && (
        <InvoiceSnapButton donation={donation} snapToken={donation.snapToken} />
      )}

      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            {donation.paymentChannelName}
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {isQris
              ? "Scan kode QR untuk memproses transaksi."
              : "Selesaikan transfer ke nomor virtual account berikut."}
          </p>
        </div>
        <span className="text-xs font-medium text-slate-600 px-2 py-0.5 rounded bg-slate-100">
          {isQris ? "QRIS" : "Virtual Account"}
        </span>
      </div>

      {isQris ? (
        <div className="flex flex-col items-center justify-center py-2 space-y-3.5 text-center">
          {/* Kotak Barcode QRIS Resmi Yayasan */}
          <div className="p-3 bg-white rounded-xl border border-slate-300 shadow-2xs flex flex-col items-center">
            <div className="relative w-[210px] h-[210px] sm:w-[230px] sm:h-[230px] overflow-hidden rounded-lg bg-white flex items-center justify-center">
              <Image
                src={ASSET_PATHS.PAYMENTS.QRIS_BARCODE}
                alt="QRIS Resmi Yayasan Payung Berkah"
                width={230}
                height={230}
                priority
                className="w-full h-full object-contain select-none pointer-events-none"
              />
            </div>
          </div>

          {/* Keterangan Resmi Sesuai Poster Standee */}
          <div className="space-y-1 text-center">
            <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight block">
              YAYASAN PAYUNG BERKAH
            </span>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-600 font-medium">
              <span>NMID : <strong className="text-slate-900 font-semibold">ID1026604741144</strong></span>
              <span className="text-slate-300">•</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-700">A01</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 max-w-sm leading-relaxed">
            Scan kode QR menggunakan aplikasi mobile banking (Livin&apos; by Mandiri, BRImo, BCA mobile) atau e-wallet berlogo QRIS.
          </p>
        </div>
      ) : (
        <div className="space-y-2 py-1">
          <span className="text-sm text-slate-600 block">Nomor Virtual Account</span>
          <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-base sm:text-lg font-semibold text-slate-900 tracking-wider">
              {donation.virtualAccountNumber || "88908123456789"}
            </span>
            <button
              type="button"
              onClick={() => onCopyVa(donation.virtualAccountNumber || "88908123456789")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-300 hover:bg-slate-100 text-xs font-medium text-slate-800 transition-colors cursor-pointer"
            >
              {copiedVa ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>Salin</span>
                </>
              )}
            </button>
          </div>
          <p className="text-sm text-slate-600">
            Transfer nominal yang sesuai melalui m-Banking atau ATM dengan nomor Virtual Account di atas.
          </p>
        </div>
      )}
    </div>
  );
}
