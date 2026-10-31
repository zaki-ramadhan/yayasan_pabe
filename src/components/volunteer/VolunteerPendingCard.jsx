"use client";

import { Clock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/formatters";

/**
 * Komponen status kartu pendaftaran relawan yang sedang dalam proses verifikasi (PENDING).
 * Menampilkan ringkasan pendaftaran dan tombol pembatalan.
 */
export function VolunteerPendingCard({
  volunteer,
  onCancelClick,
  className = "",
}) {
  if (!volunteer) return null;

  const joinDate = volunteer.createdAt
    ? formatDate(volunteer.createdAt, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

  return (
    <div
      className={`bg-white p-6 sm:p-8 rounded-2xl border border-amber-200/90 shadow-sm space-y-6 ${className}`}
    >
      {/* Header Status Peninjauan */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-5 border-b border-amber-100">
        <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
          <Clock className="w-6 h-6 animate-pulse" />
        </div>
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100/80 text-amber-900 text-xs font-semibold">
            Status: Menunggu Verifikasi
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-900">
            Pendaftaran Relawan Sedang Ditinjau
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Terima kasih telah mengajukan diri sebagai relawan aksi. Tim pengurus yayasan sedang memverifikasi data Anda.
          </p>
        </div>
      </div>

      {/* Ringkasan Data Pengajuan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm">
        <div>
          <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-medium">
            Nama Pendaftar
          </span>
          <span className="font-semibold text-slate-900 block mt-0.5">
            {volunteer.fullName}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-medium">
            Kota Domisili
          </span>
          <span className="font-semibold text-slate-900 block mt-0.5">
            {volunteer.city || "-"}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-medium">
            Tanggal Pengajuan
          </span>
          <span className="font-semibold text-slate-900 block mt-0.5">
            {joinDate}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-medium">
            Status Keanggotaan
          </span>
          <span className="font-semibold text-amber-700 block mt-0.5">
            Menunggu Verifikasi
          </span>
        </div>
      </div>

      {/* Edukasi Anti-Spam & Tombol Batalkan */}
      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <p className="text-slate-500 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Anda tidak perlu mendaftar ulang selama berkas masih ditinjau.</span>
        </p>

        {onCancelClick && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancelClick}
            className="h-9 px-3.5 text-xs text-rose-700 hover:text-rose-800 hover:bg-rose-50 border-rose-200 shrink-0 font-medium cursor-pointer"
          >
            Batalkan pendaftaran
          </Button>
        )}
      </div>
    </div>
  );
}

export default VolunteerPendingCard;
