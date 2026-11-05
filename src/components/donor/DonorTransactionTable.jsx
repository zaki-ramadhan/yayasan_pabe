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

export function DonorTransactionTable({
  items = [],
  pagination = { total: 0, totalPages: 1, currentPage: 1, limit: 10 },
  statusFilter = "ALL",
  isLoading = false,
  onStatusFilterChange,
  onPageChange,
  onLimitChange,
  onRefresh,
}) {
  return (
    <TableContainer className="bg-sidebar">
      {/* Table Header Toolbar via Shared TableToolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-200">
        <TableToolbar
          title="Daftar Riwayat Transaksi"
          limit={pagination.limit}
          onLimitChange={onLimitChange}
          onRefresh={onRefresh}
          isLoading={isLoading}
          extraActions={
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="h-10 w-36 sm:w-44 text-sm font-normal bg-white border border-slate-300 shrink-0">
                <SelectValue placeholder="Semua status" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-slate-200 z-50">
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
        />
      </div>

      {/* Standar Reusable Table Primitives */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14 text-center">No.</TableHead>
            <TableHead>Atas Nama</TableHead>
            <TableHead className="text-right">Nominal Donasi</TableHead>
            <TableHead>Program Kebaikan</TableHead>
            <TableHead className="text-center">Metode Bayar</TableHead>
            <TableHead className="text-center w-28">Status</TableHead>
            <TableHead className="text-center">Tanggal Transaksi</TableHead>
            <TableHead className="text-center w-32">Aksi</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableSkeletonRows
              rows={5}
              columns={8}
              cellAlignments={["center", "left", "right", "left", "center", "center", "center", "center"]}
              height="h-4"
            />
          ) : items.length === 0 ? (
            <TableEmptyRow
              colSpan={8}
              isFiltered={Boolean(statusFilter && statusFilter !== "ALL")}
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
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-base font-medium text-slate-900">
            Daftar Riwayat Transaksi
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Skeleton className="h-10 w-36 sm:w-44 rounded-md" />
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-sm font-medium text-slate-600">Baris:</span>
            <Skeleton className="h-10 w-20 rounded-md" />
          </div>
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14 text-center">No.</TableHead>
            <TableHead>Atas Nama</TableHead>
            <TableHead className="text-right">Nominal Donasi</TableHead>
            <TableHead>Program Kebaikan</TableHead>
            <TableHead className="text-center">Metode Bayar</TableHead>
            <TableHead className="text-center w-28">Status</TableHead>
            <TableHead className="text-center">Tanggal Transaksi</TableHead>
            <TableHead className="text-center w-32">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableSkeletonRows
            rows={5}
            columns={8}
            cellAlignments={["center", "left", "right", "left", "center", "center", "center", "center"]}
            height="h-4"
          />
        </TableBody>
      </Table>
    </TableContainer>
  );
}
