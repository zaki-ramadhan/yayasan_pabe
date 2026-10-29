import Image from "next/image";
import { Clock, ChevronDown } from "lucide-react";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { Skeleton } from "@/components/ui/Skeleton";
import { DashedDivider } from "@/components/ui/DashedDivider";
import { ASSET_PATHS } from "@/lib/assetConstants";

/**
 * Highly accurate 1:1 Skeleton Loader for Standalone Donation Invoice Page.
 * Matches Breadcrumb, Top Minimal Brand, QRIS Payment Card, and Scalloped Receipt Ticket exactly.
 */
export default function InvoiceLoading() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5">
      {/* Brand Header Sederhana */}
      <div className="pb-1">
        <div className="inline-flex items-center gap-2.5 select-none">
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 shrink-0 flex items-center justify-center">
            <Image
              src={ASSET_PATHS.BRANDING.LOGO}
              alt="Logo Yayasan Payung Berkah"
              width={36}
              height={36}
              priority
              className="object-contain"
            />
          </div>
          <span className="font-semibold text-sm sm:text-base text-slate-900 tracking-tight">
            Yayasan Payung Berkah
          </span>
        </div>
      </div>

      {/* 1. Breadcrumb (Identical to actual page, prevents layout shift) */}
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/" },
          { label: "Program", href: "/program" },
          { label: "Instruksi Pembayaran" },
        ]}
      />

      {/* 2. Two-Column Checkout Layout (7 Cols Left, 5 Cols Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SISI KIRI: Metode Pembayaran (QRIS) & Instruksi */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-xl border border-slate-300 p-5 sm:p-6 space-y-5 shadow-xs">
            {/* Header: Judul Metode & Badge */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-56 sm:w-64 rounded-md" />
                <p className="text-sm text-slate-600">
                  Scan kode QR untuk memproses transaksi.
                </p>
              </div>
              <span className="text-xs font-medium text-slate-600 px-2 py-0.5 rounded bg-slate-100 shrink-0">
                QRIS
              </span>
            </div>

            {/* Area QR Code (Square QRIS) */}
            <div className="flex flex-col items-center justify-center py-2 space-y-3.5 text-center">
              <div className="p-3 bg-white rounded-xl border border-slate-300 shadow-2xs">
                <Skeleton className="w-[210px] h-[210px] sm:w-[230px] sm:h-[230px] rounded-lg" />
              </div>

              <div className="space-y-1 text-center">
                <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight block">
                  YAYASAN PAYUNG BERKAH
                </span>
                <div className="flex items-center justify-center gap-2 text-xs text-slate-600 font-medium">
                  <span>NMID : <strong className="text-slate-900 font-semibold">ID1026604741144</strong></span>
                  <span className="text-slate-300">•</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-700">A01</span>
                </div>
              </div>

              <div className="space-y-1.5 flex flex-col items-center pt-0.5 max-w-sm w-full">
                <Skeleton className="h-3.5 w-full rounded" />
                <Skeleton className="h-3.5 w-4/5 rounded" />
              </div>
            </div>

            {/* Petunjuk Transfer Accordion (Single Row dengan Garis Putus-putus) */}
            <div className="space-y-2 pt-1">
              <DashedDivider />
              <div className="flex items-center justify-between py-2 text-slate-800">
                <Skeleton className="h-4 w-60 rounded" />
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            </div>
          </div>
        </div>

        {/* SISI KANAN: Lembar Tagihan Donasi (Ticket Receipt) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="relative">
            {/* Section Atas Tiket: Header Tagihan & Batas Waktu */}
            <div className="bg-white rounded-t-xl border-t border-x border-slate-300 p-5 sm:p-6 sm:py-4 pb-4 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-slate-600 block">Tagihan Donasi</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
                  <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  Menunggu Pembayaran
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 text-sm pt-0.5">
                <Skeleton className="h-4 w-36 rounded" />
                <Skeleton className="h-4 w-28 rounded" />
              </div>
            </div>

            {/* Divider Perforasi Tiket dengan Notch Sobekan Kiri & Kanan */}
            <div className="relative h-5 flex items-center bg-white -my-px">
              {/* Notch Kiri */}
              <svg
                width="10"
                height="20"
                viewBox="0 0 10 20"
                className="absolute left-0 top-0 block pointer-events-none"
                aria-hidden="true"
              >
                <path d="M 0 0 A 10 10 0 0 1 0 20 Z" fill="#f8fafc" stroke="none" />
                <path d="M 0 0 A 10 10 0 0 1 0 20" fill="none" stroke="#cbd5e1" strokeWidth="1" />
              </svg>

              <DashedDivider className="mx-3" />

              {/* Notch Kanan */}
              <svg
                width="10"
                height="20"
                viewBox="0 0 10 20"
                className="absolute right-0 top-0 block pointer-events-none"
                aria-hidden="true"
              >
                <path d="M 10 0 A 10 10 0 0 0 10 20 Z" fill="#f8fafc" stroke="none" />
                <path d="M 10 0 A 10 10 0 0 0 10 20" fill="none" stroke="#cbd5e1" strokeWidth="1" />
              </svg>
            </div>

            {/* Section Bawah Tiket: Total & Rincian Transaksi */}
            <div className="bg-white border-x border-slate-300 p-5 sm:p-6 sm:py-4 pt-3 space-y-4">
              {/* Total Transfer Row */}
              <div className="space-y-1">
                <span className="text-sm text-slate-600 block">Total yang Harus Ditransfer</span>
                <Skeleton className="h-8 w-40 rounded-md" />
                <Skeleton className="h-3.5 w-full max-w-sm rounded pt-0.5" />
              </div>

              {/* Rincian Transaksi Key-Value List */}
              <div className="space-y-3 pb-1">
                <span className="text-sm text-slate-600 block">Rincian Donasi</span>

                <div className="space-y-2.5 text-sm">
                  {/* Campaign Mini Item */}
                  <div className="flex items-center gap-3 pt-0.5 pb-1">
                    <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-md bg-white border border-slate-200 shrink-0 p-1 flex items-center justify-center">
                      <Image
                        src={ASSET_PATHS.BRANDING.LOGO}
                        alt="Logo Yayasan PABE"
                        width={40}
                        height={40}
                        className="w-full h-full object-contain select-none"
                      />
                    </div>
                    <Skeleton className="h-4 w-44 rounded flex-1" />
                  </div>

                  {/* 7 Key-Value Data Rows (Sesuai Foto 1) */}
                  <div className="flex justify-between items-center text-slate-600 pt-1">
                    <span className="shrink-0">Donatur</span>
                    <Skeleton className="h-4 w-28 rounded" />
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="shrink-0">Waktu Tagihan</span>
                    <Skeleton className="h-4 w-36 rounded" />
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="shrink-0">Metode Bayar</span>
                    <Skeleton className="h-4 w-44 rounded" />
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="shrink-0">Donasi Pokok</span>
                    <Skeleton className="h-4 w-20 rounded" />
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="shrink-0">Kode Unik</span>
                    <Skeleton className="h-4 w-12 rounded" />
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="shrink-0">Biaya Layanan</span>
                    <span className="font-medium text-slate-900">Gratis</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="shrink-0">Doa Kebaikan</span>
                    <Skeleton className="h-4 w-36 rounded" />
                  </div>
                </div>
              </div>
            </div>

            {/* Sisi Bawah Bergerigi Lingkaran Halus (Scalloped Edges) */}
            <div className="relative w-full h-3.5 select-none -mt-px overflow-hidden border-x border-slate-300">
              <svg
                className="w-full h-3.5 block"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <defs>
                  <pattern
                    id="receipt-scallops-skeleton"
                    x="0"
                    y="0"
                    width="24"
                    height="14"
                    patternUnits="userSpaceOnUse"
                  >
                    <rect width="24" height="14" fill="#f8fafc" />
                    <path
                      d="M 0 0 L 24 0 L 24 12 L 19 12 A 7 7 0 0 0 5 12 L 0 12 Z"
                      fill="#ffffff"
                      stroke="none"
                    />
                    <path
                      d="M 0 12 L 5 12 A 7 7 0 0 1 19 12 L 24 12"
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="1.5"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="14" fill="url(#receipt-scallops-skeleton)" />
              </svg>
            </div>
          </div>

          {/* Action Buttons Skeleton (Matches InvoiceActions: Bagikan ke WA & Lihat Program Lainnya) */}
          <div className="flex flex-col gap-2 pt-1">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </main>
  );
}
