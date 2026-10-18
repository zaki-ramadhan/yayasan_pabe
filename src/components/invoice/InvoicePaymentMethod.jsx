"use client";

import { QRCodeSVG } from "qrcode.react";
import { Check, Copy } from "lucide-react";

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
        <div className="flex flex-col items-center justify-center py-2 space-y-3 text-center">
          <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
            <QRCodeSVG
              value={`00020101021226600016ID.CO.PABE.WWW01189360099900000123450215INV${donation.invoiceId}520458125303360540${donation.totalAmount}5802ID5912PABE_CHARITY6007JAKARTA6304ABCD`}
              size={190}
              level="M"
            />
          </div>
          <div className="space-y-0.5">
            <span className="text-base font-semibold text-slate-900 block">
              YAYASAN PABE
            </span>
            <span className="text-xs text-slate-500 block">NMID: ID102003948201</span>
          </div>
          <p className="text-sm text-slate-600 max-w-sm">
            Scan kode QR menggunakan aplikasi mobile banking (BCA, Livin Mandiri, BRI, BSI) atau e-wallet (GoPay, OVO, Dana, ShopeePay).
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
