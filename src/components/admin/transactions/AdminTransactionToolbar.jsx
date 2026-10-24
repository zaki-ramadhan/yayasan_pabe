"use client";

import { Download } from "lucide-react";
import { TableToolbar } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AdminTransactionToolbar({
  search,
  onSearchChange,
  onClearSearch,
  statusFilter,
  onStatusChange,
  channelFilter,
  onChannelChange,
  onExportCsv,
  onRefresh,
  isLoading,
}) {
  return (
    <TableToolbar
      search={search}
      onSearchChange={onSearchChange}
      onClearSearch={onClearSearch}
      searchPlaceholder="Cari nomor invoice, nama donatur..."
      searchWidth="flex-1 min-w-[200px] max-w-sm"
      filters={
        <>
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="h-10 w-40 text-sm font-normal bg-white border border-slate-300 shrink-0">
              <SelectValue placeholder="Semua status" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-slate-200 z-50">
              <SelectItem value="ALL" className="cursor-pointer text-sm font-normal py-2">
                Semua status
              </SelectItem>
              <SelectItem value="PAID" className="cursor-pointer text-sm font-normal py-2">
                Berhasil (PAID)
              </SelectItem>
              <SelectItem value="PENDING" className="cursor-pointer text-sm font-normal py-2">
                Menunggu (PENDING)
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={channelFilter} onValueChange={onChannelChange}>
            <SelectTrigger className="h-10 w-40 text-sm font-normal bg-white border border-slate-300 shrink-0">
              <SelectValue placeholder="Semua metode" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-slate-200 z-50">
              <SelectItem value="ALL" className="cursor-pointer text-sm font-normal py-2">
                Semua metode
              </SelectItem>
              <SelectItem value="QRIS" className="cursor-pointer text-sm font-normal py-2">
                QRIS
              </SelectItem>
              <SelectItem value="BCA_VA" className="cursor-pointer text-sm font-normal py-2">
                BCA VA
              </SelectItem>
              <SelectItem value="BRI_VA" className="cursor-pointer text-sm font-normal py-2">
                BRI VA
              </SelectItem>
              <SelectItem value="BNI_VA" className="cursor-pointer text-sm font-normal py-2">
                BNI VA
              </SelectItem>
              <SelectItem value="MANDIRI_VA" className="cursor-pointer text-sm font-normal py-2">
                Mandiri VA
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
