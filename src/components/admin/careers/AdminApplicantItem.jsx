"use client";

import { useState } from "react";
import { UserAvatar } from "@/components/ui/Avatar";
import { StatusSelectBadge } from "@/components/ui/StatusSelectBadge";
import { AdminApplicantContactInfo } from "./AdminApplicantContactInfo";
import { AdminApplicantStatusDialog } from "./AdminApplicantStatusDialog";
import { formatDate } from "@/lib/formatters";
import { buildWhatsAppUrl } from "@/lib/whatsappUtils";

export const APPLICANT_STATUS_OPTIONS = [
  { value: "PENDING", label: "Menunggu", color: "amber" },
  { value: "REVIEWED", label: "Ditinjau", color: "sky" },
  { value: "ACCEPTED", label: "Diterima", color: "emerald" },
  { value: "REJECTED", label: "Ditolak", color: "rose" },
];

const APPLICANT_ALIAS_MAP = {
  SHORTLISTED: "ACCEPTED",
  APPROVED: "ACCEPTED",
};

/**
 * Sub-widget item tunggal pelamar: data identitas, kontak, direct WhatsApp, resume, cover letter, dan status selector.
 */
export function AdminApplicantItem({
  application,
  isUpdating = false,
  onStatusChange,
}) {
  const [pendingStatus, setPendingStatus] = useState(null);
  const waUrl = application.phone ? buildWhatsAppUrl(application.phone) : null;

  const handleSelectStatus = (val) => {
    if (!val || val === application.status) return;
    if (val === "ACCEPTED" || val === "SHORTLISTED" || val === "REJECTED") {
      setPendingStatus(val === "SHORTLISTED" ? "ACCEPTED" : val);
    } else {
      onStatusChange(application.id, val);
    }
  };

  const handleConfirmStatus = async () => {
    if (!pendingStatus) return;
    const targetStatus = pendingStatus;
    setPendingStatus(null);
    await onStatusChange(application.id, targetStatus);
  };

  return (
    <div className="py-4 space-y-3 first:pt-4 last:pb-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-3">
          <UserAvatar
            name={application.fullName}
            fallback="P"
            className="w-9 h-9"
          />
          <div>
            <h4 className="text-sm font-medium text-slate-950">
              {application.fullName}
            </h4>
            <p className="text-sm font-normal text-slate-500">
              Melamar pada {formatDate(application.createdAt, { month: "short" })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusSelectBadge
            value={application.status}
            options={APPLICANT_STATUS_OPTIONS}
            onChange={handleSelectStatus}
            aliasMap={APPLICANT_ALIAS_MAP}
            variant="solid"
            size="sm"
            isUpdating={isUpdating}
            disabled={isUpdating}
            ariaLabel={`Ubah status lamaran ${application.fullName}`}
          />
        </div>
      </div>

      <AdminApplicantContactInfo
        email={application.email}
        phone={application.phone}
        waUrl={waUrl}
        resumeUrl={application.resumeUrl}
      />

      {application.coverLetter && (
        <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-200/70 text-sm text-slate-700 leading-relaxed font-normal">
          <span className="font-medium text-slate-900 block mb-1">
            Surat Pengantar &amp; Motivasi:
          </span>
          {application.coverLetter}
        </div>
      )}

      <AdminApplicantStatusDialog
        isOpen={Boolean(pendingStatus)}
        onClose={() => setPendingStatus(null)}
        onConfirm={handleConfirmStatus}
        isLoading={isUpdating}
        pendingStatus={pendingStatus}
        fullName={application.fullName}
      />
    </div>
  );
}
