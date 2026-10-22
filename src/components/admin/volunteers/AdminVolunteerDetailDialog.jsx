"use client";

import { MessageSquare, Phone, MapPin, Calendar, Heart, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { formatDate } from "@/lib/formatters";
import { maskEmail } from "@/lib/security";
import { AdminVolunteerStatusBadge } from "./AdminVolunteerStatusBadge";

export function AdminVolunteerDetailDialog({
  isOpen,
  onClose,
  volunteer = null,
  onStatusChange,
  isUpdating = false,
}) {
  if (!volunteer) return null;

  const cleanPhone = (volunteer.phone || "").replace(/[^0-9]/g, "");
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone}`
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto p-5 sm:p-6 bg-white border border-slate-200">
        <DialogHeader className="pb-3 border-b border-slate-200">
          <div className="flex items-center justify-between gap-2">
            <div>
              <DialogTitle className="text-base sm:text-lg font-medium text-slate-900 leading-tight">
                Profil pendaftar relawan
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 font-normal mt-0.5">
                Rincian data diri, bidang keahlian, dan motivasi kerelawanan.
              </DialogDescription>
            </div>
            <AdminVolunteerStatusBadge status={volunteer.status} />
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-sm">
          {/* Identitas Pendaftar */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
            <div>
              <span className="text-xs text-slate-500 block font-normal">Nama lengkap:</span>
              <span className="font-medium text-slate-900 text-base leading-snug">
                {volunteer.fullName}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200">
              <div>
                <span className="text-xs text-slate-500 block">Email:</span>
                <span className="font-medium text-slate-900">
                  {volunteer.email ? maskEmail(volunteer.email) : "-"}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Nomor telepon / WA:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-slate-900">{volunteer.phone || "-"}</span>
                  {waUrl && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:text-emerald-800 text-xs font-medium hover:underline inline-flex items-center gap-0.5"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Chat WA</span>
                    </a>
                  )}
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Kota domisili:</span>
                <span className="font-medium text-slate-900 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{volunteer.city}</span>
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Tanggal mendaftar:</span>
                <span className="font-medium text-slate-900 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatDate(volunteer.createdAt)}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Minat Kerelawanan */}
          <div className="p-3 border border-slate-200 rounded-lg space-y-1">
            <span className="text-xs text-slate-500 block font-normal">Bidang minat program:</span>
            <div className="flex items-center gap-1.5 text-primary">
              <Heart className="w-4 h-4 shrink-0" />
              <span className="font-medium text-slate-900">{volunteer.interest}</span>
            </div>
          </div>

          {/* Motivasi & Harapan */}
          <div className="p-3.5 bg-slate-50/50 border border-slate-200 rounded-lg space-y-1">
            <span className="text-xs text-slate-500 block font-normal">Motivasi kerelawanan:</span>
            <p className="text-sm font-normal text-slate-800 leading-relaxed whitespace-pre-line italic">
              &ldquo;{volunteer.motivation || "Tidak menuliskan catatan motivasi khusus."}&rdquo;
            </p>
          </div>

          {/* Pengaturan Status Pendaftar */}
          <div className="p-3 border border-slate-200 rounded-lg space-y-2">
            <span className="text-xs text-slate-700 block font-medium">
              Ubah status tindak lanjut:
            </span>
            <div className="flex items-center gap-2">
              <Select
                value={volunteer.status}
                onValueChange={(val) => onStatusChange(volunteer.id, val)}
                disabled={isUpdating}
              >
                <SelectTrigger className="h-10 flex-1 text-sm font-normal bg-white border border-slate-300">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-slate-200 z-50">
                  <SelectItem value="PENDING" className="cursor-pointer text-sm font-normal py-2">
                    Menunggu (PENDING)
                  </SelectItem>
                  <SelectItem value="CONTACTED" className="cursor-pointer text-sm font-normal py-2">
                    Sudah Dihubungi (CONTACTED)
                  </SelectItem>
                  <SelectItem value="APPROVED" className="cursor-pointer text-sm font-normal py-2">
                    Disetujui / Aktif (APPROVED)
                  </SelectItem>
                  <SelectItem value="REJECTED" className="cursor-pointer text-sm font-normal py-2">
                    Ditolak / Batal (REJECTED)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
