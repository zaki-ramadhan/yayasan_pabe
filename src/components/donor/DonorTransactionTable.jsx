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
  typeFilter = "ALL",
  isLoading = false,
  onStatusFilterChange,
  onTypeFilterChange,
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
            <div className="flex flex-wrap items-center gap-2">
              <Select value={typeFilter} onValueChange={onTypeFilterChange}>
                <SelectTrigger className="h-10 w-48 sm:w-52 text-sm font-normal bg-white border border-slate-300 shrink-0 whitespace-nowrap">
                  <SelectValue placeholder="Semua kategori" className="truncate whitespace-nowrap" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-slate-200 z-50 min-w-[200px]">
                  <SelectItem value="ALL" className="cursor-pointer text-sm font-normal py-2">
                    Semua transaksi
                  </SelectItem>
                  <SelectItem value="CAMPAIGN" className="cursor-pointer text-sm font-normal py-2">
                    Donasi program
                  </SelectItem>
                  <SelectItem value="ZAKAT" className="cursor-pointer text-sm font-normal py-2">
                    Zakat maal & fitrah
                  </SelectItem>
                </SelectContent>
              </Select>

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
            </div>
          }
        />
      </div>

      {/* Standar Reusable Table Primitives */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No.</TableHead>
            <TableHead>Atas nama</TableHead>
            <TableHead className="text-right">Nominal donasi</TableHead>
            <TableHead>Program donasi</TableHead>
            <TableHead className="text-center">Metode bayar</TableHead>
            <TableHead className="text-center w-28">Status</TableHead>
            <TableHead className="text-center">Tanggal transaksi</TableHead>
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
              isFiltered={Boolean(
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
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-base font-medium text-slate-900">
            Daftar Riwayat Transaksi
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Skeleton className="h-10 w-48 sm:w-52 rounded-md" />
          <Skeleton className="h-10 w-40 sm:w-44 rounded-md" />
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
            <TableHead>No.</TableHead>
            <TableHead>Atas nama</TableHead>
            <TableHead className="text-right">Nominal donasi</TableHead>
            <TableHead>Program donasi</TableHead>
            <TableHead className="text-center">Metode bayar</TableHead>
            <TableHead className="text-center w-28">Status</TableHead>
            <TableHead className="text-center">Tanggal transaksi</TableHead>
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
