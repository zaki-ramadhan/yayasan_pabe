"use client";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

/**
 * Modal dialog konfirmasi tindakan destruktif: pembatalan pendaftaran atau pengunduran diri relawan.
 * Memanfaatkan ConfirmDialog universal untuk menjamin konsistensi visual, aksesibilitas, dan anti god-file.
 */
export function VolunteerCancellationDialog({
  isOpen,
  onClose,
  onConfirm,
  status = "PENDING",
  isLoading = false,
}) {
  const isApproved = status === "APPROVED" || status === "ACCEPTED";

  const title = isApproved
    ? "Berhenti menjadi relawan"
    : "Batalkan pendaftaran relawan";

  const description = isApproved ? (
    <>
      Apakah Anda yakin ingin mengundurkan diri sebagai relawan aktif <strong className="text-slate-900 font-semibold">Yayasan Payung Berkah</strong>? <strong className="text-slate-900 font-semibold">Kartu relawan digital dan hak penugasan Anda akan dinonaktifkan</strong>.
    </>
  ) : (
    <>
      Apakah Anda ingin membatalkan pendaftaran relawan ini? <strong className="text-slate-900 font-semibold">Data pendaftaran yang sudah dikirim akan dihapus permanen</strong>.
    </>
  );

  const actionText = isApproved
    ? "Ya, berhenti sekarang"
    : "Ya, batalkan pendaftaran";

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      isLoading={isLoading}
      title={title}
      description={description}
      confirmLabel={actionText}
      confirmVariant="destructive"
      cancelLabel="Batal"
      loadingLabel="Memproses..."
    />
  );
}

export default VolunteerCancellationDialog;

