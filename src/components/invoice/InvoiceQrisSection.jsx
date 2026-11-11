"use client";

import { useState } from "react";
import Image from "next/image";
import { Download, Copy, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { ASSET_PATHS } from "@/lib/assetConstants";
import { copyToClipboard } from "@/lib/clipboard";
import { toast } from "@/hooks/useToast";
import { downloadQrisImage } from "@/lib/qrisCanvasExporter";

/**
 * Komponen presentasi kanal pembayaran QRIS (Dinamis / Gambar / Fallback)
 *
 * @param {object} props
 * @param {object} props.donation
 * @param {string} [props.effectiveSimulatorUrl]
 * @param {boolean} [props.showSimulatorTools]
 */
export function InvoiceQrisSection({
  donation,
  effectiveSimulatorUrl = "",
  showSimulatorTools = false,
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedSimUrl, setCopiedSimUrl] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadQrisImage({ donation, effectiveSimulatorUrl });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopySimulatorUrl = async () => {
    const success = await copyToClipboard(effectiveSimulatorUrl);
    if (success) {
      setCopiedSimUrl(true);
      toast.success("URL QR Simulator berhasil disalin.");
      setTimeout(() => setCopiedSimUrl(false), 2000);
    } else {
      toast.error("Gagal menyalin URL simulator.");
    }
  };

  return (
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
          ) : donation.qrCodeUrl ? (
            <Image
              src={donation.qrCodeUrl}
              alt="QRIS Resmi Yayasan Payung Berkah"
              width={230}
              height={230}
              unoptimized
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
          onClick={handleDownload}
          disabled={isDownloading}
          className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4 text-slate-300" />
          <span>{isDownloading ? "Mengunduh..." : "Unduh QRIS"}</span>
        </button>

        {showSimulatorTools && (
          <button
            type="button"
            onClick={handleCopySimulatorUrl}
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

      <p className="text-xs text-slate-500 leading-relaxed">
        Mendukung semua aplikasi berlogo QRIS.
      </p>
    </div>
  );
}

