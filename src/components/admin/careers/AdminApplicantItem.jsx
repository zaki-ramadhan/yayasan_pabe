"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";
import { UserAvatar } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatDate } from "@/lib/formatters";
import { buildWhatsAppUrl } from "@/lib/whatsappUtils";
import { WhatsAppIcon } from "@/components/icons/SocialIcons";
import { LetterIcon } from "@solar-icons/react/line-duotone/letter";
import { PhoneIcon } from "@solar-icons/react/line-duotone/phone";
import { ArrowRightUpIcon } from "@solar-icons/react/linear/arrow-right-up";
import { DocumentTextIcon } from "@solar-icons/react/line-duotone/document-text";
import { getFileIconAsset } from "@/lib/fileIconHelper";
import { LoaderIcon } from "@solar-icons/react/linear/loader";

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
    if (val === "SHORTLISTED" || val === "REJECTED") {
      setPendingStatus(val);
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
          <StatusBadge status={application.status} />

          <Select
            value={application.status}
            onValueChange={handleSelectStatus}
            disabled={isUpdating}
          >
            <SelectTrigger className="h-8 w-36 text-sm bg-white text-slate-700 font-normal border-slate-200">
              <SelectValue placeholder="Ubah status" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="PENDING" className="text-sm text-slate-700 font-normal">
                Menunggu
              </SelectItem>
              <SelectItem value="REVIEWED" className="text-sm text-slate-700 font-normal">
                Telah direview
              </SelectItem>
              <SelectItem value="SHORTLISTED" className="text-sm text-slate-700 font-normal">
                Lolos seleksi
              </SelectItem>
              <SelectItem value="REJECTED" className="text-sm text-slate-700 font-normal">
                Belum sesuai
              </SelectItem>
            </SelectContent>
          </Select>
          {isUpdating && (
            <LoaderIcon className="w-3.5 h-3.5 animate-spin text-slate-400 shrink-0" />
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
        <span className="flex items-center gap-1.5">
          <LetterIcon className="w-4 h-4 text-slate-400" />
          <span className="font-normal text-slate-700">
            {application.email || "-"}
          </span>
        </span>

        <span className="flex items-center gap-1.5">
          {waUrl ? (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-normal text-slate-700 hover:text-emerald-700 hover:underline inline-flex items-center gap-1.5 group"
              title="Hubungi via WhatsApp"
            >
              <WhatsAppIcon className="w-4 h-4 text-emerald-600 group-hover:scale-105 transition-transform shrink-0" />
              <span>{application.phone}</span>
            </a>
          ) : (
            <>
              <PhoneIcon className="w-4 h-4 text-slate-400" />
              <span className="font-normal text-slate-700">{application.phone || "-"}</span>
            </>
          )}
        </span>

        {application.resumeUrl && (
          <span className="flex items-center gap-1.5">
            <Image
              src={getFileIconAsset(application.resumeUrl, "pdf")}
              alt="Berkas CV"
              width={18}
              height={18}
              className="w-4.5 h-4.5 object-contain shrink-0"
            />
            <a
              href={application.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline flex items-center gap-0.5 font-normal"
            >
              <span>Unduh Resume/CV</span>
              <ArrowRightUpIcon className="w-3.5 h-3.5 ml-0.5" />
            </a>
          </span>
        )}
      </div>

      {application.coverLetter && (
        <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-200/70 text-sm text-slate-700 leading-relaxed font-normal">
          <span className="font-medium text-slate-900 block mb-1">
            Surat Pengantar &amp; Motivasi:
          </span>
          {application.coverLetter}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(pendingStatus)}
        onClose={() => setPendingStatus(null)}
        onConfirm={handleConfirmStatus}
        isLoading={isUpdating}
        title={
          pendingStatus === "SHORTLISTED"
            ? "Loloskan berkas lamaran kerja?"
            : "Tolak berkas lamaran kerja?"
        }
        description={
          pendingStatus === "SHORTLISTED" ? (
            <>
              Pelamar atas nama{" "}
              <strong className="text-slate-900 font-semibold">
                {application.fullName}
              </strong>{" "}
              akan ditandai{" "}
              <strong className="text-emerald-700 font-semibold">
                lolos seleksi berkas
              </strong>
              , dan surat pemberitahuan wawancara akan otomatis dikirimkan ke email
              beliau.
            </>
          ) : (
            <>
              Pelamar atas nama{" "}
              <strong className="text-slate-900 font-semibold">
                {application.fullName}
              </strong>{" "}
              akan ditandai{" "}
              <strong className="text-slate-900 font-semibold">
                belum sesuai kriteria
              </strong>
              , dan surat pemberitahuan santun akan dikirimkan ke email beliau.
            </>
          )
        }
        confirmLabel={pendingStatus === "SHORTLISTED" ? "Ya, loloskan" : "Ya, tolak"}
        confirmVariant={pendingStatus === "SHORTLISTED" ? "default" : "destructive"}
        cancelLabel="Batal"
      />
    </div>
  );
}
