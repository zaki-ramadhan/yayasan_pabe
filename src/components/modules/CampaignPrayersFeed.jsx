"use client";

import { useState, useMemo, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { PRAYER_SORT_OPTIONS } from "@/data/sortOptions";
import { SortDropdown } from "@/components/shared/SortDropdown";
import { PrayerCard } from "@/components/modules/PrayerCard";
import { usePrayersSync } from "@/hooks/usePrayersSync";
import { useScrollLoadMore } from "@/hooks/useScrollLoadMore";

const PAGE_SIZE = 6;

export function CampaignPrayersFeed({ initialDonors = [] }) {
  const { donors, aminedSet, handleToggleAmin } = usePrayersSync(initialDonors);
  const [sortBy, setSortBy] = useState("terbaru");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const sortedDonors = useMemo(() => {
    const list = [...donors];
    if (sortBy === "terpopuler") {
      return list.sort((a, b) => b.aminCount - a.aminCount);
    }
    return list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [donors, sortBy]);

  const prayersOnly = useMemo(() => {
    return sortedDonors.filter((d) => Boolean(d.prayer && d.prayer.trim()));
  }, [sortedDonors]);

  const visiblePrayers = prayersOnly.slice(0, visibleCount);
  const hasMore = visibleCount < prayersOnly.length;

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, prayersOnly.length));
      setIsLoadingMore(false);
    }, 500);
  }, [isLoadingMore, hasMore, prayersOnly.length]);

  const scrollRef = useScrollLoadMore({ onLoadMore: loadMore, threshold: 80 });

  if (prayersOnly.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 text-sm sm:text-base">
        Belum ada data
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header: Title & Sort Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-950 text-base sm:text-lg">
            Doa &amp; Dukungan Kebaikan
          </h3>
          <p className="text-sm sm:text-base text-slate-600 mt-0.5">
            Untaian doa tulus dari para donatur untuk saudara yang membutuhkan dan sesama.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <SortDropdown
            options={PRAYER_SORT_OPTIONS}
            value={sortBy}
            onChange={(val) => {
              setSortBy(val);
              setVisibleCount(PAGE_SIZE);
            }}
            label="Urutkan"
            className="h-9 text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* Scrollable prayer list feed — 2 column unified divided grid on md */}
      <div
        ref={scrollRef}
        className="max-h-[480px] sm:max-h-[520px] overflow-y-auto pr-1 sm:pr-1.5 pt-1 pb-2"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#cbd5e1 transparent" }}
      >
        {visiblePrayers.length > 0 ? (
          <div className="bg-slate-200/80 border border-slate-300 rounded-xl sm:rounded-2xl shadow-2xs overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-[1px]">
            {visiblePrayers.map((donor) => (
              <PrayerCard
                key={donor.id}
                donor={donor}
                isAmined={aminedSet.has(donor.id)}
                onToggleAmin={handleToggleAmin}
              />
            ))}
            {visiblePrayers.length % 2 !== 0 && (
              <div className="hidden md:block bg-white" aria-hidden="true" />
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 text-sm sm:text-base">
            Belum ada data
          </div>
        )}

        {/* Loading indicator di dalam scroll area */}
        {isLoadingMore && (
          <div className="flex justify-center py-3">
            <Loader2 className="w-[18px] h-[18px] text-primary animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
