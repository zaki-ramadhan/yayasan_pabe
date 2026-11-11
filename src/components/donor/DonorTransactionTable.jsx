"use client";

import { Skeleton } from "@/components/ui/Skeleton";
import {
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableEmptyRow,
  TableSkeletonRows,
  TablePaginationFooter,
  TableToolbar,
} from "@/components/ui/Table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";
import { DonorTransactionTableRow } from "./DonorTransactionTableRow";

const SKELETON_CELL_ALIGNMENTS = [
  "left",
  "right",
  "left",
  "center",
  "center",
  "center",
  "center",
];

function DonorTransactionTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="whitespace-nowrap">Atas nama</TableHead>
        <TableHead className="text-right whitespace-nowrap min-w-[125px]">Nominal</TableHead>
        <TableHead className="whitespace-nowrap min-w-[210px]">Program / Peruntukan</TableHead>
        <TableHead className="text-center whitespace-nowrap min-w-[160px]">Metode bayar</TableHead>
        <TableHead className="text-center whitespace-nowrap w-28">Status</TableHead>
        <TableHead className="text-center whitespace-nowrap">Waktu transaksi</TableHead>
        <TableHead className="text-center whitespace-nowrap w-32">Aksi</TableHead>
      </TableRow>
    </TableHeader>
  );
}

export function DonorTransactionTable({
  items = [],
  pagination = { total: 0, totalPages: 1, currentPage: 1, limit: 10 },
  search = "",
  statusFilter = "ALL",
  typeFilter = "ALL",
  isLoading = false,
  isSearching = false,
  onSearchChange,
  onClearSearch,
  onStatusFilterChange,
  onPageChange,
  onRefresh,
}) {
  return (
    <TableContainer className="bg-sidebar">
      {/* Table Header Toolbar via Shared TableToolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-200">
        <TableToolbar
          title="Daftar Riwayat Transaksi"
          search={search}
          onSearchChange={onSearchChange}
          onClearSearch={onClearSearch}
          searchPlaceholder="Cari nomor invoice atau program..."
          searchWidth="flex-1 min-w-[200px] max-w-sm"
          filters={
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="h-10 w-40 sm:w-44 text-sm font-normal bg-white border border-slate-300 shrink-0 whitespace-nowrap">
                <SelectValue placeholder="Semua status" className="truncate whitespace-nowrap" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-slate-200 z-50 min-w-[160px]">
                <SelectItem value="ALL" className="cursor-pointer text-sm font-normal py-2">
                  Semua status
                </SelectItem>
                <SelectItem value="PAID" className="cursor-pointer text-sm font-normal py-2">
                  Berhasil
                </SelectItem>
                <SelectItem value="PENDING" className="cursor-pointer text-sm font-normal py-2">
                  Menunggu
                </SelectItem>
                <SelectItem value="EXPIRED" className="cursor-pointer text-sm font-normal py-2">
                  Kedaluwarsa
                </SelectItem>
                <SelectItem value="CANCELLED" className="cursor-pointer text-sm font-normal py-2">
                  Dibatalkan
                </SelectItem>
              </SelectContent>
            </Select>
          }
          onRefresh={onRefresh}
          isLoading={isLoading}
          isSearching={isSearching}
        />
      </div>

      {/* Standar Reusable Table Primitives */}
      <Table>
        <DonorTransactionTableHeader />

        <TableBody>
          {isLoading ? (
            <TableSkeletonRows
              rows={5}
              columns={7}
              cellAlignments={SKELETON_CELL_ALIGNMENTS}
              height="h-4"
            />
          ) : items.length === 0 ? (
            <TableEmptyRow
              colSpan={7}
              isFiltered={Boolean(
                (search && search.trim().length > 0) ||
                (statusFilter && statusFilter !== "ALL") ||
                (typeFilter && typeFilter !== "ALL")
              )}
            />
          ) : (
            items.map((item) => (
              <DonorTransactionTableRow key={item.id} item={item} />
            ))
          )}
        </TableBody>
      </Table>

      {/* Table Pagination Footer */}
      <TablePaginationFooter
        pagination={pagination}
        onPageChange={onPageChange}
      />
    </TableContainer>
  );
}

export function DonorTransactionTableSkeleton() {
  return (
    <TableContainer className="bg-sidebar animate-pulse">
      <div className="p-4 sm:p-5 border-b border-slate-200 space-y-3">
        <div>
          <h2 className="text-base font-medium text-slate-900">
            Daftar Riwayat Transaksi
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            <Skeleton className="h-10 flex-1 min-w-[200px] max-w-sm rounded-md" />
            <Skeleton className="h-10 w-40 sm:w-44 rounded-md shrink-0" />
          </div>
          <Skeleton className="h-10 w-10 rounded-md shrink-0" />
        </div>
      </div>

      <Table>
        <DonorTransactionTableHeader />
        <TableBody>
          <TableSkeletonRows
            rows={5}
            columns={7}
            cellAlignments={SKELETON_CELL_ALIGNMENTS}
            height="h-4"
          />
        </TableBody>
      </Table>
    </TableContainer>
  );
}
