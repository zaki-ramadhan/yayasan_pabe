"use client";

import { Phone, MapPin, Calendar, Heart, QrCode } from "lucide-react";
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
 * Modal murni baca (Read-Only) untuk melihat profil dan rincian lengkap pendaftar relawan.
 * Bebas dari aksi perubahan status agar aman dibaca kapan saja oleh pengurus.
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
      <DialogContent className="sm:max-w-xl md:max-w-2xl max-h-[85vh] p-0 overflow-hidden flex flex-col bg-white border border-slate-200">
        <DialogHeader className="border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <DialogTitle className="text-base sm:text-lg font-medium text-slate-900 leading-tight">
              Profil pendaftar relawan
            </DialogTitle>
            <AdminVolunteerStatusBadge status={volunteer.status} />
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 sm:px-6 space-y-4 text-sm">
          {/* Identitas Pendaftar */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
            <div>
              <span className="text-sm text-slate-500 block font-normal">Nama lengkap:</span>
              <span className="font-medium text-slate-900 text-base leading-snug">
                {volunteer.fullName}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200">
              <div>
                <span className="text-sm text-slate-500 block font-normal">Email:</span>
                <span className="font-medium text-slate-900">
                  {volunteer.email || "-"}
                </span>
              </div>
              <div>
                <span className="text-sm text-slate-500 block font-normal">Nomor telepon / WA:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-slate-900">{volunteer.phone || "-"}</span>
                  {waUrl && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:text-emerald-800 text-sm font-medium hover:underline inline-flex items-center gap-0.5"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Chat WA</span>
                    </a>
                  )}
                </div>
              </div>
              <div>
                <span className="text-sm text-slate-500 block font-normal">Kota domisili:</span>
                <span className="font-medium text-slate-900 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{volunteer.city}</span>
                </span>
              </div>
              <div>
                <span className="text-sm text-slate-500 block font-normal">Tanggal mendaftar:</span>
                <span className="font-medium text-slate-900 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatDate(volunteer.createdAt)}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Minat Kerelawanan */}
          <div className="p-3 border border-slate-200 rounded-lg space-y-1">
            <span className="text-sm text-slate-500 block font-normal">Bidang minat program:</span>
            <div className="flex items-center gap-1.5 text-primary">
              <Heart className="w-4 h-4 shrink-0" />
              <span className="font-medium text-slate-900">{volunteer.interest}</span>
            </div>
          </div>

          {/* Motivasi & Harapan */}
          <div className="p-3.5 bg-slate-50/50 border border-slate-200 rounded-lg space-y-1">
            <span className="text-sm text-slate-500 block font-normal">Motivasi kerelawanan:</span>
            <p className="text-sm font-normal text-slate-800 leading-relaxed whitespace-pre-line italic">
              &ldquo;{volunteer.motivation || "Tidak menuliskan catatan motivasi khusus."}&rdquo;
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 border-t border-slate-100 p-4">
          {volunteer.status === "APPROVED" && onPrintCard && (
            <Button
              type="button"
              onClick={() => onPrintCard(volunteer)}
              className="h-9 px-3.5 text-sm font-medium gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer w-full sm:w-auto"
            >
              <QrCode className="w-4 h-4" />
              <span>Lihat kartu &amp; QR</span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-9 min-w-[84px] w-full sm:w-auto cursor-pointer"
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
