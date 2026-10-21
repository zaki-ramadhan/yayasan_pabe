"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableSortHeader,
  TableEmptyRow,
  TableSkeletonRows,
  TablePaginationFooter,
} from "@/components/ui/table";

export function DonorTransactionTable({
  items = [],
  pagination = { total: 0, totalPages: 1, currentPage: 1, limit: 25 },
  search = "",
  sortBy = "date",
  sortOrder = "desc",
  isLoading = false,
  onSearchChange,
  onSortChange,
  onPageChange,
  onLimitChange,
}) {

  return (
    <div className="rounded-md border border-slate-200/90 bg-sidebar overflow-hidden">
      {/* Table Header Toolbar */}
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
          {/* Search Input dengan icon, loading state, dan clear button */}
          <div className="w-full sm:w-72 md:w-80">
            <Input
              type="text"
              icon={Search}
              placeholder="Cari program, invoice, metode..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              onClear={() => onSearchChange("")}
              maxLength={60}
              isLoading={isLoading}
              className="h-10 text-sm bg-white border-slate-300 focus:border-primary"
            />
          </div>

          {/* Rows Per Page Selector */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-sm font-medium text-slate-600">Baris:</span>
            <Select
              value={String(pagination.limit)}
              onValueChange={(val) => onLimitChange(Number(val))}
            >
              <SelectTrigger className="w-20 h-10 text-sm rounded-md border-slate-300 bg-white">
                <SelectValue placeholder="25" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
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
              label="Nominal"
              sortKey="nominal"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSortChange}
              align="right"
            />
            <TableSortHeader
              label="Program / Akad"
              sortKey="program"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSortChange}
            />
            <TableSortHeader
              label="Metode"
              sortKey="payment"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSortChange}
            />
            <TableSortHeader
              label="Tanggal"
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
              message="Belum ada data"
            />
          ) : (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="text-center text-slate-700 font-normal">
                  {item.no}
                </TableCell>
                <TableCell className="font-medium text-slate-900">
                  {item.donorName}
                </TableCell>
                <TableCell className="text-right font-medium text-emerald-800">
                  {formatRupiah(item.amount)}
                </TableCell>
                <TableCell className="font-normal text-slate-800 max-w-xs">
                  {item.campaignSlug ? (
                    <Link
                      href={`/program/${item.campaignSlug}`}
                      className="hover:text-primary transition-colors line-clamp-1"
                    >
                      {item.programTitle}
                    </Link>
                  ) : (
                    <span className="line-clamp-1">{item.programTitle}</span>
                  )}
                </TableCell>
                <TableCell className="font-normal text-slate-800">
                  {item.paymentChannel.replace("_", " ")}
                </TableCell>
                <TableCell className="font-normal text-slate-800 whitespace-nowrap">
                  {formatDate(item.date)}
                </TableCell>
                <TableCell className="text-center whitespace-nowrap">
                  <Link href={`/invoice/${item.invoiceId}`} target="_blank">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 rounded-md text-sm font-medium border-slate-300 bg-white text-slate-900 hover:bg-slate-50 hover:border-slate-400"
                    >
                      Kuitansi
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Table Pagination Footer */}
      <TablePaginationFooter
        pagination={pagination}
        onPageChange={onPageChange}
      />
    </div>
  );
}

export function DonorTransactionTableSkeleton() {
  return (
    <div className="rounded-md border border-slate-200/90 bg-sidebar overflow-hidden animate-pulse">
      {/* Table Header Toolbar */}
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

      {/* Standar Reusable Table Primitives */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14 text-center">No.</TableHead>
            <TableHead>Atas Nama</TableHead>
            <TableHead className="text-right">Nominal</TableHead>
            <TableHead>Program / Akad</TableHead>
            <TableHead>Metode</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead className="text-center w-28">Kwitansi</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableSkeletonRows rows={6} colSpan={7} height="h-4" />
        </TableBody>
      </Table>
    </div>
  );
}
