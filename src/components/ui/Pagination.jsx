"use client";

import * as React from "react";
import { AltArrowLeftIcon } from "@solar-icons/react/linear/alt-arrow-left";
import { AltArrowRightIcon } from "@solar-icons/react/linear/alt-arrow-right";
import { MenuDotsIcon } from "@solar-icons/react/linear/menu-dots";
import { cn } from "@/lib/utils";

/**
 * Calculates page numbers with smart ellipsis windowing.
 */
function getPageNumbers(currentPage, totalPages, maxVisible = 5) {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = [];
  const sidePages = 1; // Number of pages to show beside current page

  const startPage = Math.max(2, currentPage - sidePages);
  const endPage = Math.min(totalPages - 1, currentPage + sidePages);

  pages.push(1);

  if (startPage > 2) {
    pages.push("ellipsis-start");
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (endPage < totalPages - 1) {
    pages.push("ellipsis-end");
  }

  pages.push(totalPages);

  return pages;
}

export function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = "",
}) {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange?.(page);
    }
  };

  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      className={cn("flex items-center justify-end gap-1 sm:gap-1.5", className)}
    >
      <button
        type="button"
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Halaman sebelumnya"
        className={cn(
          "inline-flex items-center justify-center h-9 min-w-9 px-2.5 rounded-lg border text-sm font-medium transition-colors select-none",
          currentPage <= 1
            ? "border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed opacity-60 pointer-events-none"
            : "border-slate-300 text-slate-700 bg-white hover:bg-slate-100 hover:border-slate-400 cursor-pointer"
        )}
      >
        <AltArrowLeftIcon className="w-4 h-4 shrink-0" />
      </button>

      <div className="flex items-center gap-1.5">
        {pageNumbers.map((page, index) => {
          if (typeof page === "string") {
            return (
              <span
                key={`${page}-${index}`}
                className="w-7 h-9 flex items-center justify-center text-slate-400 select-none"
                aria-hidden="true"
              >
                <MenuDotsIcon className="w-4 h-4" />
              </span>
            );
          }

          const isActive = page === currentPage;
          return (
            <button
              key={page}
              type="button"
              onClick={() => handlePageClick(page)}
              aria-current={isActive ? "page" : undefined}
              aria-label={`Halaman ${page}`}
              className={cn(
                "h-9 min-w-9 px-3 rounded-lg text-sm transition-all select-none flex items-center justify-center",
                isActive
                  ? "font-medium text-white bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border-t border-t-slate-500 border-x border-x-slate-700 border-b-2 border-b-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_2px_4px_rgba(0,0,0,0.25)] cursor-default pointer-events-none"
                  : "font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 hover:border-slate-400 cursor-pointer"
              )}
            >
              {page}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Halaman berikutnya"
        className={cn(
          "inline-flex items-center justify-center h-9 min-w-9 px-2.5 rounded-lg border text-sm font-medium transition-colors select-none",
          currentPage >= totalPages
            ? "border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed opacity-60 pointer-events-none"
            : "border-slate-300 text-slate-700 bg-white hover:bg-slate-100 hover:border-slate-400 cursor-pointer"
        )}
      >
        <AltArrowRightIcon className="w-4 h-4 shrink-0" />
      </button>
    </nav>
  );
}
