"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DonorCareerTimeline } from "./DonorCareerTimeline";
import { formatDate } from "@/lib/formatters";
import { MapPointIcon as MapPin } from "@solar-icons/react/line-duotone/map-point";
import { CaseRoundIcon as Briefcase } from "@solar-icons/react/line-duotone/case-round";

const STATUS_LABELS = {
  PENDING: { label: "Menunggu", bg: "bg-amber-50 text-amber-800 border-amber-200" },
  REVIEWED: { label: "Ditinjau", bg: "bg-sky-50 text-sky-800 border-sky-200" },
  ACCEPTED: { label: "Diterima", bg: "bg-emerald-50 text-emerald-800 border-emerald-200 font-medium" },
  SHORTLISTED: { label: "Diterima", bg: "bg-emerald-50 text-emerald-800 border-emerald-200 font-medium" },
  APPROVED: { label: "Diterima", bg: "bg-emerald-50 text-emerald-800 border-emerald-200 font-medium" },
  REJECTED: { label: "Ditolak", bg: "bg-rose-50 text-rose-800 border-rose-200" },
};

export function DonorCareerCardItem({ application, onCancel }) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const statusInfo = STATUS_LABELS[application.status] || STATUS_LABELS.PENDING;
  const appliedDate = application.createdAt ? formatDate(application.createdAt) : "-";
  const isPending = application.status === "PENDING";

  const handleExecuteCancel = async () => {
    if (!onCancel || !application.id) return;
    try {
      setIsCancelling(true);
      await onCancel(application.id);
      setIsConfirmOpen(false);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      <Card className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-4">
        {/* Header: Judul & Badge Status di Kanan Atas */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="space-y-1.5 min-w-0 flex-1">
            {/* Baris 1: Judul Posisi */}
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 leading-snug">
              {application.position}
            </h3>

            {/* Baris 2: Detail ber-ikon (Lokasi & Tipe) */}
            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs text-slate-600 font-normal">
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {application.location}
              </span>
              <span className="inline-flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {application.type}
              </span>
            </div>

            {/* Baris 3: Divisi */}
            <p className="text-xs text-slate-500 font-normal">
              Divisi: <span className="font-medium text-slate-700">{application.department}</span>
            </p>
          </div>

          {/* Kanan Atas: Badge Status */}
          <div className="shrink-0 pt-0.5">
            <span className={`rounded-md border px-2.5 py-1 text-xs font-normal ${statusInfo.bg}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Stepper Timeline 3 Tahap */}
        <DonorCareerTimeline status={application.status} />

        {/* Footer: Tanggal Pengajuan (Kiri) & Tombol Batalkan (Kanan) */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs gap-3">
          <span className="text-xs text-slate-500 font-normal">
            Diajukan pada: <span className="font-medium text-slate-700">{appliedDate}</span>
          </span>

          {isPending && onCancel && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsConfirmOpen(true)}
              className="h-8 px-3 text-xs bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg shadow-2xs transition-colors cursor-pointer shrink-0"
            >
              Batalkan
            </Button>
          )}
        </div>
      </Card>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleExecuteCancel}
        title="Batalkan pengajuan lamaran?"
        description={
          <>
            Apakah Anda yakin ingin menarik berkas lamaran untuk posisi{" "}
            <strong className="text-slate-900 font-semibold">
              {application.position || "lowongan ini"}
            </strong>
            ? Pengajuan ini akan dibatalkan, dan Anda dapat kembali memilih atau melamar lowongan lain yang diinginkan.
          </>
        }
        confirmLabel="Ya, batalkan"
        cancelLabel="Kembali"
        confirmVariant="destructive"
        isLoading={isCancelling}
      />
    </>
  );
}

