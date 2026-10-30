"use client";

import { Clock } from "lucide-react";
import { PrayerAvatar } from "@/components/modules/PrayerAvatar";
import { PrayerAminButton } from "@/components/modules/PrayerAminButton";
import { formatClockTime } from "@/lib/dateUtils";
import { cn } from "@/lib/utils";

const BUBBLE_THEME = "bg-gradient-to-br from-slate-800 to-slate-900 text-white";

export function PrayerChatBubble({
  donor,
  isAmined,
  onToggleAmin,
  isOwn = false,
  currentUserAvatar = null,
}) {
  const cleanPrayer = (donor.prayer || "").replace(/\s+/g, " ").trim();
  const avatarOffset = isOwn ? "pr-[36px]" : "pl-[36px]";
  const resolvedAvatar = (isOwn ? (currentUserAvatar || donor.avatar) : donor.avatar) || null;

  return (
    <article className={cn("flex flex-col w-full", isOwn ? "items-end" : "items-start")}>
      <div
        className={cn(
          "text-xs font-semibold mb-1 truncate max-w-full",
          isOwn ? "text-slate-300" : "text-white",
          avatarOffset
        )}
      >
        {isOwn ? "Anda" : donor.name}
      </div>

      <div className={cn("flex items-end gap-2 w-full", isOwn ? "flex-row-reverse" : "flex-row")}>
        <PrayerAvatar
          name={isOwn ? (donor.name || "Anda") : donor.name}
          avatar={resolvedAvatar}
          size="sm"
          className="shrink-0"
        />

        <div className={cn("flex flex-col max-w-[82%] sm:max-w-[78%]", isOwn ? "items-end" : "items-start")}>
          <div
            className={cn(
              "relative shadow-2xs px-4 pt-3 pb-2.5",
              isOwn
                ? "bg-emerald-700 border border-emerald-600/40 text-white rounded-2xl rounded-br-xs shadow-2xs"
                : "bg-slate-800/90 border border-slate-700/40 text-slate-100 rounded-2xl rounded-bl-xs"
            )}
          >
            <p className="text-xs sm:text-sm text-inherit leading-relaxed font-normal break-words line-clamp-4">
              {cleanPrayer}
            </p>

            <div className="flex items-center justify-end gap-1 mt-1 text-[10px] sm:text-[11px] opacity-75 select-none leading-none">
              <Clock className="w-2.5 h-2.5 shrink-0 stroke-[2]" />
              <span>{formatClockTime(donor.date)}</span>
            </div>
          </div>

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
