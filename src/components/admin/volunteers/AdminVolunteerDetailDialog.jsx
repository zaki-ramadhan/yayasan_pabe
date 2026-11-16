"use client";

import { QrCode, MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/formatters";
import { buildWhatsAppUrl } from "@/lib/whatsappUtils";
import { AdminVolunteerStatusBadge } from "./AdminVolunteerStatusBadge";

/**
 * Modal rincian pendaftar relawan dengan format editorial bersih (Zero AI-Slop).
 * Bebas dari kotak bertumpuk dan ikon dekoratif tidak perlu.
 */
export function AdminVolunteerDetailDialog({
  isOpen,
  onClose,
  volunteer = null,
  onPrintCard,
}) {
  if (!volunteer) return null;

  const waUrl = buildWhatsAppUrl(volunteer.phone) || null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:min-w-[480px] sm:max-w-xl min-h-[280px] sm:min-h-[340px] max-h-[85vh] p-0 overflow-hidden flex flex-col bg-white border border-slate-200">
        <DialogHeader className="border-b border-slate-100 px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <DialogTitle className="text-base sm:text-lg font-medium text-slate-900 leading-tight">
              Rincian pendaftar relawan
            </DialogTitle>
            <AdminVolunteerStatusBadge status={volunteer.status} />
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-5 text-sm">
          {/* Metadata Grid Bersih */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <span className="text-xs text-slate-500 block font-normal">Nama lengkap</span>
              <span className="font-medium text-slate-900 text-sm mt-0.5 block">
                {volunteer.fullName}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-500 block font-normal">Email</span>
              <span className="font-medium text-slate-900 text-sm mt-0.5 block truncate">
                {volunteer.email || "-"}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-500 block font-normal">Nomor telepon / WA</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-medium text-slate-900 text-sm">{volunteer.phone || "-"}</span>
                {waUrl && (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Chat WA</span>
                  </a>
                )}
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-500 block font-normal">Kota domisili</span>
              <span className="font-medium text-slate-900 text-sm mt-0.5 block">
                {volunteer.city || "-"}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-500 block font-normal">Tanggal mendaftar</span>
              <span className="font-medium text-slate-900 text-sm mt-0.5 block">
                {formatDate(volunteer.createdAt)}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-500 block font-normal">Bidang minat</span>
              <span className="font-medium text-slate-900 text-sm mt-0.5 block">
                {volunteer.interest || "-"}
              </span>
            </div>
          </div>

          {/* Motivasi & Harapan Pendaftar */}
          <div className="space-y-1.5 pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500 block font-normal">Motivasi pendaftaran</span>
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg text-sm text-slate-800 leading-relaxed whitespace-pre-line">
              {volunteer.motivation || "Tidak menuliskan catatan motivasi khusus."}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 border-t border-slate-100 px-6 py-3.5 bg-slate-50/50">
          {volunteer.status === "APPROVED" && onPrintCard && (
            <Button
              type="button"
              onClick={() => onPrintCard(volunteer)}
              className="h-9 px-3.5 text-xs sm:text-sm font-medium gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer w-full sm:w-auto"
            >
              <QrCode className="w-4 h-4" />
              <span>Lihat kartu relawan</span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-9 min-w-[84px] w-full sm:w-auto cursor-pointer text-xs sm:text-sm"
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
