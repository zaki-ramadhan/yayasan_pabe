"use client";

import { TableToolbar } from "@/components/ui/Table";

export function AdminDistributionToolbar({
  search,
  onSearchChange,
  onClearSearch,
  isLoading,
  onRefresh,
  onOpenAdd,
}) {
  return (
    <TableToolbar
      search={search}
      onSearchChange={onSearchChange}
      onClearSearch={onClearSearch}
      searchPlaceholder="Cari program atau kegiatan penyaluran..."
      searchWidth="flex-1 min-w-[200px] max-w-sm"
      onRefresh={onRefresh}
      isLoading={isLoading}
      primaryAction={{
        label: "Penyaluran baru",
        onClick: onOpenAdd,
      }}
    />
  );
}
