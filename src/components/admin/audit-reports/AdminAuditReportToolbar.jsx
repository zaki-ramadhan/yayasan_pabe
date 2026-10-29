"use client";

import { TableToolbar } from "@/components/ui/Table";

export function AdminAuditReportToolbar({
  search,
  onSearchChange,
  isPending,
  onRefresh,
  onOpenCreate,
}) {
  return (
    <TableToolbar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Cari tahun atau nama auditor..."
      searchWidth="flex-1 min-w-[200px] max-w-sm"
      onRefresh={onRefresh}
      isLoading={isPending}
      primaryAction={{
        label: "Tambah laporan audit",
        onClick: onOpenCreate,
      }}
    />
  );
}
