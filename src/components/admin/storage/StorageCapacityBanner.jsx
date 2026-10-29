"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Progress } from "@/components/ui/Progress";
import { formatBytes } from "@/lib/formatters";
import { R2_FREE_TIER_BYTES } from "@/lib/storageConstants";

/**
 * Banner status kuota dan kapasitas Cloudflare R2 dengan tata letak ramping dan efisien.
 *
 * @param {object} props
 * @param {object} props.overview
 */
export function StorageCapacityBanner({ overview }) {
	const {
		isConfigured = true,
		totalBytes = 0,
		totalCount = 0,
		limitBytes = R2_FREE_TIER_BYTES,
		usagePercent = 0,
	} = overview || {};

	return (
		<div className="bg-white border border-slate-200/90 rounded-xl shadow-2xs overflow-hidden flex flex-col md:flex-row items-stretch transition-shadow hover:shadow-xs">
			{/* Sisi Kiri: Background Abu-abu Bersih & Logo Resmi Cloudflare */}
			<div className="w-full md:w-24 lg:w-28 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200/80 flex items-center justify-center p-2 select-none shrink-0 min-h-[56px] md:min-h-0 relative overflow-hidden">
				<div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
					<Image
						src="/img/branding/cloudflare-logo.webp"
						alt="Cloudflare R2 Storage"
						fill
						sizes="(max-width: 768px) 48px, 56px"
						className="object-contain"
						priority
					/>
				</div>
			</div>

			{/* Sisi Kanan: Area Konten & Aksi Ramping */}
			<div className="flex-1 py-2 px-3 sm:py-2.5 sm:px-4 flex flex-col justify-center space-y-1.5 min-w-0">
				{/* Baris Atas: Informasi Teks & Tombol Aksi */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="space-y-0.5">
            <h2 className="text-sm sm:text-base font-medium text-slate-900 tracking-tight">
              Penyimpanan Cloudflare R2
            </h2>
            <div className="text-xs text-slate-700 font-normal space-y-0.5 leading-tight">
              <p>
                {formatBytes(totalBytes)} dari {formatBytes(limitBytes)}{" "}
                <span className="text-slate-500">(Batas kuota gratis 10 GB/bulan)</span>
              </p>
              <p>
                {totalCount} total berkas tersimpan di seluruh folder
              </p>
            </div>
          </div>

          {/* Tombol Aksi 3D Oranye Khas Cloudflare */}
          <div className="shrink-0 self-start sm:self-center">
            <Link
              href="/api/admin/external/cloudflare-r2"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-white bg-gradient-to-b from-[#f97d26] via-[#f46f14] to-[#ea5d05] border border-[#e05602] shadow-[0_2px_4px_rgba(242,128,32,0.25),inset_0_1px_0_rgba(255,255,255,0.45)] hover:from-[#fa8e3f] hover:to-[#f0680a] hover:shadow-[0_3px_8px_rgba(242,128,32,0.35)] active:translate-y-0.5 active:shadow-[0_1px_2px_rgba(242,128,32,0.2)] transition-all cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              title="Buka dashboard bucket Cloudflare R2 di tab baru"
            >
              <span>Cloudflare Storage</span>
              <ExternalLink className="w-3.5 h-3.5 text-white/95 drop-shadow-xs" />
            </Link>
          </div>
        </div>

        {/* Baris Bawah: Progress Bar & Teks Persentase Sederhana */}
        <div className="flex items-center gap-2.5 pt-0.5">
          <div className="flex-1">
            <Progress
              value={usagePercent}
              className="h-1.5 sm:h-2 w-full bg-slate-100 rounded-full [&>div]:bg-gradient-to-r [&>div]:from-[#f6821f] [&>div]:to-[#ea580c]"
            />
          </div>
          <span className="text-xs font-medium text-slate-600 shrink-0 whitespace-nowrap">
            {usagePercent}%
          </span>
        </div>

        {!isConfigured && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200/80 rounded-md px-2 py-1 mt-0.5">
            Kredensial Cloudflare R2 belum lengkap di .env server.
          </p>
        )}
      </div>
    </div>
  );
}
