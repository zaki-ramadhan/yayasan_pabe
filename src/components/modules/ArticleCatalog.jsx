"use client";

import { ARTICLE_CATEGORIES } from "@/data/articles";
import { ARTICLE_SORT_OPTIONS } from "@/data/sortOptions";
import { useCatalogState } from "@/hooks/useCatalogState";
import { ArticleCard } from "@/components/shared/ArticleCard";
import { CatalogSearchBar } from "@/components/shared/CatalogSearchBar";
import { CategoryTabs } from "@/components/shared/CategoryTabs";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 8;

function filterArticle(article, { category, searchQuery, categories }) {
  if (category !== "all") {
    const catName = categories.find((c) => c.id === category)?.name ?? "";
    const matchCategory =
      article.categoryId === category ||
      article.category?.toLowerCase() === catName.toLowerCase();
    if (!matchCategory) return false;
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    if (
      !article.title.toLowerCase().includes(q) &&
      !article.excerpt?.toLowerCase().includes(q)
    )
      return false;
  }

  return true;
}

function sortArticles(items, sortBy) {
  const sorted = [...items];
  if (sortBy === "terpopuler") {
    sorted.sort((a, b) => {
      const scoreA = (a.likeCount || 0) - (a.dislikeCount || 0);
      const scoreB = (b.likeCount || 0) - (b.dislikeCount || 0);
      return scoreB - scoreA;
    });
  } else {
    sorted.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  }
  return sorted;
}

export function ArticleCatalog({ initialArticles = [], categories = ARTICLE_CATEGORIES }) {
  const {
    selectedCategory,
    searchQuery,
    debouncedSearchQuery,
    sortBy,
    currentPage,
    isPending,
    isDebouncing,
    categoryCounts,
    paginatedItems,
    totalPages,
    handlers,
  } = useCatalogState({
    items: initialArticles,
    filterFn: filterArticle,
    sortFn: sortArticles,
    itemsPerPage: ITEMS_PER_PAGE,
    categories,
  });

  return (
    <div className="space-y-6">
      <CategoryTabs
        categories={categories}
        counts={categoryCounts}
        selectedCategory={selectedCategory}
        onSelectCategory={handlers.onCategoryChange}
      />

      <CatalogSearchBar
        searchQuery={searchQuery}
        sortBy={sortBy}
        sortOptions={ARTICLE_SORT_OPTIONS}
        onSearch={handlers.onSearchChange}
        onClear={handlers.onClearSearch}
        onSort={handlers.onSortChange}
        isLoading={isPending || isDebouncing}
        searchPlaceholder="Cari judul artikel..."
      />

      {paginatedItems.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-3">
            {paginatedItems.map((art) => (
              <ArticleCard
                key={art.id}
                article={art}
                highlightQuery={debouncedSearchQuery}
              />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlers.onPageChange}
            className="pt-6 sm:pt-8"
          />
        </div>
      ) : (
        <EmptyState
          title="Tidak Ada Artikel Ditemukan"
          description="Coba kata kunci lain atau pilih kategori lain."
          variant="dashed"
          action={
            <button
              type="button"
              onClick={handlers.onReset}
              className="text-sm font-semibold text-primary hover:underline pt-1 cursor-pointer"
            >
              Reset Semua Filter
            </button>
          }
        />
      )}
    </div>
  );
}
