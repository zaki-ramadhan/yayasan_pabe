"use client";

import { Download, Printer, Copy, Check } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { VolunteerIdCard } from "./VolunteerIdCard";
import { copyToClipboard } from "@/lib/clipboard";
import { toast } from "@/hooks/useToast";
import { downloadSingleVolunteerZip } from "@/lib/volunteerCardExportHelper";

export function VolunteerPrintDialog({
  isOpen,
  onClose,
  volunteer = null,
  showCopy = false,
  showPrint = false,
}) {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!volunteer) return null;

  const getFrontElement = () =>
    document.getElementById("volunteer-print-front-export")?.firstElementChild;
  const getBackElement = () =>
    document.getElementById("volunteer-print-back-export")?.firstElementChild;

  const handleDownloadZip = async () => {
    if (!volunteer || isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadSingleVolunteerZip({
        volunteer,
        frontElement: getFrontElement(),
        backElement: getBackElement(),
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleCopyLink = async () => {
    const url = typeof window !== "undefined"
      ? `${window.location.origin}/relawan/validasi/${volunteer.id}`
      : `https://payungberkah.org/relawan/validasi/${volunteer.id}`;

    const ok = await copyToClipboard(url);
    if (ok) {
      setCopied(true);
      toast.success("Tautan validasi relawan berhasil disalin.");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Gagal menyalin tautan.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:min-w-[540px] sm:max-w-2xl min-h-[360px] sm:min-h-[440px] max-h-[85vh] p-0 overflow-hidden flex flex-col bg-white border border-slate-200">
        <DialogHeader className="border-b border-slate-100">
          <DialogTitle className="text-base sm:text-lg font-medium text-slate-900 leading-tight">
            Kartu relawan
          </DialogTitle>
        </DialogHeader>

        {/* Node Render Khusus Unduh Kartu Siap Cetak (CR80 Siku Sempurna) */}
        <div
          id="volunteer-print-front-export"
          className="fixed -left-[9999px] top-0 pointer-events-none p-6 bg-transparent w-[360px]"
          aria-hidden="true"
        >
          <VolunteerIdCard volunteer={volunteer} mode="front" rounded={false} />
        </div>
        <div
          id="volunteer-print-back-export"
          className="fixed -left-[9999px] top-0 pointer-events-none p-6 bg-transparent w-[360px]"
          aria-hidden="true"
        >
          <VolunteerIdCard volunteer={volunteer} mode="back" rounded={false} />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 sm:px-6 bg-slate-50/50 flex flex-col items-center justify-center">
          <div className="p-2 bg-transparent rounded-2xl w-full flex justify-center">
            <VolunteerIdCard volunteer={volunteer} />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2.5 sm:gap-3 border-t border-slate-100 bg-white">
          {showCopy && (
            <Button
              type="button"
              variant="outline"
              onClick={handleCopyLink}
              className="h-9 px-3.5 text-xs sm:text-sm font-medium gap-1.5 cursor-pointer w-full sm:w-auto"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
              <span>{copied ? "Tersalin" : "Salin tautan"}</span>
            </Button>
          )}

          {showPrint && (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrint}
              className="h-9 px-3.5 text-xs sm:text-sm font-medium gap-1.5 cursor-pointer w-full sm:w-auto text-slate-700"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Cetak</span>
            </Button>
          )}

          {/* Unduh Langsung: Paket ZIP (Depan & Belakang) */}
          <Button
            type="button"
            onClick={handleDownloadZip}
            disabled={isDownloading}
            isLoading={isDownloading}
            loadingText="Mengunduh..."
            className="h-9 px-4 text-xs sm:text-sm font-medium gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer w-full sm:w-auto"
          >
            <Download className="w-4 h-4" />
            <span>Unduh kartu (ZIP)</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-9 px-3.5 text-xs sm:text-sm font-medium text-slate-700 cursor-pointer w-full sm:w-auto"
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
