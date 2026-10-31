"use client";

import { useState } from "react";
import Link from "next/link";
import { UserCheck, Printer, Copy, Check, ExternalLink, LogOut } from "lucide-react";
import { VolunteerCardSwitcher } from "./VolunteerCardSwitcher";
import { Button } from "@/components/ui/Button";
import { copyToClipboard } from "@/lib/clipboard";
import { toast } from "@/hooks/useToast";

/**
 * Komponen sub-widget untuk relawan aktif yang telah disetujui (APPROVED).
 * Menampilkan KTA interaktif, aksi cetak, dan opsi pengunduran diri secara mandiri.
 */
export function VolunteerApprovedCard({
  volunteer,
  onResignClick,
  className = "",
}) {
  const [copied, setCopied] = useState(false);

  if (!volunteer) return null;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleCopyLink = async () => {
    if (!volunteer?.id) return;
    const url = typeof window !== "undefined"
      ? `${window.location.origin}/relawan/validasi/${volunteer.id}`
      : `https://payungberkah.id/relawan/validasi/${volunteer.id}`;

    const ok = await copyToClipboard(url);
    if (ok) {
      setCopied(true);
      toast.success("Tautan validasi relawan berhasil disalin.");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Gagal menyalin tautan.");
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Banner Identitas Anggota Aktif */}
      <div className="p-4 sm:p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mx-auto sm:mx-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-emerald-950 text-sm sm:text-base">
              Relawan Resmi Aktif
            </h3>
            <p className="text-xs sm:text-sm text-emerald-800">
              Anda telah terdaftar sebagai relawan resmi Yayasan Payung Berkah.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleCopyLink}
            className="h-9 px-3 text-xs sm:text-sm font-normal gap-1.5 cursor-pointer bg-white flex-1 sm:flex-initial"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
            <span>{copied ? "Tersalin" : "Salin tautan"}</span>
          </Button>
          <Button
            type="button"
            onClick={handlePrint}
            className="h-9 px-3.5 text-xs sm:text-sm font-medium gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer flex-1 sm:flex-initial"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak KTA</span>
          </Button>
        </div>
      </div>

      {/* Visualisasi Kartu Tanda Anggota (3D & 2D) */}
      <div className="py-2">
        <VolunteerCardSwitcher volunteer={volunteer} defaultMode="3d" />
      </div>

      {/* Link Validasi Publik & Opsi Pengunduran Diri */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
        <Link
          href={`/relawan/validasi/${volunteer.id}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 hover:underline font-medium"
        >
          <span>Uji coba tampilan scan QR publik</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {onResignClick && (
          <button
            type="button"
            onClick={onResignClick}
            className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-700 hover:underline font-medium cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Berhenti menjadi relawan</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default VolunteerApprovedCard;
