"use client";

import { TableToolbar } from "@/components/ui/Table";
import { CreatableCombobox } from "@/components/ui/CreatableCombobox";

export function AdminCareerToolbar({
  search,
  onSearchChange,
  onClearSearch,
  departmentFilter,
  onDepartmentChange,
  filterDepartmentOptions = [],
  onRefresh,
  onOpenAdd,
  isLoading,
}) {
  return (
    <TableToolbar
      search={search}
      onSearchChange={onSearchChange}
      onClearSearch={onClearSearch}
      searchPlaceholder="Cari lowongan, divisi, lokasi..."
      searchWidth="flex-1 min-w-[200px] max-w-sm"
      filters={
        <CreatableCombobox
          options={filterDepartmentOptions}
          value={departmentFilter}
          onChange={onDepartmentChange}
          placeholder="Semua Divisi"
          searchPlaceholder="Cari divisi pekerjaan..."
          emptyMessage="Divisi tidak ditemukan."
          className="h-10 w-48 text-sm bg-white shrink-0"
        />
      }
      onRefresh={onRefresh}
      isLoading={isLoading}
      primaryAction={{
        label: "Lowongan baru",
        onClick: onOpenAdd,
      }}
    />
  );
}
