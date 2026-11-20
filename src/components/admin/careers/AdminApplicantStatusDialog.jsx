"use client";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

/**
 * Modal dialog konfirmasi perubahan status penerimaan / penolakan pelamar karier.
 */
export function AdminApplicantStatusDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  pendingStatus,
  fullName = "",
}) {
  const isAccepted = pendingStatus === "ACCEPTED" || pendingStatus === "SHORTLISTED";

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      isLoading={isLoading}
      title={isAccepted ? "Terima berkas lamaran kerja?" : "Tolak berkas lamaran kerja?"}
      description={
        isAccepted ? (
          <>
            Pelamar atas nama{" "}
            <strong className="text-slate-900 font-semibold">{fullName}</strong>{" "}
            akan ditandai{" "}
            <strong className="text-emerald-700 font-semibold">diterima</strong>,
            dan surat pemberitahuan penerimaan akan dikirimkan ke email beliau.
          </>
        ) : (
          <>
            Pelamar atas nama{" "}
            <strong className="text-slate-900 font-semibold">{fullName}</strong>{" "}
            akan ditandai{" "}
            <strong className="text-slate-900 font-semibold">ditolak</strong>,
            dan surat pemberitahuan santun akan dikirimkan ke email beliau.
          </>
        )
      }
      confirmLabel={isAccepted ? "Ya, terima" : "Ya, tolak"}
      confirmVariant={isAccepted ? "default" : "destructive"}
      cancelLabel="Batal"
    />
  );
}

