"use client";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { VolunteerPrintDialog } from "@/components/volunteer/VolunteerPrintDialog";
import { AdminVolunteerBulkDownloadDialog } from "./AdminVolunteerBulkDownloadDialog";

export function AdminVolunteerDialogs({
  statusChangeToConfirm,
  onCloseStatusChange,
  onConfirmStatusChange,
  updatingVolunteerId,
  cardVolunteer,
  onCloseCardVolunteer,
  isBulkDownloadOpen,
  onCloseBulkDownload,
  selectedVolunteers,
  onClearSelection,
  volunteerToDelete,
  onCloseDelete,
  onConfirmDelete,
  isDeleting,
  isBulkDeleteOpen,
  onCloseBulkDelete,
  onConfirmBulkDelete,
  isBulkDeleting,
  selectedCount,
  bulkStatusToConfirm,
  onCloseBulkStatus,
  onConfirmBulkStatus,
  isBulkStatusUpdating,
}) {
  const isApprovedStatus =
    statusChangeToConfirm?.targetStatus === "APPROVED" ||
    statusChangeToConfirm?.targetStatus === "ACCEPTED";

  const isBulkApproved =
    bulkStatusToConfirm === "APPROVED" || bulkStatusToConfirm === "ACCEPTED";

  return (
    <>
      <ConfirmDialog
        isOpen={Boolean(statusChangeToConfirm)}
        onClose={onCloseStatusChange}
        onConfirm={onConfirmStatusChange}
        isLoading={updatingVolunteerId === statusChangeToConfirm?.id}
        title={
          isApprovedStatus
            ? "Terima pendaftaran relawan?"
            : "Tolak pendaftaran relawan?"
        }
        description={
          isApprovedStatus ? (
            <>
              Terima pendaftaran{" "}
              <strong className="text-slate-900 font-semibold">
                {statusChangeToConfirm?.name}
              </strong>
              ?{" "}
              <strong className="text-emerald-700 font-semibold">
                Kartu relawan resmi akan langsung aktif
              </strong>{" "}
              dan email pemberitahuan otomatis dikirimkan ke{" "}
              <strong className="text-slate-900 font-semibold">
                {statusChangeToConfirm?.email || "email relawan"}
              </strong>
              .
            </>
          ) : (
            <>
              Tandai berkas{" "}
              <strong className="text-slate-900 font-semibold">
                {statusChangeToConfirm?.name}
              </strong>{" "}
              <strong className="text-slate-900 font-semibold">
                belum dapat diterima
              </strong>
              ? Surat pemberitahuan santun akan dikirimkan ke{" "}
              <strong className="text-slate-900 font-semibold">
                {statusChangeToConfirm?.email || "email relawan"}
              </strong>
              .
            </>
          )
        }
        confirmLabel={
          isApprovedStatus
            ? "Ya, terima & aktifkan kartu"
            : "Ya, tolak berkas"
        }
        confirmVariant={isApprovedStatus ? "default" : "destructive"}
        cancelLabel="Batal"
      />

      <VolunteerPrintDialog
        isOpen={Boolean(cardVolunteer)}
        onClose={onCloseCardVolunteer}
        volunteer={cardVolunteer}
      />

      <AdminVolunteerBulkDownloadDialog
        isOpen={isBulkDownloadOpen}
        onClose={onCloseBulkDownload}
        selectedVolunteers={selectedVolunteers}
        onComplete={onClearSelection}
      />

      <ConfirmDialog
        isOpen={Boolean(volunteerToDelete)}
        onClose={onCloseDelete}
        onConfirm={onConfirmDelete}
        isLoading={isDeleting}
        title="Hapus data relawan"
        description={
          <>
            Hapus berkas pendaftaran relawan atas nama{" "}
            <strong className="text-slate-900 font-semibold">
              &ldquo;{volunteerToDelete?.name}&rdquo;
            </strong>
            ? Tindakan ini{" "}
            <strong className="text-slate-900 font-semibold">
              tidak dapat dibatalkan
            </strong>
            .
          </>
        }
        confirmLabel="Hapus sekarang"
        confirmVariant="destructive"
      />

      <ConfirmDialog
        isOpen={isBulkDeleteOpen}
        onClose={onCloseBulkDelete}
        onConfirm={onConfirmBulkDelete}
        isLoading={isBulkDeleting}
        title={`Hapus ${selectedCount} data relawan`}
        description={
          <>
            Apakah Anda yakin ingin menghapus{" "}
            <strong className="text-slate-900 font-semibold">
              {selectedCount} data pendaftar relawan terpilih
            </strong>
            ? Tindakan ini{" "}
            <strong className="text-slate-900 font-semibold">
              tidak dapat dibatalkan
            </strong>
            .
          </>
        }
        confirmLabel="Hapus sekarang"
        confirmVariant="destructive"
      />

      <ConfirmDialog
        isOpen={Boolean(bulkStatusToConfirm)}
        onClose={onCloseBulkStatus}
        onConfirm={onConfirmBulkStatus}
        isLoading={isBulkStatusUpdating}
        title={
          isBulkApproved
            ? `Terima ${selectedCount} relawan terpilih?`
            : `Tolak ${selectedCount} relawan terpilih?`
        }
        description={
          isBulkApproved ? (
            <>
              Apakah Anda yakin ingin menerima{" "}
              <strong className="text-emerald-700 font-semibold">
                {selectedCount} pendaftar relawan terpilih
              </strong>
              ? Surat resmi tanda anggota akan otomatis dikirimkan ke email
              masing-masing pendaftar.
            </>
          ) : (
            <>
              Apakah Anda yakin ingin menandai{" "}
              <strong className="text-slate-900 font-semibold">
                belum disetujui
              </strong>{" "}
              untuk{" "}
              <strong className="text-slate-900 font-semibold">
                {selectedCount} pendaftar relawan terpilih
              </strong>
              ? Surat pemberitahuan santun akan dikirimkan ke email
              masing-masing pendaftar.
            </>
          )
        }
        confirmLabel={
          isBulkApproved ? "Ya, terima semua" : "Ya, tolak semua"
        }
        confirmVariant={isBulkApproved ? "default" : "destructive"}
        cancelLabel="Batal"
      />
    </>
  );
}

