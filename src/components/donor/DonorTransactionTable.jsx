"use client";

import { Skeleton } from "@/components/ui/Skeleton";
import {
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableSortHeader,
  TableEmptyRow,
  TableSkeletonRows,
  TablePaginationFooter,
  TableToolbar,
} from "@/components/ui/Table";
import { DonorTransactionTableRow } from "./DonorTransactionTableRow";

export function DonorTransactionTable({
  items = [],
  pagination = { total: 0, totalPages: 1, currentPage: 1, limit: 10 },
  search = "",
  sortBy = "date",
  sortOrder = "desc",
  isLoading = false,
  onSearchChange,
  onSortChange,
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
          search={search}
          onSearchChange={onSearchChange}
          searchPlaceholder="Cari program, invoice, metode..."
          limit={pagination.limit}
          onLimitChange={onLimitChange}
          onRefresh={onRefresh}
          isLoading={isLoading}
        />
      </div>

      {/* Standar Reusable Table Primitives */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14 text-center">No.</TableHead>
            <TableSortHeader
              label="Atas Nama"
              sortKey="name"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSortChange}
            />
            <TableSortHeader
              label="Nominal Donasi"
              sortKey="amount"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSortChange}
              align="right"
            />
            <TableSortHeader
              label="Program Kebaikan"
              sortKey="program"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSortChange}
            />
            <TableSortHeader
              label="Metode Bayar"
              sortKey="channel"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSortChange}
            />
            <TableSortHeader
              label="Tanggal Transaksi"
              sortKey="date"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSortChange}
            />
            <TableHead className="text-center w-28">Kwitansi</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableSkeletonRows rows={5} colSpan={7} height="h-4" />
          ) : items.length === 0 ? (
            <TableEmptyRow
              colSpan={7}
              isFiltered={Boolean(search)}
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
          <p className="text-sm font-normal text-slate-500 mt-0.5">
            Rincian seluruh donasi, sedekah, dan zakat yang tercatat
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Skeleton className="h-10 w-full sm:w-72 md:w-80 rounded-md" />
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-sm font-medium text-slate-600">Baris:</span>
            <Skeleton className="h-10 w-20 rounded-md" />
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14 text-center">No.</TableHead>
            <TableHead>Atas Nama</TableHead>
            <TableHead className="text-right">Nominal Donasi</TableHead>
            <TableHead>Program Kebaikan</TableHead>
            <TableHead>Metode Bayar</TableHead>
            <TableHead>Tanggal Transaksi</TableHead>
            <TableHead className="text-center w-28">Kwitansi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableSkeletonRows rows={5} colSpan={7} height="h-4" />
        </TableBody>
      </Table>
    </TableContainer>
  );
}
