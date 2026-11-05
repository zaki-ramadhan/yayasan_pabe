"use client";

import { useMemo } from "react";
import { TableToolbar } from "@/components/ui/Table";
import { CreatableCombobox } from "@/components/ui/CreatableCombobox";

export function AdminFaqToolbar({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  categories = [],
  isLoading,
  onRefresh,
  onOpenAdd,
}) {
  const filterCategoryOptions = useMemo(() => {
    return [
      { value: "ALL", label: "Semua topik" },
      ...categories
        .filter((cat) => cat !== "ALL")
        .map((cat) => ({ value: cat, label: cat })),
    ];
  }, [categories]);

  return (
    <TableToolbar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Cari pertanyaan atau jawaban FAQ..."
      searchWidth="flex-1 min-w-[200px] max-w-sm"
      filters={
        <CreatableCombobox
          options={filterCategoryOptions}
          value={categoryFilter}
          onChange={onCategoryChange}
          placeholder="Semua topik"
          searchPlaceholder="Cari topik FAQ..."
          emptyMessage="Topik tidak ditemukan."
          className="h-10 w-44 text-sm bg-white shrink-0 border-slate-300"
          popoverClassName="w-64 max-w-[min(calc(100vw-2rem),24rem)]"
        />
      }
      onRefresh={onRefresh}
      isLoading={isLoading}
      primaryAction={{
        label: "FAQ baru",
        onClick: onOpenAdd,
      }}
    />
  );
}
