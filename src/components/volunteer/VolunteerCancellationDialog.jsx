"use client";

import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";

/**
 * Modal dialog konfirmasi tindakan destruktif: pembatalan pendaftaran atau pengunduran diri relawan.
 * Terpisah dari view utama untuk menjamin SRP dan anti god-file.
 */
export function VolunteerCancellationDialog({
  isOpen,
  onClose,
  onConfirm,
  status = "PENDING",
  isLoading = false,
}) {
  const isApproved = status === "APPROVED";

  const title = isApproved
    ? "Berhenti Menjadi Relawan"
    : "Batalkan Pendaftaran Relawan";

  const description = isApproved
    ? "Apakah Anda yakin ingin mengundurkan diri sebagai relawan aktif Yayasan Payung Berkah? Kartu Tanda Anggota (KTA) digital dan hak penugasan Anda akan dinonaktifkan."
    : "Apakah Anda yakin ingin membatalkan pengajuan pendaftaran relawan ini? Berkas pendaftaran Anda akan ditarik dari sistem yayasan.";

  const actionText = isApproved
    ? "Ya, berhenti sekarang"
    : "Ya, batalkan pengajuan";

  return (
    <Dialog open={isOpen} onOpenChange={isLoading ? undefined : onClose}>
      <DialogContent className="max-w-md p-6 bg-white border border-slate-200">
        <DialogHeader className="space-y-3">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <DialogTitle className="text-base sm:text-lg font-semibold text-slate-900 leading-tight">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="h-10 text-xs sm:text-sm font-medium cursor-pointer"
          >
            Kembali
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="h-10 text-xs sm:text-sm font-medium bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
          >
            {isLoading ? "Memproses..." : actionText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default VolunteerCancellationDialog;
