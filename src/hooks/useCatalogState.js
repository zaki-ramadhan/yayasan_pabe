"use client";

import { useState, useMemo, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";

/**
 * Generic catalog state hook: category, search, sort, pagination.
 *
 * @param {Object} config
 * @param {any[]}    config.items         - Full dataset
 * @param {Function} config.filterFn      - (item, { category, searchQuery, categories }) => boolean
 * @param {Function} config.sortFn        - (items, sortBy) => items[]
 * @param {number}   config.itemsPerPage
 * @param {any[]}    [config.categories]
 * @param {boolean}  [config.syncUrlCategory] - Read initial category from ?kategori= param
 */
export function useCatalogState({
  items = [],
  filterFn,
  sortFn,
  itemsPerPage = 9,
  categories = [],
  syncUrlCategory = false,
}) {
  const searchParams = useSearchParams();
  const [internalCategory, setInternalCategory] = useState(null);
  const selectedCategory =
    internalCategory ??
    (syncUrlCategory ? searchParams?.get("kategori") || "all" : "all");

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("terbaru");
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const isDebouncing = searchQuery !== debouncedSearchQuery;

  const categoryCounts = useMemo(() => {
    const counts = { all: items.length };
    categories.forEach((cat) => {
      if (cat.id !== "all") {
        counts[cat.id] = items.filter((item) =>
          filterFn(item, { category: cat.id, searchQuery: "", categories })
        ).length;
      }
    });
    return counts;
  }, [items, categories, filterFn]);

  const filteredItems = useMemo(() => {
    let result = items.filter((item) =>
      filterFn(item, {
        category: selectedCategory,
        searchQuery: debouncedSearchQuery.trim(),
        categories,
      })
    );
    return sortFn ? sortFn(result, sortBy) : result;
  }, [items, selectedCategory, debouncedSearchQuery, sortBy, filterFn, sortFn, categories]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const handleCategoryChange = (catId) => {
    startTransition(() => {
      setInternalCategory(catId);
      setCurrentPage(1);
    });
  };

  const handleSearchChange = (e) => {
    const val = e.target.value.replace(/[<>'"`;\\{}]/g, "").slice(0, 60);
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleSortChange = (val) => {
    startTransition(() => {
      setSortBy(val);
      setCurrentPage(1);
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isFiltered =
    (selectedCategory !== "all" &&
      selectedCategory !== "semua" &&
      selectedCategory !== "Semua Kategori") ||
    Boolean(searchQuery.trim());

  const handleReset = () => {
    if (isFiltered) {
      startTransition(() => {
        setInternalCategory("all");
        setSearchQuery("");
        setCurrentPage(1);
      });
    }
  };

  return {
    selectedCategory,
    searchQuery,
    debouncedSearchQuery,
    sortBy,
    currentPage,
    isPending,
    isDebouncing,
    isFiltered,
    categoryCounts,
    filteredItems,
    paginatedItems,
    totalPages,
    handlers: {
      onCategoryChange: handleCategoryChange,
      onSearchChange: handleSearchChange,
      onClearSearch: handleClearSearch,
      onSortChange: handleSortChange,
      onPageChange: handlePageChange,
      onReset: handleReset,
    },
  };
}
