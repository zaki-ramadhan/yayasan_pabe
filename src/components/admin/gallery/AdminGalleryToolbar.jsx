"use client";

import { useMemo } from "react";
import { TableToolbar } from "@/components/ui/Table";
import { CreatableCombobox } from "@/components/ui/CreatableCombobox";

export function AdminGalleryToolbar({
  search,
  onSearchChange,
  category = "Semua Kategori",
  onCategoryChange,
  categories = [],
  isPending = false,
  onRefresh,
  onOpenUpload,
}) {
  const filterCategoryOptions = useMemo(() => {
    return [
      { value: "Semua Kategori", label: "Semua Kategori" },
      ...categories
        .filter((cat) => cat !== "Semua Kategori")
        .map((cat) => ({ value: cat, label: cat })),
    ];
  }, [categories]);

  return (
    <TableToolbar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Cari judul atau keterangan dokumentasi..."
      searchWidth="flex-1 min-w-[200px] max-w-sm"
      filters={
        <CreatableCombobox
          options={filterCategoryOptions}
          value={category}
          onChange={onCategoryChange}
          placeholder="Semua Kategori"
          searchPlaceholder="Cari kategori dokumentasi..."
          emptyMessage="Data tidak ditemukan."
          className="h-10 w-44 text-sm bg-white shrink-0 border-slate-300"
        />
      }
      onRefresh={onRefresh}
      isLoading={isPending}
      primaryAction={{
        label: "Unggah dokumentasi",
        onClick: onOpenUpload,
      }}
    />
  );
}
