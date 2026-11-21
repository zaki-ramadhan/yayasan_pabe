"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { formatRupiah, formatDate, decodeHtmlEntities } from "@/lib/formatters";
import { maskEmail, maskPhone } from "@/lib/security";
import { buildWhatsAppUrl } from "@/lib/whatsappUtils";
import { ArrowRightUpIcon as ArrowUpRight } from "@solar-icons/react/line-duotone/arrow-right-up";

export function AdminRoutineDonationDetailDialog({
  donation,
  isOpen,
  onClose,
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
      <DialogContent className="sm:min-w-[500px] sm:max-w-xl md:max-w-2xl min-h-[300px] sm:min-h-[360px] max-h-[85vh] p-0 overflow-hidden flex flex-col bg-white border border-slate-200">
        <DialogHeader className="border-b border-slate-100">
          <DialogTitle className="text-base sm:text-lg font-medium text-slate-900 leading-tight">
            Rincian komitmen donasi rutin
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 sm:px-6 space-y-5 text-sm">
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

          <div className="space-y-3 pb-5">
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

            {donation.status && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-700 font-normal shrink-0">Status komitmen</span>
                <span className="text-slate-900 text-right font-medium">
                  {donation.status === "ACTIVE"
                    ? "Aktif"
                    : donation.status === "PAUSED"
                    ? "Dijeda"
                    : "Selesai"}
                </span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-end items-center gap-2">
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
