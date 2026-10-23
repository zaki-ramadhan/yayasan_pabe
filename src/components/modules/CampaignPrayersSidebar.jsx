/* eslint-disable react-hooks/set-state-in-effect */
"use client";
// POV-aware: messages from the current logged-in user render as outgoing bubbles

import { useMemo, useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Check, Loader2, Lock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { PrayerChatBubble } from "@/components/modules/PrayerChatBubble";
import { PrayerInputBar } from "@/components/modules/PrayerInputBar";
import { usePrayersSync } from "@/hooks/usePrayersSync";
import { getStoredUser } from "@/services/authService";
import { PRAYER_SORT_OPTIONS } from "@/data/sortOptions";
import { DateStickyBadge } from "@/components/shared/DateStickyBadge";
import { getDateKey, getDateBadgeLabel } from "@/lib/dateUtils";
import { validatePrayer } from "@/lib/security";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 5;



export function CampaignPrayersSidebar({ initialDonors = [], campaignSlug, isClosed = false }) {
  const { donors, aminedSet, handleToggleAmin } = usePrayersSync(initialDonors);
  const [sortBy, setSortBy] = useState("terbaru");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollRef = useRef(null);
  const prevScrollHeightRef = useRef(0);
  const currentUser = getStoredUser();
  const initialScrollDone = useRef(false);
  const router = useRouter();

  // Sort newest-first (index 0 = most recent)
  const allPrayers = useMemo(() => {
    const list = donors.filter((d) => Boolean(d.prayer && d.prayer.trim()));
    if (sortBy === "terpopuler") {
      return [...list].sort((a, b) => b.aminCount - a.aminCount);
    }
    return [...list].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [donors, sortBy]);

  const hasMore = visibleCount < allPrayers.length;

  // For chat display: take most-recent visibleCount items, then reverse so oldest is on top
  const displayPrayers = useMemo(() => {
    return allPrayers.slice(0, visibleCount).reverse();
  }, [allPrayers, visibleCount]);

  // Sisipkan pemisah tanggal ala WhatsApp saat terjadi pergantian hari
  const prayersWithSeparators = useMemo(() => {
    const items = [];
    let lastDateKey = null;

    for (const donor of displayPrayers) {
      const dateKey = getDateKey(donor.date);
      if (dateKey !== lastDateKey) {
        items.push({
          type: "date_badge",
          id: `date-badge-${dateKey}-${donor.id}`,
          label: getDateBadgeLabel(donor.date),
        });
        lastDateKey = dateKey;
      }
      items.push({
        type: "prayer",
        id: donor.id,
        donor,
      });
    }

    return items;
  }, [displayPrayers]);

  // Reset pagination when sort changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    initialScrollDone.current = false;
  }, [sortBy]);

  // Scroll to bottom on initial render (and after sort reset)
  useLayoutEffect(() => {
    if (initialScrollDone.current) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    initialScrollDone.current = true;
  }, [prayersWithSeparators]);

  // After loading more, preserve scroll position to prevent jump
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || !prevScrollHeightRef.current) return;
    const diff = el.scrollHeight - prevScrollHeightRef.current;
    el.scrollTop = diff;
    prevScrollHeightRef.current = 0;
  }, [visibleCount]);

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    prevScrollHeightRef.current = scrollRef.current?.scrollHeight ?? 0;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, allPrayers.length));
      setIsLoadingMore(false);
    }, 600);
  }, [isLoadingMore, hasMore, allPrayers.length]);

  // Attach scroll listener
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      if (el.scrollTop < 40) loadMore();
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [loadMore]);

  const handleSend = (text) => {
    if (isClosed) return;
    const trimmed = (text || "").trim();
    const prayerValidation = validatePrayer(trimmed);
    if (!prayerValidation.isValid) {
      toast.error(prayerValidation.message);
      return;
    }
    const user = getStoredUser();
    const donateUrl = `/campaign/${campaignSlug}/donate?prayer=${encodeURIComponent(trimmed)}`;

    if (!user) {
      toast.info("Masuk akun dan selesaikan donasi untuk menitipkan doa.");
      router.push(`/login?redirect=${encodeURIComponent(donateUrl)}&reason=donation_requires_login`);
    } else {
      toast.info("Lanjutkan donasi terlebih dahulu untuk menitipkan doa.");
      router.push(donateUrl);
    }
  };

  if (allPrayers.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-slate-950 text-base">
          Doa-Doa Orang Baik
        </h3>

        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="group inline-flex items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-normal text-slate-800 hover:bg-slate-50 focus:outline-none transition-colors cursor-pointer h-9 min-w-[130px] shadow-2xs [&[data-state=open]>svg]:rotate-180"
            >
              <span className="truncate">
                {PRAYER_SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label || "Urutkan"}
              </span>
              <ChevronDown className="h-4 w-4 text-slate-500 shrink-0 transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-180" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-52 bg-white border border-slate-200 shadow-md rounded-lg p-1"
          >
            {PRAYER_SORT_OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={cn(
                  "flex items-center justify-between px-3 py-2 text-sm font-normal rounded-md cursor-pointer transition-colors",
                  sortBy === opt.value
                    ? "bg-slate-100 text-primary"
                    : "text-slate-800 hover:bg-slate-100"
                )}
              >
                <span>{opt.label}</span>
                {sortBy === opt.value && (
                  <Check className="w-4 h-4 text-primary shrink-0 ml-1.5" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>



      {/* Chat Room Container ala Telegram / WhatsApp */}
      <div className="relative rounded-2xl border border-slate-300 overflow-hidden shadow-xs bg-slate-900 flex flex-col">
        {/* Authentic Wallpaper Background (Original image without direct filter) */}
        <div
          className="absolute inset-0 pointer-events-none bg-cover bg-center"
          style={{
            backgroundImage: "url('/img/wallpaper_chat.jpeg')",
          }}
        />
        {/* Dark overlay layer to dim wallpaper smoothly */}
        <div className="absolute inset-0 pointer-events-none bg-slate-950/40" />

        {/* Scrollable chat container — increased height for more forum room */}
        <div
          ref={scrollRef}
          className="relative z-10 min-h-[440px] max-h-[580px] sm:max-h-[620px] overflow-y-auto px-3.5 py-4 space-y-4"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#94a3b8 transparent" }}
        >
          {/* Loader di dalam scroll container, paling atas — persis seperti WhatsApp */}
          {isLoadingMore && (
            <div className="flex justify-center py-3">
              <Loader2 className="w-[18px] h-[18px] text-primary animate-spin" />
            </div>
          )}

          <div className="space-y-4">
            {prayersWithSeparators.map((item) =>
              item.type === "date_badge" ? (
                <DateStickyBadge key={item.id} label={item.label} className="py-0.5" />
              ) : (
                <PrayerChatBubble
                  key={item.id}
                  donor={item.donor}
                  isAmined={aminedSet.has(item.donor.id)}
                  onToggleAmin={handleToggleAmin}
                  isOwn={Boolean(currentUser?.id && item.donor.id === currentUser.id)}
                />
              )
            )}
          </div>
        </div>

        {/* Footer input / Closed state lock banner */}
        {isClosed ? (
          <div className="relative z-10 p-2 sm:px-2.5 sm:pb-2.5 sm:pt-1">
            <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900/90 border border-slate-700/80 backdrop-blur-md rounded-full text-slate-300 text-xs sm:text-sm shadow-sm select-none text-center">
              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Program telah selesai · Pengiriman doa telah ditutup</span>
            </div>
          </div>
        ) : (
          <div
            id="tour-prayer-input"
            className="relative z-10 p-2 sm:px-2.5 sm:pb-2.5 sm:pt-1 bg-transparent"
          >
            <PrayerInputBar onSend={handleSend} />
          </div>
        )}
      </div>
    </div>
  );
}
