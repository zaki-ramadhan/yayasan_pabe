"use client";

import { Printer, Copy, Check } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VolunteerIdCard } from "./VolunteerIdCard";
import { copyToClipboard } from "@/lib/clipboard";
import { toast } from "@/hooks/use-toast";

export function VolunteerPrintDialog({
  isOpen,
  onClose,
  volunteer = null,
}) {
  const [copied, setCopied] = useState(false);

  if (!volunteer) return null;

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
      <DialogContent className="max-w-md max-h-[85vh] p-0 overflow-hidden flex flex-col bg-white border border-slate-200">
        <DialogHeader className="border-b border-slate-100">
          <DialogTitle className="text-base font-semibold text-slate-900 leading-tight">
            Kartu Tanda Anggota Relawan
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 sm:px-6 bg-slate-50/50 flex flex-col items-center justify-center">
          <VolunteerIdCard volunteer={volunteer} />
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 border-t border-slate-100 bg-white">
          <Button
            type="button"
            variant="outline"
            onClick={handleCopyLink}
            className="h-9 px-3 text-sm font-normal gap-1.5 cursor-pointer w-full sm:w-auto"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
            <span>{copied ? "Tersalin" : "Salin tautan"}</span>
          </Button>

          <Button
            type="button"
            onClick={handlePrint}
            className="h-9 px-4 text-sm font-medium gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer w-full sm:w-auto"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak kartu</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="h-9 px-3 text-sm font-normal text-slate-600 cursor-pointer w-full sm:w-auto"
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
