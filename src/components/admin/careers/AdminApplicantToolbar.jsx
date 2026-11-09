"use client";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";
import { ArrowUpDown, Filter } from "lucide-react";

/**
 * Sub-widget Toolbar untuk filter status dan sortir pelamar.
 */
export function AdminApplicantToolbar({
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
}) {
  return (
    <div className="px-5 py-2.5 sm:px-6 bg-slate-50/60 border-b border-slate-100 flex items-center justify-end gap-3 shrink-0">
      {/* Filter Status */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-sm font-normal text-slate-600 shrink-0 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          Status:
        </span>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="h-8.5 w-36 text-sm bg-white border-slate-300 text-slate-700 font-normal">
            <SelectValue placeholder="Semua status" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="ALL" className="text-sm text-slate-700 font-normal">
              Semua status
            </SelectItem>
            <SelectItem value="PENDING" className="text-sm text-slate-700 font-normal">
              Menunggu
            </SelectItem>
            <SelectItem value="REVIEWED" className="text-sm text-slate-700 font-normal">
              Telah direview
            </SelectItem>
            <SelectItem value="SHORTLISTED" className="text-sm text-slate-700 font-normal">
              Lolos seleksi
            </SelectItem>
            <SelectItem value="REJECTED" className="text-sm text-slate-700 font-normal">
              Belum sesuai
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sorting Dropdown dengan lebar proporsional (w-44) tanpa text wrap */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-sm font-normal text-slate-600 shrink-0 flex items-center gap-1">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          Urutkan:
        </span>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="h-8.5 w-44 text-sm bg-white border-slate-300 text-slate-700 font-normal whitespace-nowrap">
            <SelectValue placeholder="Urutan" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="newest" className="text-sm text-slate-700 font-normal">
              Pelamar terbaru
            </SelectItem>
            <SelectItem value="oldest" className="text-sm text-slate-700 font-normal">
              Pelamar terlama
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
