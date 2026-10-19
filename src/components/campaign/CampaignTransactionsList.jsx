"use client";

import { useState, useCallback, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { DateStickyBadge } from "@/components/shared/DateStickyBadge";
import { CampaignTransactionItem } from "@/components/campaign/CampaignTransactionItem";
import { DataFetchErrorState } from "@/components/shared/DataFetchErrorState";
import { getDateKey, getDateBadgeLabel } from "@/lib/dateUtils";
import { useScrollLoadMore } from "@/hooks/useScrollLoadMore";
import { safeFetch } from "@/lib/safeFetch";

const INITIAL_PAGE_SIZE = 12;
const BATCH_SIZE = 10;

export function CampaignTransactionsList({
  donors = [],
  totalDonorsCount = 0,
  campaignSlug = "",
}) {
  const [donorList, setDonorList] = useState(donors);
  const [visibleCount, setVisibleCount] = useState(INITIAL_PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);

  const sortedDonors = useMemo(() => {
    return [...donorList].sort(
      (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
    );
  }, [donorList]);

  const visibleDonors = sortedDonors.slice(0, visibleCount);
  const hasLocalMore = sortedDonors.length > visibleCount;
  const canFetchRemote = Boolean(campaignSlug && donorList.length < totalDonorsCount);
  const hasMore = hasLocalMore || canFetchRemote;

  const groupedDonors = useMemo(() => {
    const groups = [];
    const groupMap = new Map();
    for (const item of visibleDonors) {
      const key = getDateKey(item.date);
      if (!groupMap.has(key)) {
        const groupObj = { key, label: getDateBadgeLabel(item.date), items: [] };
        groupMap.set(key, groupObj);
        groups.push(groupObj);
      }
      groupMap.get(key).items.push(item);
    }
    return groups;
  }, [visibleDonors]);

  const handleLoadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;

    if (hasLocalMore) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, donorList.length));
        setIsLoadingMore(false);
      }, 400);
      return;
    }

    if (canFetchRemote) {
      setIsLoadingMore(true);
      setLoadMoreError(false);
      safeFetch(`/api/donations?campaignSlug=${encodeURIComponent(campaignSlug)}&skip=${donorList.length}&limit=20`)
        .then((res) => res.json())
        .then((json) => {
          if (json?.success && Array.isArray(json?.data?.donations)) {
            const newItems = json.data.donations;
            setDonorList((prev) => {
              const existingIds = new Set(prev.map((d) => d.id));
              return [...prev, ...newItems.filter((item) => !existingIds.has(item.id))];
            });
            setVisibleCount((prev) => prev + (newItems.length || BATCH_SIZE));
          } else {
            setLoadMoreError(true);
          }
        })
        .catch((err) => {
          console.warn("Gagal memuat riwayat donasi tambahan:", err);
          setLoadMoreError(true);
        })
        .finally(() => setIsLoadingMore(false));
    }
  }, [isLoadingMore, hasMore, hasLocalMore, canFetchRemote, donorList.length, campaignSlug]);

  const scrollRef = useScrollLoadMore({ onLoadMore: handleLoadMore, threshold: 80 });

  if (!donorList || donorList.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500 text-sm sm:text-base">
        Belum ada data
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-6 border-t border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-slate-950">
            Riwayat Transaksi Donasi
          </h3>
          <p className="text-sm text-slate-600">
            Catatan mutasi donasi masuk yang telah berhasil terverifikasi oleh sistem.
          </p>
        </div>
        <span className="text-xs sm:text-sm font-medium text-slate-700">
          ({totalDonorsCount || donorList.length} Donasi Masuk)
        </span>
      </div>

      <div
        ref={scrollRef}
        className="max-h-[460px] sm:max-h-[520px] overflow-y-auto pr-1 sm:pr-2 focus:outline-none space-y-4"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#cbd5e1 transparent" }}
      >
        {groupedDonors.map((group) => (
          <div key={group.key} className="space-y-2">
            <DateStickyBadge label={group.label} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5">
              {group.items.map((item, index) => (
                <CampaignTransactionItem
                  key={item.id || `tx-${group.key}-${index}`}
                  item={item}
                />
              ))}
            </div>
          </div>
        ))}

        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-[18px] h-[18px] text-primary animate-spin" />
          </div>
        )}

        {loadMoreError && (
          <div className="pt-2">
            <DataFetchErrorState
              compact
              description="Gagal memuat transaksi berikutnya. Periksa koneksi Anda."
              onRetry={handleLoadMore}
            />
          </div>
        )}
      </div>
    </div>
  );
}
