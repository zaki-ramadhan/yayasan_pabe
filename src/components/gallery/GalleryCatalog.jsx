"use client";

import { useState, useMemo, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { GALLERY_SORT_OPTIONS } from "@/data/sortOptions";
import { useCatalogState } from "@/hooks/useCatalogState";
import { CategoryTabs } from "@/components/shared/CategoryTabs";
import { CatalogSearchBar } from "@/components/shared/CatalogSearchBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { groupGalleryItems } from "@/lib/galleryGroupHelper";
import { GalleryCard } from "./GalleryCard";
import { Button } from "@/components/ui/Button";

const BATCH_SIZE = 9;

function filterGalleryItem(item, { category, searchQuery, categories }) {
  if (category !== "all" && category !== "semua" && category !== "Semua Kategori") {
    const catName = categories.find((c) => c.id === category)?.name ?? category;
    const itemCat = (item.category || "").toLowerCase();
    const matchCat =
      itemCat === category.toLowerCase() ||
      itemCat === catName.toLowerCase();
    if (!matchCat) return false;
  }

  if (searchQuery.trim().length >= 1) {
    const q = searchQuery.toLowerCase().trim();
    const matchTitle = item.title?.toLowerCase().includes(q);
    const matchDesc = item.description?.toLowerCase().includes(q);
    const matchCat = item.category?.toLowerCase().includes(q);
    if (!matchTitle && !matchDesc && !matchCat) return false;
  }

  return true;
}

function sortGalleryItems(items, sortBy) {
  const sorted = [...items];
  if (sortBy === "terlama") {
    sorted.sort((a, b) => {
      const dateA = new Date(a.activityDate || a.createdAt);
      const dateB = new Date(b.activityDate || b.createdAt);
      return dateA - dateB;
    });
  } else {
    sorted.sort((a, b) => {
      const dateA = new Date(a.activityDate || a.createdAt);
      const dateB = new Date(b.activityDate || b.createdAt);
      return dateB - dateA;
    });
  }
  return sorted;
}

export function GalleryCatalog({
  initialItems = [],
  initialCategories = [],
}) {
  const formattedCategories = useMemo(() => {
    const raw = Array.from(new Set(initialCategories || []))
      .filter((c) => Boolean(c) && c !== "Semua Kategori" && c !== "all");

    return [
      { id: "all", name: "Semua Kategori" },
      ...raw.map((cat) => ({
        id: cat,
        name: cat,
      })),
    ];
  }, [initialCategories]);

  const groupedItems = useMemo(
    () => groupGalleryItems(initialItems),
    [initialItems]
  );

  const {
    selectedCategory,
    searchQuery,
    debouncedSearchQuery,
    sortBy,
    isPending,
    isDebouncing,
    isFiltered,
    categoryCounts,
    filteredItems,
    handlers,
  } = useCatalogState({
    items: groupedItems,
    filterFn: filterGalleryItem,
    sortFn: sortGalleryItems,
    itemsPerPage: 100,
    categories: formattedCategories,
    syncUrlCategory: false,
  });

  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [prevFilter, setPrevFilter] = useState({
    selectedCategory,
    debouncedSearchQuery,
    sortBy,
  });

  if (
    prevFilter.selectedCategory !== selectedCategory ||
    prevFilter.debouncedSearchQuery !== debouncedSearchQuery ||
    prevFilter.sortBy !== sortBy
  ) {
    setPrevFilter({ selectedCategory, debouncedSearchQuery, sortBy });
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
    }, 350);
  }, [isLoadingMore, hasMore, filteredItems.length]);

  return (
    <div className="space-y-6">
      {/* Category Chips matching Article Catalog */}
      <CategoryTabs
        categories={formattedCategories}
        counts={categoryCounts}
        selectedCategory={selectedCategory}
        onSelectCategory={handlers.onCategoryChange}
      />

      <div className="space-y-4">
        {/* Toolbar with Search Input & Dropdown Sort matching Donation & Article Catalogs */}
        <CatalogSearchBar
          searchQuery={searchQuery}
          sortBy={sortBy}
          sortOptions={GALLERY_SORT_OPTIONS}
          onSearch={handlers.onSearchChange}
          onClear={handlers.onClearSearch}
          onSort={handlers.onSortChange}
          isLoading={isPending || isDebouncing}
          searchPlaceholder="Cari judul atau dokumentasi kegiatan..."
        />

        {/* Content State: Grid vs Empty */}
        {visibleItems.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {visibleItems.map((item) => (
                <GalleryCard key={item.id} item={item} />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  disabled={isLoadingMore}
                  onClick={handleLoadMore}
                  className="h-11 px-6 rounded-xl border-slate-300 text-slate-700 hover:text-slate-950 hover:bg-slate-50 cursor-pointer text-sm font-medium gap-2 shadow-2xs"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span>Memuat foto lainnya...</span>
                    </>
                  ) : (
                    <span>Muat Lebih Banyak Dokumentasi</span>
                  )}
                </Button>
              </div>
            )}

            {!hasMore && filteredItems.length > BATCH_SIZE && (
              <div className="text-center py-6 text-xs sm:text-sm text-slate-500 select-none">
                Seluruh dokumentasi ({filteredItems.length}) telah ditampilkan
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            title={initialItems.length === 0 ? "Belum Ada Dokumentasi Kegiatan" : "Dokumentasi Tidak Ditemukan"}
            description={
              initialItems.length === 0
                ? "Dokumentasi kegiatan dan rekam jejak penyaluran amanah akan segera kami publikasikan di sini."
                : "Tidak ada dokumentasi kegiatan yang cocok dengan kata kunci atau filter yang Anda pilih."
            }
            variant="card"
            action={
              isFiltered ? (
                <button
                  type="button"
                  onClick={handlers.onReset}
                  className="text-sm font-semibold text-primary hover:underline pt-1 cursor-pointer"
                >
                  Reset Semua Filter
                </button>
              ) : null
            }
          />
        )}
      </div>

    </div>
  );
}
