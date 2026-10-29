"use client";

import { TableToolbar } from "@/components/ui/Table";
import { CreatableCombobox } from "@/components/ui/CreatableCombobox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";

export function AdminProgramToolbar({
  search,
  onSearchChange,
  onClearSearch,
  categoryFilter,
  onCategoryChange,
  filterCategoryOptions = [],
  statusFilter,
  onStatusChange,
  onRefresh,
  onOpenAdd,
  isLoading,
}) {
  return (
    <TableToolbar
      search={search}
      onSearchChange={onSearchChange}
      onClearSearch={onClearSearch}
      searchPlaceholder="Cari judul program donasi..."
      searchWidth="flex-1 min-w-[200px] max-w-sm"
      filters={
        <>
          <CreatableCombobox
            options={filterCategoryOptions}
            value={categoryFilter}
            onChange={onCategoryChange}
            placeholder="Semua Kategori"
            searchPlaceholder="Cari kategori program..."
            emptyMessage="Kategori tidak ditemukan."
            className="h-10 w-44 text-sm bg-white shrink-0"
          />

          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="h-10 w-36 text-sm bg-white shrink-0">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectItem value="ALL">Semua Status</SelectItem>
              <SelectItem value="ACTIVE">Aktif</SelectItem>
              <SelectItem value="PAUSED">Terjeda</SelectItem>
              <SelectItem value="COMPLETED">Selesai</SelectItem>
            </SelectContent>
          </Select>
        </>
      }
      onRefresh={onRefresh}
      isLoading={isLoading}
      primaryAction={{
        label: "Program baru",
        onClick: onOpenAdd,
      }}
    />
  );
}
