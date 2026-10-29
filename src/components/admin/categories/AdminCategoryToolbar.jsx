import { TableToolbar } from "@/components/ui/Table";

export function AdminCategoryToolbar({
  search,
  onSearchChange,
  onClearSearch,
  onRefresh,
  onOpenCreate,
  isPending,
}) {
  return (
    <TableToolbar
      search={search}
      onSearchChange={onSearchChange}
      onClearSearch={onClearSearch}
      searchPlaceholder="Cari nama atau tautan (slug)..."
      onRefresh={onRefresh}
      isLoading={isPending}
      primaryAction={{
        label: "Tambah kategori",
        onClick: onOpenCreate,
      }}
    />
  );
}
