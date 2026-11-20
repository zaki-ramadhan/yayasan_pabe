"use client";

import { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";
import { UserAvatar } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/ui/Badge";
import { AdminApplicantContactInfo } from "./AdminApplicantContactInfo";
import { AdminApplicantStatusDialog } from "./AdminApplicantStatusDialog";
import { formatDate } from "@/lib/formatters";
import { buildWhatsAppUrl } from "@/lib/whatsappUtils";
import { LoaderIcon } from "@solar-icons/react/linear/loader";

const APPLICANT_STATUS_CONFIG = {
  PENDING: { label: "Menunggu", variant: "warning" },
  REVIEWED: { label: "Ditinjau", variant: "info" },
  ACCEPTED: { label: "Diterima", variant: "success" },
  SHORTLISTED: { label: "Diterima", variant: "success" },
  REJECTED: { label: "Ditolak", variant: "danger" },
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
  const badgeConfig = APPLICANT_STATUS_CONFIG[application.status] || {};

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
          <StatusBadge
            status={application.status}
            label={badgeConfig.label}
            variant={badgeConfig.variant}
          />

          <Select
            value={application.status === "SHORTLISTED" ? "ACCEPTED" : application.status}
            onValueChange={handleSelectStatus}
            disabled={isUpdating}
          >
            <SelectTrigger className="h-8.5 w-44 text-sm bg-white text-slate-700 font-normal border-slate-200 px-3 whitespace-nowrap">
              <SelectValue placeholder="Ubah status" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="PENDING" className="text-sm text-slate-700 font-normal">
                Menunggu
              </SelectItem>
              <SelectItem value="REVIEWED" className="text-sm text-slate-700 font-normal">
                Ditinjau
              </SelectItem>
              <SelectItem value="ACCEPTED" className="text-sm text-slate-700 font-normal">
                Diterima
              </SelectItem>
              <SelectItem value="REJECTED" className="text-sm text-slate-700 font-normal">
                Ditolak
              </SelectItem>
            </SelectContent>
          </Select>
          {isUpdating && (
            <LoaderIcon className="w-3.5 h-3.5 animate-spin text-slate-400 shrink-0" />
          )}
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
