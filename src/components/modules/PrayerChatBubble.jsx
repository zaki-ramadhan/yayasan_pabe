"use client";

import { Clock } from "lucide-react";
import { PrayerAvatar } from "@/components/modules/PrayerAvatar";
import { PrayerAminButton } from "@/components/modules/PrayerAminButton";
import { formatClockTime } from "@/lib/dateUtils";
import { cn } from "@/lib/utils";

// ============================================================================
// Pilihan Tema Warna Bubble Doa (Buka komentar salah satu baris untuk mencoba):
// ============================================================================
// const BUBBLE_THEME = "bg-gradient-to-br from-blue-600 to-blue-700 text-white"; // Warna Awal: Biru Primary
// const BUBBLE_THEME = "bg-gradient-to-br from-emerald-600 to-teal-700 text-white"; // Opsi 1: Emerald / Hijau Islami (Aktif)
const BUBBLE_THEME = "bg-gradient-to-br from-slate-800 to-slate-900 text-white"; // Opsi 2: Deep Slate / Charcoal Elegan
// const BUBBLE_THEME = "bg-slate-50 border border-slate-300/80 text-slate-800"; // Opsi 3: Soft Light Card (Senada Card Atas)

export function PrayerChatBubble({ donor, isAmined, onToggleAmin, isOwn = false }) {
  const cleanPrayer = (donor.prayer || "").replace(/\s+/g, " ").trim();

  // Avatar width (size="sm" 28px) + gap-2 (8px) = 36px → pl/pr-[36px]
  const avatarOffset = isOwn ? "pr-[36px]" : "pl-[36px]";

  return (
    <article className={cn("flex flex-col w-full", isOwn ? "items-end" : "items-start")}>
      {/* Nama donatur */}
      <div className={cn("text-xs font-semibold text-white mb-1 truncate max-w-full", avatarOffset)}>
        {donor.name}
      </div>

      {/* Row: avatar bottom-aligned dengan bubble column */}
      <div className={cn("flex items-end gap-2 w-full", isOwn ? "flex-row-reverse" : "flex-row")}>
        <PrayerAvatar name={donor.name} size="sm" className="shrink-0" />

        {/* Kolom Bubble + Kapsul — berada dalam 1 container agar 100% sejajar rata kiri */}
        <div className={cn("flex flex-col max-w-[82%] sm:max-w-[78%]", isOwn ? "items-end" : "items-start")}>
          {/* Bubble doa */}
          <div
            className={cn(
              "relative shadow-2xs px-4 pt-3 pb-2.5",
              BUBBLE_THEME,
              isOwn ? "rounded-2xl rounded-br-xs" : "rounded-2xl rounded-bl-xs"
            )}
          >
            <p className="text-xs sm:text-sm text-inherit leading-relaxed font-normal break-words line-clamp-4">
              {cleanPrayer}
            </p>

            {/* Timestamp di dalam bubble pojok kanan bawah ala WhatsApp (format jam) */}
            <div className="flex items-center justify-end gap-1 mt-1 text-[10px] sm:text-[11px] opacity-75 select-none leading-none">
              <Clock className="w-2.5 h-2.5 shrink-0 stroke-[2]" />
              <span>{formatClockTime(donor.date)}</span>
            </div>
          </div>

          {/* Kapsul Aamiin — berjarak pas di bawah rata kiri */}
          <div className="flex mt-1">
            <PrayerAminButton
              donorId={donor.id}
              donorName={donor.name}
              aminCount={donor.aminCount}
              isAmined={isAmined}
              onToggleAmin={onToggleAmin}
              variant="reaction"
              className={cn(
                "rounded-xl",
                isOwn ? "rounded-tr-xs" : "rounded-tl-xs"
              )}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
