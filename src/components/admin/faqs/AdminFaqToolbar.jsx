"use client";

import { TableToolbar } from "@/components/ui/Table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";

export function AdminFaqToolbar({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  categories = [],
  isLoading,
  onRefresh,
  onOpenAdd,
}) {
  return (
    <TableToolbar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Cari pertanyaan atau jawaban FAQ..."
      searchWidth="flex-1 min-w-[200px] max-w-sm"
      filters={
        <Select value={categoryFilter} onValueChange={onCategoryChange}>
          <SelectTrigger className="h-10 w-40 text-sm font-normal bg-white border border-slate-300 rounded-lg shrink-0">
            <SelectValue placeholder="Semua topik" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-slate-200 z-50">
            <SelectItem value="ALL" className="cursor-pointer text-sm font-normal py-2">
              Semua topik
            </SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat} className="cursor-pointer text-sm font-normal py-2">
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
      onRefresh={onRefresh}
      isLoading={isLoading}
      primaryAction={{
        label: "FAQ baru",
        onClick: onOpenAdd,
      }}
    />
  );
}
