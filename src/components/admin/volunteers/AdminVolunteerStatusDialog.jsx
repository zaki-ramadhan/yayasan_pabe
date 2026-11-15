"use client";

import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";
import { AdminVolunteerStatusBadge } from "./AdminVolunteerStatusBadge";

/**
 * Modal khusus untuk menindaklanjuti dan mengubah status pendaftaran relawan.
 * Terpisah dari dialog detail (read-only) untuk mencegah kebingungan dan salah klik.
 */
export function AdminVolunteerStatusDialog({
  isOpen,
  onClose,
  volunteer = null,
  onStatusChange,
  isUpdating = false,
}) {
  const [selectedStatus, setSelectedStatus] = useState(() => volunteer?.status || "PENDING");
  const [confirmDialogData, setConfirmDialogData] = useState(null);

  if (!volunteer) return null;

  const handleSave = () => {
    if (!selectedStatus || selectedStatus === volunteer.status) {
      onClose();
      return;
    }

    // Jika perubahan status krusial (APPROVED atau REJECTED), tampilkan konfirmasi santun
    if (selectedStatus === "APPROVED" || selectedStatus === "REJECTED") {
      setConfirmDialogData(selectedStatus);
    } else {
      onStatusChange(volunteer.id, selectedStatus);
      onClose();
    }
  };

  const handleConfirmSave = async () => {
    if (!confirmDialogData) return;
    const targetStatus = confirmDialogData;
    setConfirmDialogData(null);
    await onStatusChange(volunteer.id, targetStatus);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] p-0 overflow-hidden flex flex-col bg-white border border-slate-200">
          <DialogHeader className="border-b border-slate-100">
            <DialogTitle className="text-base sm:text-lg font-medium text-slate-900 leading-tight">
              Tindak lanjut status relawan
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 sm:px-6 space-y-4 text-sm">
            {/* Ringkasan Profil Singkat */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-slate-900 text-sm truncate">
                  {volunteer.fullName}
                </span>
                <AdminVolunteerStatusBadge status={volunteer.status} />
              </div>
              <p className="text-xs text-slate-500 font-normal">
                {volunteer.city || "Kota belum diisi"} &bull; {volunteer.interest}
              </p>
            </div>

            {/* Pilihan Status Baru */}
            <div className="space-y-1.5">
              <label htmlFor="volunteer-status-select" className="text-sm font-medium text-slate-700 block">
                Pilih status baru:
              </label>
              <Select
                value={selectedStatus}
                onValueChange={setSelectedStatus}
                disabled={isUpdating}
              >
                <SelectTrigger id="volunteer-status-select" className="h-10 w-full text-sm font-normal bg-white border border-slate-300">
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

            {/* Keterangan Konteks Status */}
            {selectedStatus === "APPROVED" && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2.5 text-xs text-emerald-800">
                <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Menyetujui pendaftaran ini akan mengaktifkan kartu anggota resmi dan otomatis mengirimkan surat tanda terima ke email pendaftar.
                </span>
              </div>
            )}

            {selectedStatus === "REJECTED" && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  Menolak pendaftaran ini akan otomatis mengirimkan surat pemberitahuan santun ke email pendaftar.
                </span>
              </div>
            )}

            {selectedStatus === "CONTACTED" && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2.5 text-xs text-blue-800">
                <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Menandai bahwa pengurus telah menghubungi calon relawan ini untuk wawancara atau koordinasi awal.
                </span>
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-slate-100 p-4 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isUpdating}
              className="h-9 px-4 text-sm font-normal cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isUpdating || selectedStatus === volunteer.status}
              className="h-9 px-4 text-sm font-medium bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer disabled:opacity-50"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                "Simpan status"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Konfirmasi Tingkat Lanjut Saat Status Krusial Dipilih */}
      <ConfirmDialog
        isOpen={Boolean(confirmDialogData)}
        onClose={() => setConfirmDialogData(null)}
        onConfirm={handleConfirmSave}
        isLoading={isUpdating}
        title={
          confirmDialogData === "APPROVED"
            ? "Setujui pendaftaran relawan?"
            : "Tolak pendaftaran relawan?"
        }
        description={
          confirmDialogData === "APPROVED"
            ? `Pendaftaran atas nama "${volunteer.fullName}" akan disetujui, dan surat resmi penerimaan relawan akan dikirimkan ke email beliau.`
            : `Pendaftaran atas nama "${volunteer.fullName}" akan ditandai belum dapat disetujui, dan surat pemberitahuan santun akan dikirimkan ke email beliau.`
        }
        confirmLabel={confirmDialogData === "APPROVED" ? "Ya, setujui" : "Ya, tolak"}
        confirmVariant={confirmDialogData === "APPROVED" ? "default" : "destructive"}
        cancelLabel="Batal"
      />
    </>
  );
}

