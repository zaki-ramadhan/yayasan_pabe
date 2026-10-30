"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, Copy, RefreshCw, CheckCircle2, ChevronRight } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { ASSET_PATHS } from "@/lib/assetConstants";
import { copyToClipboard } from "@/lib/clipboard";
import { toast } from "@/hooks/useToast";
import { safeFetch } from "@/lib/safeFetch";

/**
 * Payment method presentation (Direct Headless Midtrans QRIS, BRI VA, or Mandiri Bill)
 * @param {object} props
 * @param {object} props.donation
 * @param {boolean} props.copiedVa
 * @param {Function} props.onCopyVa
 */
export function InvoicePaymentMethod({ donation, copiedVa, onCopyVa, onStatusChange }) {
  const router = useRouter();
  const [copiedBiller, setCopiedBiller] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const isQris = donation.paymentChannelType === "QRIS" || donation.paymentChannelId === "qris";
  const isMandiri = donation.paymentChannelId === "mandiri_va";
  const isBri = donation.paymentChannelId === "bri_va";

  const billerCode = donation.billerCode || "70012";
  const billKey = donation.billKey || donation.virtualAccountNumber || "";
  const briVaNumber = donation.virtualAccountNumber || "";

  // Auto-polling status check when invoice is PENDING
  useEffect(() => {
    if (!donation?.invoiceId || donation.status === "PAID") return;

    const interval = setInterval(async () => {
      try {
        const res = await safeFetch(`/api/donations?invoiceId=${encodeURIComponent(donation.invoiceId)}`);
        const json = await res.json();
        if (json.success && json.data?.status === "PAID") {
          toast.success("Alhamdulillah, pembayaran donasi telah terverifikasi!");
          onStatusChange?.("PAID", json.data.paidAt);
          router.refresh();
        }
      } catch {
        // Silent polling error
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [donation?.invoiceId, donation?.status, onStatusChange, router]);

  const handleManualCheckStatus = async () => {
    if (!donation?.invoiceId) return;
    try {
      setIsCheckingStatus(true);
      const res = await safeFetch(`/api/donations?invoiceId=${encodeURIComponent(donation.invoiceId)}`);
      const json = await res.json();
      if (json.success && json.data?.status === "PAID") {
        toast.success("Alhamdulillah, donasi Anda telah terbayar!");
        onStatusChange?.("PAID", json.data.paidAt);
        router.refresh();
      } else {
        toast.info("Menunggu pembayaran dari sistem perbankan. Silakan periksa kembali setelah transfer.");
      }
    } catch {
      toast.error("Gagal memeriksa status pembayaran. Silakan coba sesaat lagi.");
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleCopyText = async (text, setCopiedFn, label) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedFn(true);
      toast.success(`${label} berhasil disalin.`);
      setTimeout(() => setCopiedFn(false), 2000);
    } else {
      toast.error(`Gagal menyalin ${label.toLowerCase()}.`);
    }
  };

  if (donation.status === "PAID") {
    return (
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-6 sm:p-7 text-center space-y-3.5 shadow-2xs">
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-2xs">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-semibold text-emerald-950">
            Pembayaran Berhasil Terverifikasi
          </h3>
          <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed max-w-md mx-auto">
            Alhamdulillah, amanah donasi Anda telah kami terima secara resmi melalui sistem perbankan.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium">
          <span>Metode: {donation.paymentChannelName}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header Channel */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-slate-900 truncate">
            {donation.paymentChannelName}
          </h2>
          <p className="text-sm text-slate-600 mt-0.5 line-clamp-1">
            {isQris
              ? "Scan kode QR dinamis di bawah menggunakan m-Banking atau E-Wallet."
              : isMandiri
              ? "Selesaikan pembayaran melalui Livin' by Mandiri (Multipayment)."
              : "Selesaikan transfer ke nomor Virtual Account resmi di bawah."}
          </p>
        </div>
        <span
          className="text-xs font-medium text-slate-600 px-2 py-0.5 rounded bg-slate-100 shrink-0 whitespace-nowrap"
          title={isQris ? "QRIS" : "Virtual Account"}
        >
          {isQris ? "QRIS" : "VA"}
        </span>
      </div>

      {/* Konten Spesifik Kanal */}
      {isQris && (
        <div className="flex flex-col items-center justify-center py-2 space-y-4 text-center">
          {/* Kotak Barcode QRIS Resmi */}
          <div className="p-4 bg-white rounded-xl border border-slate-300 shadow-2xs flex flex-col items-center">
            <div className="relative w-[210px] h-[210px] sm:w-[230px] sm:h-[230px] overflow-hidden rounded-lg bg-white flex items-center justify-center">
              {donation.qrString ? (
                <QRCodeSVG
                  value={donation.qrString}
                  size={230}
                  level="M"
                  className="w-full h-full object-contain"
                />
              ) : donation.qrCodeUrl ? (
                <img
                  src={donation.qrCodeUrl}
                  alt="QRIS Resmi Yayasan Payung Berkah"
                  width={230}
                  height={230}
                  className="w-full h-full object-contain select-none"
                />
              ) : (
                <Image
                  src={ASSET_PATHS.PAYMENTS.QRIS_BARCODE}
                  alt="QRIS Resmi Yayasan Payung Berkah"
                  width={230}
                  height={230}
                  priority
                  className="w-full h-full object-contain select-none pointer-events-none"
                />
              )}
            </div>
          </div>

          <div className="space-y-1 text-center">
            <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight block">
              YAYASAN PAYUNG BERKAH
            </span>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-600 font-medium">
              <span>NMID : <strong className="text-slate-900 font-semibold">ID1026604741144</strong></span>
              <span className="text-slate-300">•</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                Verifikasi Otomatis
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 max-w-sm leading-relaxed">
            Dapat dipindai menggunakan seluruh aplikasi mobile banking dan e-wallet berlogo QRIS.
          </p>
        </div>
      )}

      {/* Kanal Bank Mandiri (Multipayment: Kode Perusahaan + Kode Pelanggan) */}
      {isMandiri && (
        <div className="space-y-3.5 py-1">
          {/* Kartu Rincian Mandiri Multipayment */}
          <div className="rounded-xl border border-slate-300 bg-slate-50/70 divide-y divide-slate-200 overflow-hidden shadow-2xs">
            {/* Baris 1: Kode Perusahaan */}
            <div className="p-3 sm:p-3.5 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs text-slate-500 block font-normal">
                  Kode Perusahaan
                </span>
                <span className="text-base sm:text-lg font-mono font-semibold text-slate-900 tracking-wider">
                  {billerCode}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopyText(billerCode, setCopiedBiller, "Kode Perusahaan")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-300 hover:bg-slate-100 text-xs font-medium text-slate-800 transition-colors cursor-pointer shadow-2xs"
              >
                {copiedBiller ? (
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

            {/* Baris 2: Nomor Pelanggan / Kode Bayar */}
            <div className="p-3 sm:p-3.5 flex items-center justify-between gap-3 bg-white">
              <div>
                <span className="text-xs text-slate-500 block font-normal">
                  Nomor Pelanggan (Kode Bayar)
                </span>
                <span className="text-base sm:text-lg font-mono font-semibold text-slate-900 tracking-wider">
                  {billKey}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopyText(billKey, setCopiedKey, "Nomor Pelanggan")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-300 hover:bg-slate-100 text-xs font-medium text-slate-800 transition-colors cursor-pointer shadow-2xs"
              >
                {copiedKey ? (
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
          </div>

          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-semibold text-slate-700 block">
              Panduan Pembayaran:
            </span>
            <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <span>Buka aplikasi <strong>Livin&apos; by Mandiri</strong></span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 inline" />
              <span>pilih <strong>Bayar</strong></span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 inline" />
              <span>masukkan <strong>Kode Perusahaan</strong> di atas</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 inline" />
              <span>masukkan <strong>Nomor Pelanggan</strong> Anda.</span>
            </p>
          </div>
        </div>
      )}

      {/* Kanal Bank BRI (BRIVA) */}
      {isBri && (
        <div className="space-y-3 py-1">
          <div className="p-3 sm:p-3.5 flex items-center justify-between gap-3 rounded-xl border border-slate-300 bg-white shadow-2xs">
            <div>
              <span className="text-xs text-slate-500 block font-normal">
                Nomor BRIVA (BRI Virtual Account)
              </span>
              <span className="text-base sm:text-lg font-mono font-semibold text-slate-900 tracking-wider">
                {briVaNumber}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onCopyVa(briVaNumber)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-300 hover:bg-slate-100 text-xs font-medium text-slate-800 transition-colors cursor-pointer shadow-2xs"
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
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-semibold text-slate-700 block">
              Panduan Pembayaran:
            </span>
            <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <span>Buka aplikasi <strong>BRImo</strong></span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 inline" />
              <span>pilih <strong>Pembayaran</strong></span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 inline" />
              <span><strong>BRIVA</strong></span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 inline" />
              <span>masukkan nomor virtual account di atas.</span>
            </p>
          </div>
        </div>
      )}

      {/* Tombol Cek Status Pembayaran Real-time */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span>Sistem mengecek status otomatis</span>
        </div>
        <button
          type="button"
          onClick={handleManualCheckStatus}
          disabled={isCheckingStatus}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-300 hover:bg-slate-100 text-xs font-medium text-slate-800 transition-colors cursor-pointer disabled:opacity-60 shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isCheckingStatus ? "animate-spin" : ""}`} />
          <span>{isCheckingStatus ? "Memeriksa..." : "Cek Status"}</span>
        </button>
      </div>
    </div>
  );
}
