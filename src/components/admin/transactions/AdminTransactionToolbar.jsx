"use client";

import { Download } from "lucide-react";
import { TableToolbar } from "@/components/ui/Table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

export function AdminTransactionToolbar({
  search,
  onSearchChange,
  onClearSearch,
  channelFilter,
  onChannelChange,
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
      searchPlaceholder="Cari nomor invoice, nama donatur..."
      searchWidth="flex-1 min-w-[200px] max-w-sm"
      filters={
        <Select value={channelFilter} onValueChange={onChannelChange}>
          <SelectTrigger className="h-10 w-48 sm:w-52 text-sm font-normal bg-white border border-slate-300 shrink-0 whitespace-nowrap">
            <SelectValue placeholder="Semua metode" className="truncate whitespace-nowrap" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-slate-200 z-50 min-w-[200px]">
              <SelectItem value="ALL" className="cursor-pointer text-sm font-normal py-2">
                Semua metode
              </SelectItem>
              <SelectItem value="qris" className="cursor-pointer text-sm font-normal py-2">
                QRIS
              </SelectItem>
              <SelectItem value="gopay" className="cursor-pointer text-sm font-normal py-2">
                GoPay
              </SelectItem>
              <SelectItem value="shopeepay" className="cursor-pointer text-sm font-normal py-2">
                ShopeePay
              </SelectItem>
              <SelectItem value="bca_va" className="cursor-pointer text-sm font-normal py-2">
                BCA Virtual Account
              </SelectItem>
              <SelectItem value="mandiri_va" className="cursor-pointer text-sm font-normal py-2">
                Mandiri Bill Payment
              </SelectItem>
              <SelectItem value="bri_va" className="cursor-pointer text-sm font-normal py-2">
                BRI Virtual Account
              </SelectItem>
              <SelectItem value="bni_va" className="cursor-pointer text-sm font-normal py-2">
                BNI Virtual Account
              </SelectItem>
              <SelectItem value="permata_va" className="cursor-pointer text-sm font-normal py-2">
                Permata Virtual Account
              </SelectItem>
          </SelectContent>
        </Select>
      }
      onRefresh={onRefresh}
      isLoading={isLoading}
      isSearching={isSearching}
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
