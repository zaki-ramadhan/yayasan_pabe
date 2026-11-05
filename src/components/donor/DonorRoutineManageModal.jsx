"use client";

import { useState } from "react";
import { Pause, Play, XCircle, CalendarClock, AlertCircle } from "lucide-react";
import { formatRupiah } from "@/lib/formatters";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/useToast";

/**
 * Modal dialog untuk mengelola status jadwal donasi rutin donatur.
 * Aksi yang didukung: Jeda Sementara (PAUSED), Lanjutkan (ACTIVE), dan Batalkan (CANCELLED).
 */
export function DonorRoutineManageModal({
  routine,
  isOpen,
  onClose,
  onStatusUpdated,
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (!routine) return null;

  const isActive = routine.status === "ACTIVE";
  const isPaused = routine.status === "PAUSED";
  const isCancelled = routine.status === "CANCELLED";

  const handleUpdateStatus = async (newStatus) => {
    setIsUpdating(true);
    try {
      const res = await safeFetch("/api/donor/routine-donations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: routine.id,
          status: newStatus,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        if (typeof onStatusUpdated === "function") {
          onStatusUpdated(routine.id, newStatus);
        }
        onClose();
      } else {
        toast.error(data.message || "Gagal mengubah status donasi rutin.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat memperbarui donasi rutin.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && !isUpdating && onClose()}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <DialogHeader className="border-b border-slate-100 px-6 py-4">
            <DialogTitle className="text-base font-semibold text-slate-900">
              Kelola Jadwal Donasi Rutin
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Atur status komitmen keistiqamahan sedekah berkala Anda.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Kartu Rincian Jadwal */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Program Pilihan
                  </p>
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {routine.program}
                  </p>
                </div>
                <StatusBadge status={routine.status} />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/70 text-xs">
                <div>
                  <span className="text-slate-500 block mb-0.5">Nominal</span>
                  <span className="font-semibold text-emerald-800 text-sm tabular-nums">
                    {formatRupiah(routine.nominal)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Jadwal & Waktu</span>
                  <span className="font-medium text-slate-800 block truncate">
                    {routine.freq}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Pukul {routine.reminderTime || "05:00"} WIB
                  </span>
                </div>
              </div>
            </div>

            {/* Kotak Informasi Kontekstual */}
            {isActive && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-50/70 border border-emerald-200/70 text-xs text-emerald-800">
                <CalendarClock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  Jadwal sedang <strong>aktif</strong>. Notifikasi pengingat WhatsApp atau tagihan otomatis akan dikirimkan sesuai waktu yang telah Anda tentukan.
                </p>
              </div>
            )}

            {isPaused && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50/70 border border-amber-200/70 text-xs text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  Jadwal sedang <strong>dijeda sementara</strong>. Pengingat tidak akan dikirimkan sampai Anda mengaktifkannya kembali.
                </p>
              </div>
            )}

            {isCancelled && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600">
                <XCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <p>
                  Jadwal donasi ini telah <strong>dibatalkan</strong>. Anda dapat mendaftar jadwal baru kapan saja melalui menu donasi rutin.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isUpdating}
              className="text-xs text-slate-600 hover:text-slate-900 border-slate-200"
            >
              Tutup
            </Button>

            {!isCancelled && (
              <div className="flex items-center gap-2 justify-end">
                {isActive ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus("PAUSED")}
                    disabled={isUpdating}
                    isLoading={isUpdating}
                    className="text-xs font-medium bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400 gap-1.5 shadow-2xs cursor-pointer"
                  >
                    {!isUpdating && <Pause className="w-3.5 h-3.5 text-slate-500" />}
                    <span>Jeda sementara</span>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus("ACTIVE")}
                    disabled={isUpdating}
                    isLoading={isUpdating}
                    className="text-xs font-medium bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400 gap-1.5 shadow-2xs cursor-pointer"
                  >
                    {!isUpdating && <Play className="w-3.5 h-3.5 text-slate-600" />}
                    <span>Lanjutkan donasi</span>
                  </Button>
                )}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCancelConfirm(true)}
                  disabled={isUpdating}
                  isLoading={isUpdating}
                  className="text-xs font-medium bg-white text-slate-600 border-slate-300 hover:text-rose-600 hover:border-rose-300 hover:bg-slate-50 gap-1.5 shadow-2xs cursor-pointer"
                >
                  {!isUpdating && <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                  <span>Batalkan</span>
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Konfirmasi Pembatalan Destruktif */}
      <ConfirmDialog
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={async () => {
          setShowCancelConfirm(false);
          await handleUpdateStatus("CANCELLED");
        }}
        isLoading={isUpdating}
        title="Batalkan Jadwal Donasi Rutin"
        description="Apakah Anda yakin ingin membatalkan komitmen jadwal donasi rutin ini? Anda dapat mendaftar jadwal baru kapan saja."
        confirmLabel="Ya, batalkan"
        confirmVariant="destructive"
      />
    </>
  );
}
