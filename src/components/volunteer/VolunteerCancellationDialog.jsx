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
  const isApproved = status === "APPROVED";

  const title = isApproved
    ? "Berhenti menjadi relawan"
    : "Batalkan pendaftaran relawan";

  const description = isApproved
    ? "Apakah Anda yakin ingin mengundurkan diri sebagai relawan aktif Yayasan Payung Berkah? Kartu relawan dan hak penugasan Anda akan dinonaktifkan."
    : "Apakah Anda ingin membatalkan pendaftaran relawan ini? Data yang sudah dikirim akan dihapus.";

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

