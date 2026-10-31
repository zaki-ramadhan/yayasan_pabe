"use client";

import Link from "next/link";
import { ShieldCheck, ShieldAlert, CheckCircle2, MapPin, Calendar, HeartHandshake, PhoneCall } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { formatDate, getInitials } from "@/lib/formatters";
import { ORG_PROFILE } from "@/data/orgProfile";
import { buildWhatsAppUrl } from "@/lib/whatsappUtils";

export function VolunteerVerificationCard({ volunteer }) {
  const isApproved = Boolean(volunteer && volunteer.isApproved);
  const initials = volunteer ? getInitials(volunteer.fullName, "R") : "?";

  if (!volunteer || !isApproved) {
    return (
      <div className="w-full max-w-lg mx-auto bg-white rounded-2xl border border-rose-200 shadow-sm overflow-hidden text-slate-900">
        <div className="bg-rose-50 border-b border-rose-200 p-6 text-center space-y-2">
          <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-rose-950">
            Identitas Tidak Terverifikasi
          </h2>
          <p className="text-xs sm:text-sm text-rose-700 max-w-sm mx-auto">
            ID ini tidak ditemukan atau belum disetujui sebagai relawan aktif Yayasan Payung Berkah.
          </p>
        </div>

        <div className="p-6 space-y-4 text-center">
          <p className="text-sm text-slate-600">
            Waspadalah terhadap penipuan atau oknum yang mengatasnamakan yayasan tanpa mandat resmi. Hubungi kantor layanan yayasan untuk konfirmasi lebih lanjut.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
            <a
              href={buildWhatsAppUrl(
                ORG_PROFILE.contacts.whatsapp,
                "Halo Admin Yayasan, saya ingin verifikasi keaslian relawan"
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <Button className="w-full sm:w-auto h-9.5 text-sm font-medium gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer">
                <PhoneCall className="w-4 h-4" />
                <span>Hubungi yayasan</span>
              </Button>
            </a>
            <Link href="/" className="inline-flex">
              <Button variant="outline" className="w-full sm:w-auto h-9.5 text-sm font-normal cursor-pointer">
                Kembali ke beranda
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-2xl border border-emerald-200 shadow-sm overflow-hidden text-slate-900">
      {/* Top Banner Status Sah */}
      <div className="bg-emerald-700 text-white p-5 sm:p-6 text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-100 text-xs font-medium border border-emerald-600">
          <ShieldCheck className="w-4 h-4 text-emerald-300" />
          <span>Verifikasi Resmi Berhasil</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          Relawan Resmi Terdaftar
        </h2>
        <p className="text-xs sm:text-sm text-emerald-100 max-w-sm mx-auto">
          {ORG_PROFILE.name}
        </p>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <Avatar className="w-20 h-20 rounded-full border-2 border-emerald-600/30 shadow-xs bg-slate-100 shrink-0">
            <AvatarFallback className="bg-emerald-50 text-emerald-900 font-bold text-2xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
              <h3 className="text-lg font-bold text-slate-950 tracking-tight">
                {volunteer.fullName}
              </h3>
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
            </div>
            <p className="font-mono text-xs font-semibold text-emerald-800 tracking-wider">
              ID Anggota: {volunteer.volunteerId}
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 text-xs sm:text-sm">
          <div className="flex justify-between items-center p-3">
            <span className="text-slate-500 font-normal">Status Keanggotaan:</span>
            <span className="font-semibold text-emerald-800 text-right">Relawan Resmi Aktif</span>
          </div>
          <div className="flex justify-between items-center p-3">
            <span className="text-slate-500 font-normal flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Wilayah Domisili:</span>
            </span>
            <span className="font-medium text-slate-900">{volunteer.city || "-"}</span>
          </div>
          <div className="flex justify-between items-center p-3">
            <span className="text-slate-500 font-normal flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Tanggal Terdaftar:</span>
            </span>
            <span className="font-medium text-slate-900">{formatDate(volunteer.createdAt)}</span>
          </div>
          <div className="flex justify-between items-center p-3">
            <span className="text-slate-500 font-normal">Masa Berlaku ID:</span>
            <span className="font-semibold text-emerald-800">{formatDate(volunteer.validUntil)}</span>
          </div>
        </div>

        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-1.5 text-xs text-emerald-950">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-900">
            <HeartHandshake className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Pernyataan Keabsahan Mandat:</span>
          </div>
          <p className="text-slate-700 leading-relaxed font-normal">
            Pemegang kartu ini adalah personel relawan yang sah bertugas dalam aksi sosial kemanusiaan dan pendidikan {ORG_PROFILE.name}.
          </p>
          <p className="text-[11px] text-slate-500 pt-1 border-t border-emerald-200/60 font-mono">
            SK Kemenkumham: {ORG_PROFILE.legal.skKemenkumham}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
          <Link href="/" className="inline-flex w-full sm:w-auto">
            <Button variant="outline" className="w-full h-9 text-xs sm:text-sm font-normal cursor-pointer">
              Profil Yayasan
            </Button>
          </Link>
          <a
            href={buildWhatsAppUrl(ORG_PROFILE.contacts.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full sm:w-auto"
          >
            <Button className="w-full h-9 text-xs sm:text-sm font-normal gap-1.5 bg-slate-900 hover:bg-slate-800 text-white cursor-pointer">
              Konfirmasi ke Pengurus
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
