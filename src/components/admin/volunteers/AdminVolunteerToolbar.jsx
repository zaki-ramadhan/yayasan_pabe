"use client";

import { TableToolbar } from "@/components/ui/Table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";

export function AdminVolunteerToolbar({
  search,
  onSearchChange,
  onClearSearch,
  statusFilter,
  onStatusFilterChange,
  isLoading,
  onRefresh,
}) {
  return (
    <TableToolbar
      search={search}
      onSearchChange={onSearchChange}
      onClearSearch={onClearSearch}
      searchPlaceholder="Cari nama, kota, email, atau bidang minat..."
      searchWidth="flex-1 min-w-[200px] max-w-sm"
      filters={
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="h-10 w-40 text-sm font-normal bg-white border border-slate-300 shrink-0">
            <SelectValue placeholder="Semua status" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-slate-200 z-50">
            <SelectItem value="ALL" className="cursor-pointer text-sm font-normal py-2">
              Semua status
            </SelectItem>
            <SelectItem value="PENDING" className="cursor-pointer text-sm font-normal py-2">
              Menunggu (PENDING)
            </SelectItem>
            <SelectItem value="CONTACTED" className="cursor-pointer text-sm font-normal py-2">
              Sudah dihubungi
            </SelectItem>
            <SelectItem value="APPROVED" className="cursor-pointer text-sm font-normal py-2">
              Disetujui
            </SelectItem>
            <SelectItem value="REJECTED" className="cursor-pointer text-sm font-normal py-2">
              Ditolak
            </SelectItem>
          </SelectContent>
        </Select>
      }
      onRefresh={onRefresh}
      isLoading={isLoading}
    />
  );
}
