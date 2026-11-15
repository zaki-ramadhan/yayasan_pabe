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
import { downloadVolunteerCardImage } from "@/lib/ktaDownloadHelper";

export function VolunteerPrintDialog({
  isOpen,
  onClose,
  volunteer = null,
}) {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!volunteer) return null;

  const handleDownloadImage = async () => {
    if (!volunteer) return;
    setIsDownloading(true);
    try {
      await downloadVolunteerCardImage("volunteer-print-dialog-export", {
        volunteerName: volunteer.fullName,
        volunteerId: volunteer.volunteerId,
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
      : `https://payungberkah.id/relawan/validasi/${volunteer.id}`;

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
      <DialogContent className="sm:max-w-2xl max-h-[85vh] p-0 overflow-hidden flex flex-col bg-white border border-slate-200">
        <DialogHeader className="border-b border-slate-100">
          <DialogTitle className="text-base sm:text-lg font-medium text-slate-900 leading-tight">
            Kartu relawan
          </DialogTitle>
        </DialogHeader>

        {/* Node Render Khusus Unduh Kartu (Kotak Rapi Tanpa Sudut Melengkung) */}
        <div
          id="volunteer-print-dialog-export"
          className="fixed -left-[9999px] top-0 pointer-events-none p-6 bg-transparent"
          aria-hidden="true"
        >
          <VolunteerIdCard volunteer={volunteer} mode="both" rounded={false} />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 sm:px-6 bg-slate-50/50 flex flex-col items-center justify-center">
          <div className="p-2 bg-transparent rounded-2xl w-full flex justify-center">
            <VolunteerIdCard volunteer={volunteer} />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2.5 sm:gap-3 border-t border-slate-100 bg-white">
          <Button
            type="button"
            variant="outline"
            onClick={handleCopyLink}
            className="h-9 px-3.5 text-xs sm:text-sm font-medium gap-1.5 cursor-pointer w-full sm:w-auto"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
            <span>{copied ? "Tersalin" : "Salin tautan"}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handlePrint}
            className="h-9 px-3.5 text-xs sm:text-sm font-medium gap-1.5 cursor-pointer w-full sm:w-auto text-slate-700"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Cetak</span>
          </Button>

          <Button
            type="button"
            onClick={handleDownloadImage}
            disabled={isDownloading}
            isLoading={isDownloading}
            loadingText="Mengunduh..."
            className="h-9 px-4 text-xs sm:text-sm font-medium gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer w-full sm:w-auto"
          >
            <Download className="w-4 h-4" />
            <span>Unduh kartu</span>
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
