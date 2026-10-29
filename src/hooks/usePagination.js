"use client";

import { useState, useMemo, useCallback } from "react";

/**
 * Standard client-side pagination hook.
 * Calculates totalPages, slices data for the active page, and provides page navigation controls.
 *
 * @param {Array} items - Array of items to paginate
 * @param {object} [options]
 * @param {number} [options.pageSize=10] - Number of items per page
 * @param {number} [options.initialPage=1] - Starting page number
 */
export function usePagination(items = [], options = {}) {
  const { pageSize = 10, initialPage = 1 } = options;
  const [currentPage, setCurrentPage] = useState(initialPage);

  const safeItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);
  const safeLimit = pageSize > 0 ? pageSize : 10;
  const totalPages = Math.ceil(safeItems.length / safeLimit) || 1;

  // Clamps activePage if total items shrinks (e.g. after search/status filter change)
  const activePage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedItems = useMemo(() => {
    const start = (activePage - 1) * safeLimit;
    return safeItems.slice(start, start + safeLimit);
  }, [safeItems, activePage, safeLimit]);

  const resetPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage: activePage,
    setCurrentPage,
    totalPages,
    paginatedItems,
    totalItems: safeItems.length,
    pageSize: safeLimit,
    resetPage,
  };
}
