"use client";

import { useMemo } from "react";
import { TableToolbar } from "@/components/ui/Table";
import { Combobox } from "@/components/ui/Combobox";
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
  const campaignOptions = useMemo(() => {
    return [
      { value: "ALL", label: "Semua program" },
      ...campaigns.map((c) => ({
        value: c.id,
        label: c.title,
      })),
    ];
  }, [campaigns]);

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
            <Combobox
              options={campaignOptions}
              value={campaignFilter}
              onChange={onCampaignFilterChange}
              placeholder="Semua program"
              searchPlaceholder="Cari program donasi..."
              emptyMessage="Data tidak ditemukan."
              className="h-10 w-48 sm:w-56 text-sm font-normal bg-white shrink-0"
              searchThreshold={5}
            />
          )}
        </>
      }
      onRefresh={onRefresh}
      isLoading={isPending}
    />
  );
}
