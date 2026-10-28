"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export function CategoryTabs({
  categories = [],
  counts = {},
  selectedCategory = "all",
  onSelectCategory,
  basePath,
  categoryParam = "kategori",
  className,
  showBorder = false,
}) {
  const hasCounts = counts && Object.keys(counts).length > 0;
  const totalCount = hasCounts
    ? typeof counts.all === "number"
      ? counts.all
      : Object.values(counts).reduce((acc, curr) => (typeof curr === "number" ? acc + curr : acc), 0)
    : undefined;

  // Jika total data benar-benar 0, sembunyikan seluruh chip tabs agar tampilan clean
  if (totalCount === 0) {
    return null;
  }

  const visibleCategories = categories.filter((cat) => {
    const catId = typeof cat === "string" ? (cat === "Semua Kategori" ? "all" : cat) : cat.id;
    const catName = typeof cat === "string" ? cat : cat.name;
    const isAll =
      catId === "all" ||
      catId === "semua" ||
      catId === "Semua Kategori" ||
      catName === "Semua Kategori" ||
      catName === "Semua Program" ||
      catName === "Semua Artikel";

    // Opsi "Semua" dipertahankan jika masih ada data dalam katalog
    if (isAll) return true;

    // Sembunyikan kategori jika counts disediakan dan nilainya 0
    if (hasCounts) {
      const count = counts[catId] ?? counts[catName];
      if (typeof count === "number") {
        return count > 0;
      }
    }

    // Jika objek category dari database memiliki properti count
    if (typeof cat?.count === "number") {
      return cat.count > 0;
    }

    return true;
  });

  // Jika tidak ada kategori yang valid tersisa
  if (visibleCategories.length === 0) {
    return null;
  }

  // Jika hanya tersisa 1 tab dan itu adalah opsi "Semua" dengan data 0
  if (visibleCategories.length === 1) {
    const single = visibleCategories[0];
    const singleId = typeof single === "string" ? (single === "Semua Kategori" ? "all" : single) : single.id;
    const singleName = typeof single === "string" ? single : single.name;
    const isSingleAll =
      singleId === "all" ||
      singleId === "semua" ||
      singleId === "Semua Kategori" ||
      singleName === "Semua Kategori" ||
      singleName === "Semua Program" ||
      singleName === "Semua Artikel";

    const singleCount = counts?.[singleId] ?? counts?.[singleName] ?? single?.count;
    if (isSingleAll && singleCount === 0) {
      return null;
    }
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-2 sm:gap-2.5",
        showBorder && "border-b border-slate-200 pb-3",
        className
      )}
    >
      {visibleCategories.map((cat) => {
        const catId = typeof cat === "string" ? (cat === "Semua Kategori" ? "all" : cat) : cat.id;
        const catName = typeof cat === "string" ? cat : cat.name;
        const isActive =
          selectedCategory === catId ||
          selectedCategory === catName ||
          ((catId === "all" || catId === "Semua Kategori") &&
            (selectedCategory === "all" || selectedCategory === "Semua Kategori"));
        const count = counts[catId] ?? counts[catName];
        const hasCount = typeof count === "number";

        const baseClasses = cn(
          "whitespace-nowrap px-4 py-2 text-sm font-medium transition-all shrink-0 min-h-[38px] flex items-center justify-center rounded-full cursor-pointer select-none",
          isActive
            ? "text-white bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border-t border-t-slate-500 border-x border-x-slate-700 border-b-2 border-b-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_3px_6px_rgba(0,0,0,0.2)] cursor-default"
            : "bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-slate-300 hover:border-slate-400 shadow-2xs"
        );

        const content = (
          <span className="flex items-center gap-1.5">
            <span>{catName}</span>
            {hasCount && (
              <span
                className={cn(
                  "text-xs font-medium transition-colors",
                  isActive ? "text-slate-300" : "text-slate-500"
                )}
              >
                ({count})
              </span>
            )}
          </span>
        );

        if (basePath) {
          const href =
            catId === "all"
              ? basePath
              : `${basePath}${basePath.includes("?") ? "&" : "?"}${categoryParam}=${encodeURIComponent(catId)}`;
          return (
            <Link key={catId} href={href} className={baseClasses}>
              {content}
            </Link>
          );
        }

        return (
          <button
            key={catId}
            type="button"
            onClick={() => onSelectCategory?.(catId)}
            className={baseClasses}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
