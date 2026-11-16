"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ShieldWarningIcon as ShieldAlert } from "@solar-icons/react/line-duotone/shield-warning";
import { PhoneCallingIcon as PhoneCall } from "@solar-icons/react/line-duotone/phone-calling";
import { ArrowLeftIcon as ArrowLeft } from "@solar-icons/react/line-duotone/arrow-left";
import { Button } from "@/components/ui/Button";
import { toast } from "@/hooks/useToast";
import { ORG_PROFILE } from "@/data/orgProfile";
import { buildWhatsAppUrl } from "@/lib/whatsappUtils";

/**
 * Tampilan fallback jika ID kartu relawan yang dipindai tidak valid, belum disetujui, atau telah dinonaktifkan.
 * Menyajikan notifikasi kegagalan yang ramah dan opsi konfirmasi langsung ke pengurus yayasan.
 */
export function VolunteerInvalidCardFallback({ volunteer = null }) {
  useEffect(() => {
    toast.error("Identitas relawan tidak terdaftar atau belum aktif.");
  }, []);

  const waUrl = buildWhatsAppUrl(
    ORG_PROFILE.contacts.whatsapp,
    "Halo Admin Yayasan Payung Berkah, saya baru saja memindai kartu relawan namun statusnya belum terverifikasi. Mohon bantuan konfirmasi keabsahannya."
  );

  return (
    <div className="min-h-screen w-full bg-[#0b0f17] text-white flex flex-col justify-between p-4 sm:p-6 select-none">
      {/* Top Bar Minimalis */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between py-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Beranda yayasan</span>
        </Link>
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
          Sistem Verifikasi Mandat
        </span>
      </header>

      {/* Main Alert Box */}
      <main className="w-full max-w-md mx-auto my-auto py-8">
        <div className="bg-slate-900/90 border border-rose-900/40 rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-2xl backdrop-blur-xs">
          <div className="w-14 h-14 bg-rose-950/80 border border-rose-500/30 text-rose-400 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-lg sm:text-xl font-medium text-white leading-tight">
              Identitas belum terverifikasi
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Kartu tanda anggota ini tidak ditemukan di basis data resmi yayasan atau masa tugasnya belum aktif. Pastikan kode QR dipindai dari kartu fisik resmi Yayasan Payung Berkah.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full sm:w-auto"
              >
                <Button className="w-full h-9 px-4 text-xs sm:text-sm font-medium gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Hubungi yayasan</span>
                </Button>
              </a>
            )}
            <Link href="/" className="inline-flex w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full h-9 px-4 text-xs sm:text-sm font-medium border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 cursor-pointer"
              >
                Ke beranda
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="w-full max-w-4xl mx-auto text-center py-2 text-[11px] text-slate-500 font-mono">
        {ORG_PROFILE.name} • Verifikasi Kartu Relawan
      </footer>
    </div>
  );
}

export default VolunteerInvalidCardFallback;

