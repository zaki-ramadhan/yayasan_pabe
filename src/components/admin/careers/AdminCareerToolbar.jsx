"use client";

import { TableToolbar } from "@/components/ui/Table";

export function AdminCareerToolbar({
  search,
  onSearchChange,
  onClearSearch,
  onRefresh,
  onOpenAdd,
  isLoading,
}) {
  return (
    <TableToolbar
      search={search}
      onSearchChange={onSearchChange}
      onClearSearch={onClearSearch}
      searchPlaceholder="Cari lowongan, lokasi..."
      searchWidth="flex-1 min-w-[200px] max-w-sm"
      onRefresh={onRefresh}
      isLoading={isLoading}
      primaryAction={{
        label: "Lowongan baru",
        onClick: onOpenAdd,
      }}
    />
  );
}
