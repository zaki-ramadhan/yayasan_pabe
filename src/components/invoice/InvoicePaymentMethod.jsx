"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Copy, ChevronRight, Download, Clock, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { ASSET_PATHS } from "@/lib/assetConstants";
import { copyToClipboard } from "@/lib/clipboard";
import { toast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";

/**
 * Payment method presentation (Direct Headless Midtrans QRIS, BRI VA, or Mandiri Bill)
 * @param {object} props
 * @param {object} props.donation
 * @param {boolean} props.copiedVa
 * @param {Function} props.onCopyVa
 */
export function InvoicePaymentMethod({ donation, copiedVa, onCopyVa }) {
  const [copiedBiller, setCopiedBiller] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSimUrl, setCopiedSimUrl] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [liveQrUrl, setLiveQrUrl] = useState(donation.qrCodeUrl || "");

  const isQris = donation.paymentChannelType === "QRIS" || donation.paymentChannelId === "qris" || donation.paymentChannelType === "EWALLET";
  const isMandiri = donation.paymentChannelId === "mandiri_va";
  const isVa = (donation.paymentChannelType === "VA" || String(donation.paymentChannelId).endsWith("_va")) && !isMandiri;
  const isRetail = donation.paymentChannelType === "RETAIL" || ["indomaret", "alfamart"].includes(donation.paymentChannelId);
  const isManual = donation.paymentChannelType === "MANUAL" || String(donation.paymentChannelId).startsWith("manual_");

  const billerCode = donation.billerCode || "70012";
  const billKey = donation.billKey || donation.virtualAccountNumber || "";
  const isDevelopment = process.env.NODE_ENV === "development";
  const effectiveSimulatorUrl = liveQrUrl || donation.qrCodeUrl || "";
  const showSimulatorTools =
    isDevelopment &&
    Boolean(effectiveSimulatorUrl) &&
    effectiveSimulatorUrl.includes("sandbox");

  useEffect(() => {
    if (donation?.qrCodeUrl && donation.qrCodeUrl !== liveQrUrl) {
      setLiveQrUrl(donation.qrCodeUrl);
    }
  }, [donation?.qrCodeUrl]);

  const handleDownloadQris = async () => {
    try {
      setIsDownloading(true);
      const svg = document.getElementById("qris-svg-code");
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const URLObj = window.URL || window.webkitURL || window;
        const blobUrl = URLObj.createObjectURL(svgBlob);
        const img = new window.Image();

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const padding = 36;
          const qrSize = 480;
          canvas.width = qrSize + padding * 2;
          canvas.height = qrSize + padding * 2;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, padding, padding, qrSize, qrSize);
            const pngUrl = canvas.toDataURL("image/png");
            const a = document.createElement("a");
            a.href = pngUrl;
            a.download = `QRIS-${donation.invoiceId || "donasi"}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URLObj.revokeObjectURL(blobUrl);
            toast.success("Gambar QRIS berhasil diunduh.");
          }
          setIsDownloading(false);
        };

        img.onerror = () => {
          setIsDownloading(false);
          toast.error("Gagal memproses gambar QRIS.");
        };

        img.src = blobUrl;
        return;
      }

      const imageUrl = effectiveSimulatorUrl;
      if (imageUrl) {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `QRIS-${donation.invoiceId || "donasi"}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
        toast.success("Gambar QRIS berhasil diunduh.");
      } else {
        toast.error("Kode QRIS tidak tersedia untuk diunduh.");
      }
    } catch {
      const fallbackUrl = effectiveSimulatorUrl;
      if (fallbackUrl) {
        window.open(fallbackUrl, "_blank");
        toast.info("Gambar QRIS dibuka di tab baru untuk disimpan.");
      } else {
        toast.error("Gagal mengunduh gambar QRIS.");
      }
    } finally {
      setIsDownloading(false);
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
      <div className="text-center py-4 sm:py-6 space-y-4">
        {/* 3D Success Checkmark Token */}
        <div className="relative inline-flex items-center justify-center mx-auto">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-50/80 border border-emerald-100/90 flex items-center justify-center shadow-xs">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-emerald-500 via-emerald-600 to-emerald-700 border-t border-t-emerald-300/80 border-x border-x-emerald-600 border-b-4 border-b-emerald-800 text-white flex items-center justify-center shadow-[inset_0_2px_2px_rgba(255,255,255,0.45),0_6px_12px_rgba(5,150,105,0.3)]">
              <Check className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3.5] drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]" />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Pembayaran Berhasil Terverifikasi
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            Alhamdulillah, amanah donasi Anda telah kami terima secara resmi melalui sistem perbankan.
          </p>
        </div>

        <p className="text-xs sm:text-sm text-slate-500">
          Saluran: <span className="font-medium text-slate-700">{donation.paymentChannelName}</span>
        </p>
      </div>
    );
  }

  if (donation.status === "EXPIRED") {
    const renewHref = donation.campaignSlug
      ? `/campaign/${donation.campaignSlug}/donate?amount=${donation.amount}`
      : "/program";

    return (
      <div className="text-center py-4 sm:py-6 space-y-4">
        {/* 3D Expired Cross Token */}
        <div className="relative inline-flex items-center justify-center mx-auto">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-rose-50/80 border border-rose-100/90 flex items-center justify-center shadow-xs">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-rose-500 via-rose-600 to-rose-700 border-t border-t-rose-300/80 border-x border-x-rose-600 border-b-4 border-b-rose-900 text-white flex items-center justify-center shadow-[inset_0_2px_2px_rgba(255,255,255,0.45),0_6px_12px_rgba(225,29,72,0.3)]">
              <X className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3.5] drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]" />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Batas Waktu Pembayaran Telah Habis
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            Tagihan donasi ini telah kedaluwarsa demi keamanan transaksi. Saluran pembayaran otomatis dinonaktifkan. Anda dapat membuat tagihan baru kapan pun Anda siap.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href={renewHref}
            className="inline-flex items-center justify-center text-sm font-medium text-primary hover:underline cursor-pointer"
          >
            Donasi lagi
          </Link>
        </div>
      </div>
    );
  }

  if (donation.status === "CANCELLED") {
    const renewHref = donation.campaignSlug
      ? `/campaign/${donation.campaignSlug}/donate?amount=${donation.amount}`
      : "/program";

    return (
      <div className="text-center py-4 sm:py-6 space-y-4">
        {/* 3D Cancelled Token */}
        <div className="relative inline-flex items-center justify-center mx-auto">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shadow-xs">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-slate-500 via-slate-600 to-slate-700 border-t border-t-slate-400 border-x border-x-slate-600 border-b-4 border-b-slate-900 text-white flex items-center justify-center shadow-[inset_0_2px_2px_rgba(255,255,255,0.45),0_6px_12px_rgba(71,85,105,0.3)]">
              <X className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3.5] drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]" />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Tagihan Donasi Dibatalkan
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            Tagihan donasi ini telah dibatalkan. Anda dapat membuat donasi baru kapan saja.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href={renewHref}
            className="inline-flex items-center justify-center text-sm font-medium text-primary hover:underline cursor-pointer"
          >
            Donasi lagi
          </Link>
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
              : isRetail
              ? "Selesaikan pembayaran tunai di kasir gerai retail terdekat."
              : isManual
              ? "Transfer langsung ke rekening giro resmi Yayasan Payung Berkah."
              : "Selesaikan transfer ke nomor Virtual Account resmi di bawah."}
          </p>
        </div>
        <span
          className="text-xs font-medium text-slate-600 px-2 py-0.5 rounded bg-slate-100 shrink-0 whitespace-nowrap"
          title={donation.paymentChannelName}
        >
          {isQris ? "QRIS" : isMandiri ? "Mandiri" : isRetail ? "Kasir" : isManual ? "Giro" : "VA"}
        </span>
      </div>

      {/* Konten Spesifik Kanal */}
      {isQris && (
        <div className="flex flex-col items-center justify-center py-2 space-y-3.5 text-center">
          {/* Kotak Barcode QRIS Resmi */}
          <div className="p-4 bg-white rounded-xl border border-slate-300 shadow-2xs flex flex-col items-center">
            <div className="relative w-[210px] h-[210px] sm:w-[230px] sm:h-[230px] overflow-hidden rounded-lg bg-white flex items-center justify-center">
              {donation.qrString ? (
                <QRCodeSVG
                  id="qris-svg-code"
                  value={donation.qrString}
                  size={230}
                  level="M"
                  className="w-full h-full object-contain"
                />
              ) : liveQrUrl || donation.qrCodeUrl ? (
                <img
                  src={liveQrUrl || donation.qrCodeUrl}
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

          <div className="space-y-0.5 text-center">
            <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight block">
              YAYASAN PAYUNG BERKAH
            </span>
            <p className="text-xs text-slate-500 font-medium">
              NMID : <strong className="text-slate-800 font-semibold font-mono">ID1026604741144</strong>
            </p>
          </div>

          {/* Tombol Unduh QRIS & Tombol Simulator */}
          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-2 w-full ${
              showSimulatorTools ? "max-w-sm" : "max-w-xs"
            } pt-1`}
          >
            <button
              type="button"
              onClick={handleDownloadQris}
              disabled={isDownloading}
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-slate-300" />
              <span>{isDownloading ? "Mengunduh..." : "Unduh QRIS"}</span>
            </button>

            {showSimulatorTools && (
              <button
                type="button"
                onClick={() => handleCopyText(effectiveSimulatorUrl, setCopiedSimUrl, "URL QR Simulator")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium transition-colors shadow-2xs cursor-pointer shrink-0"
                title="Salin URL gambar QR untuk ditempel di Midtrans Payment Simulator (Hanya aktif di Development)"
              >
                {copiedSimUrl ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>URL Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Salin URL Simulator</span>
                  </>
                )}
              </button>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-600 max-w-sm leading-relaxed">
            Dapat dipindai menggunakan seluruh aplikasi mobile banking dan e-wallet berlogo QRIS.
          </p>

          {showSimulatorTools && (
            <div className="w-full max-w-sm rounded-lg bg-amber-50/80 border border-amber-200/90 p-2.5 text-left text-xs text-amber-900 leading-relaxed shadow-2xs">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className="font-semibold block text-amber-950">Panduan Pengujian Simulator:</span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">Dev Only</span>
              </div>
              Klik <strong>Salin URL Simulator</strong> di atas, lalu tempelkan (*paste*) di kolom <em>QR Code URL</em> pada{" "}
              <a
                href="https://simulator.sandbox.midtrans.com/qris/index"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline hover:text-amber-950"
              >
                Midtrans Payment Simulator
              </a>{" "}
              dan klik <strong>Scan QR</strong> &gt; <strong>Pay</strong>.
            </div>
          )}
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

      {/* Kanal Bank Virtual Account (BCA, BRI, BNI, Permata) */}
      {isVa && (
        <div className="space-y-3 py-1">
          <div className="p-3 sm:p-3.5 flex items-center justify-between gap-3 rounded-xl border border-slate-300 bg-white shadow-2xs">
            <div>
              <span className="text-xs text-slate-500 block font-normal">
                Nomor {donation.paymentChannelName}
              </span>
              <span className="text-base sm:text-lg font-mono font-semibold text-slate-900 tracking-wider">
                {vaNumber}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onCopyVa(vaNumber)}
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
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Transfer ke nomor Virtual Account di atas melalui m-Banking, i-Banking, atau ATM. Verifikasi transaksi otomatis tanpa perlu konfirmasi manual.
            </p>
          </div>
        </div>
      )}

      {/* Kanal Gerai Retail (Indomaret / Alfamart) */}
      {isRetail && (
        <div className="space-y-3 py-1">
          <div className="p-3 sm:p-3.5 flex items-center justify-between gap-3 rounded-xl border border-slate-300 bg-white shadow-2xs">
            <div>
              <span className="text-xs text-slate-500 block font-normal">
                Kode Pembayaran Kasir ({donation.paymentChannelName})
              </span>
              <span className="text-base sm:text-lg font-mono font-semibold text-slate-900 tracking-wider">
                {vaNumber}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onCopyVa(vaNumber)}
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
              Panduan Kasir:
            </span>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Kunjungi gerai {donation.paymentChannelName} terdekat, beritahu kasir ingin bayar tagihan donasi yayasan / Midtrans, lalu sebutkan kode pembayaran di atas.
            </p>
          </div>
        </div>
      )}

      {/* Kanal Transfer Manual Rekening Yayasan */}
      {isManual && (
        <div className="space-y-3.5 py-1">
          <div className="rounded-xl border border-slate-300 bg-slate-50/70 divide-y divide-slate-200 overflow-hidden shadow-2xs">
            <div className="p-3 sm:p-3.5 flex items-center justify-between gap-3 bg-white">
              <div>
                <span className="text-xs text-slate-500 block font-normal">
                  Nomor Rekening Giro
                </span>
                <span className="text-base sm:text-lg font-mono font-semibold text-slate-900 tracking-wider">
                  {vaNumber}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onCopyVa(vaNumber)}
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
            <div className="p-3 sm:p-3.5 flex items-center justify-between gap-3 bg-slate-50">
              <div>
                <span className="text-xs text-slate-500 block font-normal">
                  Nama Penerima
                </span>
                <span className="text-sm sm:text-base font-semibold text-slate-900">
                  {donation.billerCode || "YAYASAN PAYUNG BERKAH"}
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-semibold text-slate-700 block">
              Catatan Transfer:
            </span>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Sertakan nomor invoice <strong>{donation.invoiceId}</strong> pada berita transfer untuk memudahkan verifikasi mutasi rekening yayasan.
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
