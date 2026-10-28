"use client";

import { CategoryTabs } from "@/components/shared/CategoryTabs";

export function GalleryFilterBar({
  categories = [],
  activeCategory = "Semua Kategori",
  onSelectCategory,
  counts,
}) {
  return (
    <CategoryTabs
      categories={categories}
      selectedCategory={activeCategory}
      onSelectCategory={onSelectCategory}
      counts={counts}
    />
  );
}
