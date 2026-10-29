"use client";

import Image from "next/image";
import { Clock, Copy, Check } from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/formatters";
import { DashedDivider } from "@/components/ui/DashedDivider";
import { ASSET_PATHS } from "@/lib/assetConstants";

/**
 * Physical receipt / bill card presentation for donation invoices
 * @param {object} props
 * @param {object} props.donation
 * @param {object} props.timeLeft
 * @param {boolean} props.copiedInvoice
 * @param {Function} props.onCopyInvoiceId
 * @param {string} [props.activePrayer]
 * @param {string} [props.campaignImage]
 */
export function InvoiceReceiptCard({
  donation,
  timeLeft,
  copiedInvoice,
  onCopyInvoiceId,
  activePrayer,
  campaignImage,
}) {
  return (
    <div className="relative">
      {/* Section Atas: Header Tagihan & Batas Waktu */}
      <div className="bg-white rounded-t-xl border-t border-x border-slate-300 p-5 sm:p-6 sm:py-4 pb-4 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-slate-600 block">
            Tagihan Donasi
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            Menunggu Pembayaran
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 text-sm">
          <button
            type="button"
            onClick={onCopyInvoiceId}
            aria-label="Salin nomor invoice"
            className="inline-flex items-center gap-1.5 text-slate-900 font-medium hover:text-slate-700 transition-colors cursor-pointer group text-left"
          >
            <span className="select-all">{donation.invoiceId}</span>
            {copiedInvoice ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <Copy className="w-3 h-3 text-slate-400 group-hover:text-slate-600 shrink-0 transition-colors" />
            )}
          </button>
          <div className="text-slate-600">
            <span className="font-semibold text-slate-900">
              {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
            </span>{" "}
            tersisa
          </div>
        </div>
      </div>

      {/* Divider Perforasi dengan Notch Sobekan di Sisi Kiri & Kanan */}
      <div className="relative h-5 flex items-center bg-white -my-px">
        {/* Notch Kiri */}
        <svg
          width="10"
          height="20"
          viewBox="0 0 10 20"
          className="absolute left-0 top-0 block pointer-events-none"
          aria-hidden="true"
        >
          <path d="M 0 0 A 10 10 0 0 1 0 20 Z" fill="#f8fafc" stroke="none" />
          <path d="M 0 0 A 10 10 0 0 1 0 20" fill="none" stroke="#cbd5e1" strokeWidth="1" />
        </svg>

        {/* Garis Putus-Putus */}
        <DashedDivider className="mx-3" />

        {/* Notch Kanan */}
        <svg
          width="10"
          height="20"
          viewBox="0 0 10 20"
          className="absolute right-0 top-0 block pointer-events-none"
          aria-hidden="true"
        >
          <path d="M 10 0 A 10 10 0 0 0 10 20 Z" fill="#f8fafc" stroke="none" />
          <path d="M 10 0 A 10 10 0 0 0 10 20" fill="none" stroke="#cbd5e1" strokeWidth="1" />
        </svg>
      </div>

      {/* Section Bawah: Total & Rincian Transaksi */}
      <div className="bg-white border-x border-slate-300 p-5 sm:p-6 sm:py-4 pt-3 space-y-4">
        {/* Total Transfer Row */}
        <div className="space-y-1">
          <span className="text-sm text-slate-600 block">Total yang Harus Ditransfer</span>
          <span className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight block">
            {formatRupiah(donation.totalAmount)}
          </span>

          {donation.uniqueCode > 0 && (
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
              Penting: Transfer nominal tepat hingga 3 digit terakhir (<span className="font-semibold text-slate-700">+{donation.uniqueCode}</span>) untuk verifikasi otomatis.
            </p>
          )}
        </div>

        {/* Rincian Transaksi */}
        <div className="space-y-3 pb-1">
          <span className="text-sm text-slate-600 block">Rincian Donasi</span>
          <div className="space-y-2.5 text-sm">
            <div className="space-y-1.5 pt-0.5">
              <div className="flex items-center gap-3">
                {campaignImage ? (
                  <Image
                    src={campaignImage}
                    alt={donation.campaignTitle}
                    width={48}
                    height={48}
                    unoptimized
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-md object-cover shrink-0 border border-slate-200"
                  />
                ) : (
                  <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-md bg-white border border-slate-200 shrink-0 p-1 flex items-center justify-center">
                    <Image
                      src={ASSET_PATHS.BRANDING.LOGO}
                      alt="Logo Yayasan PABE"
                      width={40}
                      height={40}
                      className="w-full h-full object-contain select-none"
                    />
                  </div>
                )}
                <p className="text-xs sm:text-sm font-medium text-slate-900 line-clamp-2 leading-snug">
                  {donation.campaignTitle}
                </p>
              </div>
            </div>

            <div className="flex justify-between gap-3 text-slate-600 pt-1">
              <span className="shrink-0">Donatur</span>
              <span className="font-medium text-slate-900 text-right">
                {donation.donorName}
                {donation.isAnonymous && (
                  <span className="text-xs text-slate-500 font-normal ml-1.5">(Anonim)</span>
                )}
              </span>
            </div>
            <div className="flex justify-between gap-3 text-slate-600">
              <span className="shrink-0">Waktu Tagihan</span>
              <span className="font-medium text-slate-900 text-right">
                {formatDate(donation.createdAt, { withTime: true })}
              </span>
            </div>
            <div className="flex justify-between gap-3 text-slate-600">
              <span className="shrink-0">Metode Bayar</span>
              <span className="font-medium text-slate-900 text-right">
                {donation.paymentChannelName}
              </span>
            </div>
            <div className="flex justify-between gap-3 text-slate-600">
              <span className="shrink-0">Donasi Pokok</span>
              <span className="font-medium text-slate-900">{formatRupiah(donation.amount)}</span>
            </div>
            {donation.uniqueCode > 0 && (
              <div className="flex justify-between gap-3 text-slate-600">
                <span className="shrink-0">Kode Unik</span>
                <span className="font-medium text-slate-900">+{donation.uniqueCode}</span>
              </div>
            )}
            <div className="flex justify-between gap-3 text-slate-600">
              <span className="shrink-0">Biaya Layanan</span>
              <span className="font-medium text-slate-900">
                {donation.adminFee > 0 ? formatRupiah(donation.adminFee) : "Gratis"}
              </span>
            </div>
            {activePrayer && (
              <div className="flex justify-between gap-3">
                <span className="shrink-0 text-slate-600">Doa Kebaikan</span>
                <span className="font-medium text-slate-900 text-right italic text-xs sm:text-sm break-words max-w-[200px]">
                  &ldquo;{activePrayer}&rdquo;
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sisi Bawah Bergerigi Lingkaran Halus */}
      <div className="relative w-full h-3.5 select-none -mt-px overflow-hidden border-x border-slate-300">
        <svg
          className="w-full h-3.5 block"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="receipt-scallops"
              x="0"
              y="0"
              width="24"
              height="14"
              patternUnits="userSpaceOnUse"
            >
              <rect width="24" height="14" fill="#f8fafc" />
              <path
                d="M 0 0 L 24 0 L 24 12 L 19 12 A 7 7 0 0 0 5 12 L 0 12 Z"
                fill="#ffffff"
                stroke="none"
              />
              <path
                d="M 0 12 L 5 12 A 7 7 0 0 1 19 12 L 24 12"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="1.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="14" fill="url(#receipt-scallops)" />
        </svg>
      </div>
    </div>
  );
}
