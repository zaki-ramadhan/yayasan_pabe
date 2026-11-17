"use client";

import { formatDate } from "@/lib/formatters";

/**
 * Kartu Data Relawan Publik (Read-Only Form-Style Display).
 * Meniru susunan form data diri profil secara presisi dan bersih,
 * tanpa dekorasi ikon berlebih, tanpa emoji, dan tanpa field Kemenkumham yang asing.
 */
export function VolunteerPublicDataCard({ volunteer }) {
  const joinDate = formatDate(volunteer?.createdAt, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const validUntilDate = formatDate(volunteer?.validUntil, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const interestText = volunteer?.interest || "Relawan";

  return (
    <section className="p-5 sm:p-7 md:p-8 bg-white border-t border-slate-200/80">
      <div className="pb-4 mb-5 border-b border-slate-200/80">
        <h2 className="text-base font-medium text-slate-950 leading-snug">
          Informasi Data Diri
        </h2>
        <p className="text-sm font-normal text-slate-500 mt-0.5">
          Data identitas dan keabsahan keanggotaan relawan Yayasan Payung Berkah.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 block">
            Nama lengkap
          </label>
          <div className="h-9.5 px-3 rounded-md bg-slate-50/70 border border-slate-200 text-sm font-normal text-slate-900 flex items-center">
            {volunteer?.fullName || "-"}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 block">
            ID Relawan
          </label>
          <div className="h-9.5 px-3 rounded-md bg-slate-50/70 border border-slate-200 text-sm font-normal text-slate-900 font-mono flex items-center">
            #{volunteer?.volunteerId || "-"}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 block">
            Bidang penugasan
          </label>
          <div className="h-9.5 px-3 rounded-md bg-slate-50/70 border border-slate-200 text-sm font-normal text-slate-900 flex items-center">
            {interestText}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 block">
            Wilayah domisili
          </label>
          <div className="h-9.5 px-3 rounded-md bg-slate-50/70 border border-slate-200 text-sm font-normal text-slate-900 flex items-center">
            {volunteer?.city || "DKI Jakarta"}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 block">
            Tanggal bergabung
          </label>
          <div className="h-9.5 px-3 rounded-md bg-slate-50/70 border border-slate-200 text-sm font-normal text-slate-900 flex items-center">
            {joinDate}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 block">
            Masa berlaku
          </label>
          <div className="h-9.5 px-3 rounded-md bg-slate-50/70 border border-slate-200 text-sm font-normal text-slate-900 flex items-center">
            Sampai {validUntilDate}
          </div>
        </div>
      </div>
    </section>
  );
}

export default VolunteerPublicDataCard;
