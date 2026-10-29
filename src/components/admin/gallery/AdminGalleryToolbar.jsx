"use client";

import { TableToolbar } from "@/components/ui/Table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";

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
  return (
    <TableToolbar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Cari judul atau keterangan dokumentasi..."
      searchWidth="flex-1 min-w-[200px] max-w-sm"
      filters={
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="h-10 w-44 text-sm bg-white shrink-0 border-slate-300">
            <SelectValue placeholder="Semua kategori" />
          </SelectTrigger>
          <SelectContent align="start">
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
