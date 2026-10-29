"use client";

import { TableToolbar } from "@/components/ui/Table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

export function AdminPrayerToolbar({
  search,
  onSearchChange,
  onClearSearch,
  statusFilter,
  onStatusFilterChange,
  campaignFilter,
  onCampaignFilterChange,
  campaigns = [],
  onRefresh,
  isPending,
}) {
  return (
    <TableToolbar
      search={search}
      onSearchChange={onSearchChange}
      onClearSearch={onClearSearch}
      searchPlaceholder="Cari donatur, doa, invoice..."
      searchWidth="flex-1 min-w-[200px] max-w-sm"
      filters={
        <>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="h-10 w-38 text-sm font-normal bg-white shrink-0">
              <SelectValue placeholder="Semua status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua status</SelectItem>
              <SelectItem value="ACTIVE">Ditampilkan</SelectItem>
              <SelectItem value="HIDDEN">Disembunyikan</SelectItem>
            </SelectContent>
          </Select>

          {campaigns.length > 0 && (
            <Select value={campaignFilter} onValueChange={onCampaignFilterChange}>
              <SelectTrigger className="h-10 w-48 text-sm font-normal bg-white shrink-0">
                <SelectValue placeholder="Semua program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua program</SelectItem>
                {campaigns.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </>
      }
      onRefresh={onRefresh}
      isLoading={isPending}
    />
  );
}
