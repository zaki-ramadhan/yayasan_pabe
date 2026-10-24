"use client";

import { Download } from "lucide-react";
import { TableToolbar } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export function AdminRoutineDonationToolbar({
  search,
  onSearchChange,
  onClearSearch,
  statusFilter,
  onStatusFilterChange,
  frequencyFilter,
  onFrequencyFilterChange,
  onRefresh,
  onExportCsv,
  isLoading,
}) {
  return (
    <TableToolbar
      search={search}
      onSearchChange={onSearchChange}
      onClearSearch={onClearSearch}
      searchPlaceholder="Cari donatur atau program..."
      searchWidth="flex-1 min-w-[200px] max-w-sm"
      filters={
        <>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-36 h-10 text-sm font-normal bg-white shrink-0">
              <SelectValue placeholder="Semua status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-sm font-normal">
                Semua status
              </SelectItem>
              <SelectItem value="ACTIVE" className="text-sm font-normal">
                Aktif
              </SelectItem>
              <SelectItem value="PAUSED" className="text-sm font-normal">
                Dijeda
              </SelectItem>
              <SelectItem value="CANCELLED" className="text-sm font-normal">
                Dibatalkan
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={frequencyFilter} onValueChange={onFrequencyFilterChange}>
            <SelectTrigger className="w-36 h-10 text-sm font-normal bg-white shrink-0">
              <SelectValue placeholder="Semua frekuensi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-sm font-normal">
                Semua
              </SelectItem>
              <SelectItem value="DAILY" className="text-sm font-normal">
                Harian
              </SelectItem>
              <SelectItem value="WEEKLY" className="text-sm font-normal">
                Mingguan
              </SelectItem>
              <SelectItem value="MONTHLY" className="text-sm font-normal">
                Bulanan
              </SelectItem>
            </SelectContent>
          </Select>
        </>
      }
      onRefresh={onRefresh}
      isLoading={isLoading}
      primaryAction={
        onExportCsv
          ? {
              label: "Ekspor CSV",
              icon: Download,
              onClick: onExportCsv,
              className: "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50",
            }
          : undefined
      }
    />
  );
}
