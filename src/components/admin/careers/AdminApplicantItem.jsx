"use client";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";
import { UserAvatar } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/formatters";
import { buildWhatsAppUrl } from "@/lib/whatsappUtils";
import { WhatsAppIcon } from "@/components/icons/SocialIcons";
import { Mail, Phone, ExternalLink, FileText, Loader2 } from "lucide-react";

/**
 * Sub-widget item tunggal pelamar: data identitas, kontak, direct WhatsApp, resume, cover letter, dan status selector.
 */
export function AdminApplicantItem({
  application,
  isUpdating = false,
  onStatusChange,
}) {
  const waUrl = application.phone ? buildWhatsAppUrl(application.phone) : null;

  return (
    <div className="py-4 space-y-3 first:pt-4 last:pb-4">
      {/* Baris Atas: Identitas Pelamar & Dropdown Status */}
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
          <StatusBadge status={application.status} className="text-xs px-2.5 py-0.5" />

          <Select
            value={application.status}
            onValueChange={(val) => onStatusChange(application.id, val)}
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
            <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400 shrink-0" />
          )}
        </div>
      </div>

      {/* Baris Tengah: Kontak Email, WhatsApp / Telepon, & Resume CV */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
        <span className="flex items-center gap-1.5">
          <Mail className="w-4 h-4 text-slate-400" />
          <span className="font-normal text-slate-700">
            {application.email || "-"}
          </span>
        </span>

        {/* Nomor Kontak dengan Ikon WhatsApp & Direct Link */}
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
              <Phone className="w-4 h-4 text-slate-400" />
              <span className="font-normal text-slate-700">{application.phone || "-"}</span>
            </>
          )}
        </span>

        {application.resumeUrl && (
          <span className="flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-slate-400" />
            <a
              href={application.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline flex items-center gap-0.5 font-normal"
            >
              <span>Unduh Resume/CV</span>
              <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
            </a>
          </span>
        )}
      </div>

      {/* Baris Bawah: Surat Pengantar & Motivasi (Jika ada) */}
      {application.coverLetter && (
        <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-200/70 text-sm text-slate-700 leading-relaxed font-normal">
          <span className="font-medium text-slate-900 block mb-1">
            Surat Pengantar &amp; Motivasi:
          </span>
          {application.coverLetter}
        </div>
      )}
    </div>
  );
}
