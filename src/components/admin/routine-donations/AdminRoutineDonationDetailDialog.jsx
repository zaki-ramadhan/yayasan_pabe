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
import { AdminRoutineTriggerButton } from "./AdminRoutineTriggerButton";
import { formatRupiah, formatDate, decodeHtmlEntities } from "@/lib/formatters";
import { maskEmail, maskPhone } from "@/lib/security";
import { buildWhatsAppUrl } from "@/lib/whatsappUtils";
import { ArrowUpRight, Loader2 } from "lucide-react";

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
      <DialogContent className="sm:max-w-xl md:max-w-2xl max-h-[85vh] p-0 overflow-hidden flex flex-col bg-white border border-slate-200">
        <DialogHeader className="border-b border-slate-100">
          <DialogTitle className="text-base sm:text-lg font-medium text-slate-900 leading-tight">
            Rincian komitmen donasi rutin
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 sm:px-6 space-y-5 text-sm">
          {/* Section 1: Profil Donatur */}
          <div className="space-y-3 pb-5 border-b border-slate-100">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-700 font-normal shrink-0">Nama donatur</span>
              <span className="text-slate-900 text-right">
                {donation.donorName}
                {donation.isAnonymous && (
                  <span className="ml-1.5 text-xs text-slate-500 font-normal">(Anonim)</span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-700 font-normal shrink-0">Email</span>
              <span className="text-slate-900 text-right truncate">
                {donation.donorEmail ? maskEmail(donation.donorEmail) : "-"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-700 font-normal shrink-0">Nomor telepon</span>
              <div className="flex items-center gap-2 text-right">
                <span className="text-slate-900 tabular-nums">
                  {donation.donorPhone ? maskPhone(donation.donorPhone) : "-"}
                </span>
                {donation.donorPhone && (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 text-xs text-emerald-700 hover:text-emerald-800 font-medium hover:underline"
                  >
                    <span>Hubungi WA</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Program & Komitmen Nominal */}
          <div className="space-y-3 pb-5 border-b border-slate-100">
            <div className="flex items-start justify-between gap-4">
              <span className="text-slate-700 font-normal shrink-0">Program donasi</span>
              <span className="text-slate-900 text-right max-w-[65%] leading-snug">
                {decodeHtmlEntities(donation.programTitle)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-700 font-normal shrink-0">Nominal komitmen</span>
              <span className="font-semibold text-emerald-700 text-base text-right tabular-nums">
                {formatRupiah(donation.amount)}
              </span>
            </div>
          </div>

          {/* Section 3: Jadwal & Ketentuan Komitmen */}
          <div className="space-y-3 pb-5 border-b border-slate-100">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-700 font-normal shrink-0">Frekuensi</span>
              <span className="text-slate-900 text-right">
                {frequencyLabel}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-700 font-normal shrink-0">Waktu pengingat</span>
              <span className="text-slate-900 text-right">
                Pukul {donation.reminderTime} WIB
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-700 font-normal shrink-0">Metode komitmen</span>
              <span className="text-slate-900 text-right">
                {routineTypeLabel}
              </span>
            </div>

            {donation.createdAt && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-700 font-normal shrink-0">Mulai berkomitmen</span>
                <span className="text-slate-900 text-right">
                  {formatDate(donation.createdAt)}
                </span>
              </div>
            )}
          </div>

          {/* Section 4: Ubah Status Komitmen */}
          <div className="pt-1">
            <FormField label="Ubah status komitmen">
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
                    <SelectItem value="COMPLETED" className="text-sm font-normal">
                      Selesai (Program Selesai / Ditutup)
                    </SelectItem>
                  </SelectContent>
                </Select>
                {isUpdating && <Loader2 className="w-4 h-4 animate-spin text-emerald-600 shrink-0" />}
              </div>
            </FormField>
          </div>
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
