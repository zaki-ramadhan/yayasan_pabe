"use client";

import { useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { getInitials, formatDate } from "@/lib/formatters";
import { formatVolunteerId } from "@/lib/volunteerUtils";
import { ORG_PROFILE } from "@/data/orgProfile";

export function VolunteerIdCard({ volunteer, className = "" }) {
  const regId = useMemo(() => {
    if (!volunteer) return "";
    return volunteer.volunteerId || formatVolunteerId(volunteer.id, volunteer.createdAt);
  }, [volunteer]);

  // Construct absolute validation URL
  const validationUrl = useMemo(() => {
    if (!volunteer?.id) return "";
    if (typeof window !== "undefined") {
      return `${window.location.origin}/relawan/validasi/${volunteer.id}`;
    }
    return `https://payungberkah.id/relawan/validasi/${volunteer.id}`;
  }, [volunteer]);

  if (!volunteer) return null;

  const initials = getInitials(volunteer.fullName, "R");

  return (
    <div
      id="volunteer-id-card-print"
      className={`relative w-full max-w-[340px] mx-auto rounded-xl border border-slate-300 bg-white shadow-md overflow-hidden text-slate-900 select-none ${className}`}
    >
      {/* Top Header Strip: Identitas Resmi Yayasan */}
      <div className="bg-emerald-800 text-white px-4 py-3 text-center border-b border-emerald-900">
        <p className="text-[10px] tracking-widest uppercase font-semibold text-emerald-200">
          Kartu Tanda Anggota Relawan
        </p>
        <h3 className="text-xs sm:text-sm font-semibold tracking-tight text-white line-clamp-1">
          {ORG_PROFILE.name}
        </h3>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex flex-col items-center text-center space-y-3">
        {/* Avatar / Foto Relawan */}
        <div className="relative">
          <Avatar className="w-20 h-20 rounded-full border-2 border-emerald-700/30 shadow-xs bg-slate-100">
            <AvatarFallback className="bg-emerald-50 text-emerald-900 font-semibold text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Nama & Nomor Anggota */}
        <div className="space-y-0.5 w-full">
          <h4
            className="text-base font-bold text-slate-950 tracking-tight line-clamp-1"
          >
            {volunteer.fullName}
          </h4>
          <p className="font-mono text-xs font-semibold text-emerald-800 tracking-wider">
            {regId}
          </p>
        </div>

        {/* Informasi Penugasan & Wilayah */}
        <div className="w-full bg-slate-50 border border-slate-200/90 rounded-lg p-2.5 space-y-1 text-left text-xs">
          <div className="flex justify-between items-center text-slate-600">
            <span>Bidang Aksi:</span>
            <span className="font-semibold text-slate-900 line-clamp-1 max-w-[170px] text-right">
              {volunteer.interest || "Relawan Kebaikan"}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span>Wilayah:</span>
            <span className="font-medium text-slate-800">
              {volunteer.city || "-"}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span>Masa Berlaku:</span>
            <span className="font-medium text-slate-800">
              {formatDate(volunteer.validUntil || volunteer.createdAt, { year: "numeric", month: "short" })}
            </span>
          </div>
        </div>

        {/* QR Code Verifikasi Lapangan */}
        <div className="pt-1 flex flex-col items-center space-y-1.5">
          <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
            <QRCodeSVG
              value={validationUrl}
              size={104}
              level="M"
              includeMargin={false}
            />
          </div>
          <p className="text-[10px] text-slate-500 font-normal">
            Pindai QR untuk verifikasi keaslian kartu
          </p>
        </div>
      </div>

      {/* Footer Cap Yayasan */}
      <div className="bg-slate-100 border-t border-slate-200/80 px-3 py-2 text-center text-[10px] text-slate-500">
        SK Kemenkumham: {ORG_PROFILE.legal.skKemenkumham}
      </div>
    </div>
  );
}
