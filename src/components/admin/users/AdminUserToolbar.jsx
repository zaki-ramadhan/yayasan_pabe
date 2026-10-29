"use client";

import { TableToolbar } from "@/components/ui/Table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { MANAGEABLE_ROLES } from "@/lib/userParser";

export function AdminUserToolbar({
  search,
  onSearchChange,
  roleFilter,
  onRoleChange,
  statusFilter,
  onStatusChange,
  onRefresh,
  onOpenCreate,
  isLoading,
}) {
  return (
    <TableToolbar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Cari nama, email, atau telepon..."
      searchWidth="flex-1 min-w-[200px] max-w-sm"
      filters={
        <>
          <Select value={roleFilter} onValueChange={onRoleChange}>
            <SelectTrigger className="h-10 w-38 text-sm font-normal bg-white border border-slate-300 rounded-lg shrink-0">
              <SelectValue placeholder="Semua peran" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-slate-200 z-50">
              <SelectItem value="ALL" className="cursor-pointer text-sm font-normal py-2">
                Semua peran
              </SelectItem>
              {MANAGEABLE_ROLES.map((r) => (
                <SelectItem key={r.value} value={r.value} className="cursor-pointer text-sm font-normal py-2">
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="h-10 w-36 text-sm font-normal bg-white border border-slate-300 rounded-lg shrink-0">
              <SelectValue placeholder="Semua status" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-slate-200 z-50">
              <SelectItem value="ALL" className="cursor-pointer text-sm font-normal py-2">
                Semua status
              </SelectItem>
              <SelectItem value="ACTIVE" className="cursor-pointer text-sm font-normal py-2">
                Aktif
              </SelectItem>
              <SelectItem value="INACTIVE" className="cursor-pointer text-sm font-normal py-2">
                Ditangguhkan
              </SelectItem>
            </SelectContent>
          </Select>
        </>
      }
      onRefresh={onRefresh}
      isLoading={isLoading}
      primaryAction={{
        label: "Pengurus baru",
        onClick: onOpenCreate,
      }}
    />
  );
}
