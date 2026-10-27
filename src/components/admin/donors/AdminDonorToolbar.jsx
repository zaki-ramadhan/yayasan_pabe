"use client";

import { Download } from "lucide-react";
import { TableToolbar } from "@/components/ui/table";

export function AdminDonorToolbar({
  search,
  onSearchChange,
  onClearSearch,
  onExportCsv,
  onRefresh,
  isLoading,
  isSearching,
}) {
  return (
    <TableToolbar
      search={search}
      onSearchChange={onSearchChange}
      onClearSearch={onClearSearch}
      searchPlaceholder="Cari nama, email, nomor telepon donatur..."
      searchWidth="flex-1 min-w-[200px] max-w-sm"
      actions={
        onExportCsv && (
          <button
            type="button"
            onClick={onExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-normal text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shrink-0 cursor-pointer"
            title="Ekspor CSV daftar donatur"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Ekspor CSV</span>
          </button>
        )
      }
      onRefresh={onRefresh}
      isLoading={isLoading}
      isSearching={isSearching}
    />
  );
}
