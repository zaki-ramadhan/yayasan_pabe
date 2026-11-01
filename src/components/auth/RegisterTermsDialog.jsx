"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";

export function RegisterTermsDialog({ isOpen, onOpenChange, onAccept }) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl max-h-[85vh] p-0 overflow-hidden flex flex-col bg-white border border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg font-medium text-slate-950 leading-tight">
            Ketentuan Akad &amp; Kebijakan Privasi
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 sm:px-6 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="space-y-1">
            <h5 className="font-semibold text-slate-900">1. Akad Wakalah Donasi &amp; Zakat</h5>
            <p className="text-slate-600">
              Donasi yang disalurkan melalui platform ini bersifat sukarela dan ikhlas. Donatur memberikan kuasa penuh (<em>wakalah</em>) kepada Yayasan PABE untuk mengelola, mendistribusikan, dan menyalurkan dana kepada mustahik yang berhak sesuai syariat Islam.
            </p>
          </div>

          <div className="space-y-1">
            <h5 className="font-semibold text-slate-900">2. Kerahasiaan Data Pribadi (UU PDP No. 27/2022)</h5>
            <p className="text-slate-600">
              Yayasan berkomitmen penuh melindungi data pribadi Anda. Nomor kontak, riwayat transaksi, dan profil tidak akan pernah diperjualbelikan atau disalahgunakan kepada pihak ketiga manapun.
            </p>
          </div>

          <div className="space-y-1">
            <h5 className="font-semibold text-slate-900">3. Hak Donasi Anonim (Hamba Allah)</h5>
            <p className="text-slate-600">
              Anda berhak menyamarkan identitas publik pada setiap penyaluran program. Sistem tetap mencatat transaksi secara sah dan menerbitkan e-Kwitansi resmi di akun donatur Anda.
            </p>
          </div>

          <div className="space-y-1">
            <h5 className="font-semibold text-slate-900">4. Kanal Transaksi Resmi &amp; Audit Publik</h5>
            <p className="text-slate-600">
              Pembayaran donasi diproses melalui kanal resmi berlisensi Bank Indonesia (QRIS dan Virtual Account). Laporan keuangan dan penyaluran dapat ditinjau kapan saja melalui halaman Transparansi Publik.
            </p>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 pt-2 border-t border-slate-100 leading-relaxed">
            Ketentuan di atas merupakan rangkuman poin pokok. Tata kelola data selengkapnya (termasuk kebijakan cookie sesi, standar enkripsi server, dan hak penonaktifan akun) dapat Anda pelajari pada kebijakan privasi lengkap.
          </p>
        </div>

        <div className="px-5 py-3 sm:px-6 sm:py-3.5 border-t border-slate-100 bg-white shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link
            href="/kebijakan-privasi"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center sm:justify-start gap-1.5 text-xs sm:text-sm font-normal text-primary hover:text-primary-hover hover:underline transition-colors py-1"
          >
            <span>Baca kebijakan privasi lengkap</span>
            <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          </Link>
          <Button
            type="button"
            onClick={onAccept}
            className="w-full sm:w-auto h-9 px-4 rounded-lg text-xs sm:text-sm font-medium bg-primary hover:bg-primary-hover text-white cursor-pointer"
          >
            Saya Mengerti &amp; Setujui
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
