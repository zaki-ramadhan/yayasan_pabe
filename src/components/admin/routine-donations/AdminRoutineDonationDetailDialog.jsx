"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";
import { AdminRoutineDonationStatusBadge } from "./AdminRoutineDonationStatusBadge";
import { AdminRoutineTriggerButton } from "./AdminRoutineTriggerButton";
import { formatRupiah, formatDate, decodeHtmlEntities } from "@/lib/formatters";
import { maskEmail, maskPhone } from "@/lib/security";
import { buildWhatsAppUrl } from "@/lib/whatsappUtils";
import { Mail, Phone, Calendar, Clock, HeartHandshake, User, ArrowUpRight, Loader2 } from "lucide-react";

export function AdminRoutineDonationDetailDialog({
  donation,
  isOpen,
  onClose,
  onStatusChange,
  isUpdating = false,
}) {
  if (!donation) return null;

  const waUrl = buildWhatsAppUrl(
    donation.donorPhone,
    `Halo ${donation.donorName}, terima kasih atas komitmen donasi rutin Anda di Yayasan Payung Berkah untuk program "${donation.programTitle}".`
  );

  const frequencyLabel = {
    DAILY: "Harian (Setiap Hari)",
    WEEKLY: `Mingguan (${donation.selectedDay || "Setiap Pekan"})`,
    MONTHLY: "Bulanan",
  }[donation.frequency] || donation.frequency;

  const routineTypeLabel =
    donation.routineType === "AUTO_DONATION"
      ? "Auto Debet / Potong Otomatis"
      : "Pengingat Ibadah Rutin";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[85vh] p-0 overflow-hidden flex flex-col bg-white border border-slate-200">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <DialogTitle className="text-base sm:text-lg font-medium text-slate-900 leading-tight">
              Rincian komitmen donasi rutin
            </DialogTitle>
            <AdminRoutineDonationStatusBadge status={donation.status} />
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 sm:px-6 space-y-3.5 text-sm">
          {/* Program & Nominal */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
            <div>
              <span className="text-sm text-slate-500 font-normal block">Program donasi</span>
              <span className="font-medium text-slate-900 block mt-0.5 leading-snug">
                {decodeHtmlEntities(donation.programTitle)}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
              <span className="text-sm text-slate-500 font-normal">Nominal komitmen</span>
              <span className="font-medium text-emerald-700 text-sm">
                {formatRupiah(donation.amount)}
              </span>
            </div>
          </div>

          {/* Profil Donatur */}
          <div className="space-y-2 rounded-lg border border-slate-100 p-3">
            <h4 className="text-sm font-medium text-slate-700">
              Profil donatur
            </h4>
            <div className="space-y-1.5 font-normal">
              <div className="flex items-center gap-2 text-slate-800">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-medium">{donation.donorName}</span>
                {donation.isAnonymous && (
                  <span className="text-sm px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-normal">
                    Anonim publik
                  </span>
                )}
              </div>

              {donation.donorEmail && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{maskEmail(donation.donorEmail)}</span>
                </div>
              )}

              {donation.donorPhone && (
                <div className="flex items-center justify-between text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{maskPhone(donation.donorPhone)}</span>
                  </div>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-emerald-700 hover:text-emerald-800 font-medium"
                  >
                    <span>Hubungi WA</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Jadwal & Frekuensi */}
          <div className="space-y-2 rounded-lg border border-slate-100 p-3">
            <h4 className="text-sm font-medium text-slate-700">
              Jadwal &amp; frekuensi
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="space-y-0.5">
                <span className="text-slate-500 font-normal flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Frekuensi</span>
                </span>
                <span className="font-medium text-slate-800 text-sm block">
                  {frequencyLabel}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-500 font-normal flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Waktu pengingat</span>
                </span>
                <span className="font-medium text-slate-800 text-sm block">
                  Pukul {donation.reminderTime} WIB
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-0.5">
              <span className="text-sm text-slate-500 font-normal flex items-center gap-1">
                <HeartHandshake className="w-3.5 h-3.5 text-slate-400" />
                <span>Metode komitmen</span>
              </span>
              <span className="text-sm font-normal text-slate-700 block">
                {routineTypeLabel}
              </span>
            </div>
          </div>

          {/* Ubah Status */}
          <FormField label="Ubah status komitmen" className="pt-1">
            <div className="flex items-center gap-2">
              <Select
                defaultValue={donation.status}
                onValueChange={(val) => onStatusChange(donation.id, val)}
                disabled={isUpdating}
              >
                <SelectTrigger className="w-full h-9 text-sm font-normal bg-white">
                  <SelectValue placeholder="Pilih status baru" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE" className="text-sm font-normal">
                    Aktif (Berjalan Normal)
                  </SelectItem>
                  <SelectItem value="PAUSED" className="text-sm font-normal">
                    Dijeda (Sementara Waktu)
                  </SelectItem>
                  <SelectItem value="CANCELLED" className="text-sm font-normal">
                    Dibatalkan (Berhenti)
                  </SelectItem>
                  <SelectItem value="COMPLETED" className="text-sm font-normal">
                    Selesai (Program Selesai / Ditutup)
                  </SelectItem>
                </SelectContent>
              </Select>
              {isUpdating && <Loader2 className="w-4 h-4 animate-spin text-emerald-600 shrink-0" />}
            </div>
          </FormField>
        </div>

        <DialogFooter className="flex-col sm:flex-row sm:justify-between items-center gap-2">
          <AdminRoutineTriggerButton
            routineId={donation.id}
            routineType={donation.routineType}
          />
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-9 min-w-[84px] w-full sm:w-auto"
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
