"use client";

import { formatDate } from "@/lib/formatters";
import { PrayerAvatar } from "@/components/modules/PrayerAvatar";
import { PrayerAminButton } from "@/components/modules/PrayerAminButton";
import { maskEmail } from "@/lib/security";
import { cn } from "@/lib/utils";

/**
 * Helper to compute humanized relative time
 */
export function getRelativeTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Baru saja";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} jam lalu`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} hari lalu`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} bulan lalu`;
  return formatDate(dateString);
}

export function PrayerCard({ donor, isAmined, onToggleAmin, className }) {
  const cleanPrayer = (donor.prayer || "").replace(/\s+/g, " ").trim();
  const displayedEmail = donor.email ? maskEmail(donor.email) : null;

  return (
    <article
      className={cn(
        "bg-white px-4 sm:px-5 py-3.5 sm:py-4 flex items-start gap-3 sm:gap-3.5",
        className
      )}
    >
      {/* Avatar donatur */}
      <PrayerAvatar name={donor.name} avatar={donor.avatar} size="md" className="mt-0.5 shrink-0" />

      {/* Konten Doa & Aksi */}
      <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
        <div>
          {/* Header Identitas Donatur: Nama & Email Terproteksi */}
          <div className="min-w-0">
            <h4 className="font-semibold text-slate-900 text-xs sm:text-sm truncate">
              {donor.name}
            </h4>
            {displayedEmail && (
              <span className="text-[11px] sm:text-xs text-slate-500 block truncate mt-0.5 font-normal">
                {displayedEmail}
              </span>
            )}
          </div>

          {/* Isi Teks Doa */}
          <p className="mt-2 text-xs sm:text-sm text-slate-800 leading-relaxed font-normal break-words">
            &ldquo;{cleanPrayer}&rdquo;
          </p>
        </div>

        {/* Footer: Keterangan Waktu di Kiri, Tombol Aamiin di Kanan */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-[11px] sm:text-xs text-slate-500 font-normal whitespace-nowrap">
            {getRelativeTime(donor.date)}
          </span>

          <PrayerAminButton
            donorId={donor.id}
            donorName={donor.name}
            aminCount={donor.aminCount}
            isAmined={isAmined}
            onToggleAmin={onToggleAmin}
            variant="reaction"
          />
        </div>
      </div>
    </article>
  );
}
