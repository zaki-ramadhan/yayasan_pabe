"use client";

import { TableToolbar } from "@/components/ui/table";
import { CreatableCombobox } from "@/components/ui/creatable-combobox";

export function AdminArticleToolbar({
  search,
  onSearchChange,
  onClearSearch,
  categoryFilter,
  onCategoryChange,
  categoryOptions,
  isLoading,
  onRefresh,
  onOpenAdd,
}) {
  return (
    <TableToolbar
      search={search}
      onSearchChange={onSearchChange}
      onClearSearch={onClearSearch}
      searchPlaceholder="Cari judul berita atau penulis..."
      searchWidth="flex-1 min-w-[200px] max-w-sm"
      filters={
        <CreatableCombobox
          options={categoryOptions}
          value={categoryFilter}
          onChange={onCategoryChange}
          placeholder="Semua Kategori"
          searchPlaceholder="Cari kategori artikel..."
          emptyMessage="Kategori tidak ditemukan."
          className="h-10 w-44 text-sm bg-white shrink-0"
        />
      }
      onRefresh={onRefresh}
      isLoading={isLoading}
      primaryAction={{
        label: "Artikel baru",
        onClick: onOpenAdd,
      }}
    />
  );
}
