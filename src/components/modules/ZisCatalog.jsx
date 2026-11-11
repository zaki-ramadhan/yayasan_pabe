"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import {
  PROGRAM_SORT_OPTIONS,
  PROGRAM_STATUS_FILTER_OPTIONS,
} from "@/data/sortOptions";
import { useCatalogState } from "@/hooks/useCatalogState";
import { isCampaignClosed } from "@/lib/formatters";
import { CampaignCard } from "@/components/shared/CampaignCard";
import { CatalogSearchBar } from "@/components/shared/CatalogSearchBar";
import { SortDropdown } from "@/components/shared/SortDropdown";
import { EmptyState } from "@/components/shared/EmptyState";

const BATCH_SIZE = 6;

function filterZisCampaign(campaign, { searchQuery, status = "all" }) {
  if (searchQuery.trim().length >= 2) {
    const q = searchQuery.toLowerCase().trim();
    if (!campaign.title.toLowerCase().includes(q)) return false;
  }

  if (status && status !== "all") {
    const isClosed = isCampaignClosed(campaign);
    if (status === "active" && isClosed) return false;
    if (status === "completed" && !isClosed) return false;
  }

  return true;
}

function sortZisCampaigns(items, sortBy) {
  const sorted = [...items];
  if (sortBy === "terpopuler") {
    sorted.sort((a, b) => b.donorCount - a.donorCount);
  } else if (sortBy === "dana-terbanyak") {
    sorted.sort((a, b) => b.collectedAmount - a.collectedAmount);
  } else {
    sorted.sort((a, b) => new Date(b.endDate || 0) - new Date(a.endDate || 0));
  }
  return sorted;
}

export function ZisCatalog({ initialCampaigns = [] }) {
  const [statusFilter, setStatusFilter] = useState("all");

  const filterFn = useCallback(
    (item, ctx) => filterZisCampaign(item, { ...ctx, status: statusFilter }),
    [statusFilter]
  );

  const {
    searchQuery,
    debouncedSearchQuery,
    sortBy,
    isPending,
    isDebouncing,
    isFiltered,
    filteredItems,
    handlers,
  } = useCatalogState({
    items: initialCampaigns,
    filterFn,
    sortFn: sortZisCampaigns,
    itemsPerPage: 100,
    syncUrlCategory: false,
  });

  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef(null);

  const [prevFilter, setPrevFilter] = useState({
    debouncedSearchQuery,
    sortBy,
    statusFilter,
  });

  if (
    prevFilter.debouncedSearchQuery !== debouncedSearchQuery ||
    prevFilter.sortBy !== sortBy ||
    prevFilter.statusFilter !== statusFilter
  ) {
    setPrevFilter({ debouncedSearchQuery, sortBy, statusFilter });
    setVisibleCount(BATCH_SIZE);
  }

  const hasMore = visibleCount < filteredItems.length;
  const visibleItems = useMemo(
    () => filteredItems.slice(0, visibleCount),
    [filteredItems, visibleCount]
  );

  const handleLoadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, filteredItems.length));
      setIsLoadingMore(false);
    }, 450);
  }, [isLoadingMore, hasMore, filteredItems.length]);

  useEffect(() => {
    if (!hasMore || isLoadingMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          handleLoadMore();
        }
      },
      { rootMargin: "150px" }
    );
    const el = sentinelRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [hasMore, isLoadingMore, handleLoadMore]);

  return (
    <div className="space-y-4">
      <CatalogSearchBar
        searchQuery={searchQuery}
        sortBy={sortBy}
        sortOptions={PROGRAM_SORT_OPTIONS}
        onSearch={handlers.onSearchChange}
        onClear={handlers.onClearSearch}
        onSort={handlers.onSortChange}
        isLoading={isPending || isDebouncing}
        searchPlaceholder="Cari program ZIS, zakat, infak..."
        filterSlot={
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm text-slate-700 shrink-0">
              Status:
            </span>
            <SortDropdown
              options={PROGRAM_STATUS_FILTER_OPTIONS}
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setVisibleCount(BATCH_SIZE);
              }}
              label="Semua Status"
              className="h-10 text-sm min-w-[145px]"
            />
          </div>
        }
      />

      {visibleItems.length > 0 ? (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {visibleItems.map((camp, index) => (
              <CampaignCard
                key={camp.id}
                campaign={camp}
                highlightQuery={debouncedSearchQuery}
                priority={index === 0}
              />
            ))}
          </div>

          <div ref={sentinelRef} className="h-4 w-full pointer-events-none" />

          {isLoadingMore && (
            <div className="flex items-center justify-center gap-2.5 py-8 text-sm text-slate-600">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <span className="font-medium">Memuat program ZIS lainnya...</span>
            </div>
          )}

          {!hasMore && filteredItems.length > BATCH_SIZE && (
            <div className="text-center py-8 text-xs sm:text-sm text-slate-500 select-none">
              Seluruh program ZIS ({filteredItems.length}) telah ditampilkan
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          title={initialCampaigns.length === 0 ? "Belum Ada Program ZIS" : "Program ZIS Tidak Ditemukan"}
          description={
            initialCampaigns.length === 0
              ? "Program zakat, infak, dan sedekah yayasan akan segera hadir di sini."
              : "Tidak ada program ZIS yang cocok dengan kata kunci atau filter yang Anda pilih."
          }
          variant="card"
          action={
            isFiltered || statusFilter !== "all" ? (
              <button
                type="button"
                onClick={() => {
                  handlers.onReset();
                  setStatusFilter("all");
                }}
                className="text-sm font-semibold text-primary hover:underline pt-1 cursor-pointer"
              >
                Reset Semua Filter
              </button>
            ) : null
          }
        />
      )}
    </div>
  );
}

