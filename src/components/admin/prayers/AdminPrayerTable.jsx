"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import {
  Table,
  TableContainer,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableEmptyRow,
  TablePaginationFooter,
} from "@/components/ui/Table";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { TableSelectionBar } from "@/components/ui/TableSelectionBar";
import { AdminPrayerToolbar } from "./AdminPrayerToolbar";
import { AdminPrayerTableRow } from "./AdminPrayerTableRow";
import { useAdminPrayerModeration } from "./useAdminPrayerModeration";

export function AdminPrayerTable({
  initialData = { prayers: [], total: 0, totalPages: 1, currentPage: 1 },
  campaigns = [],
}) {
  const {
    prayers,
    total,
    totalPages,
    currentPage,
    search,
    statusFilter,
    campaignFilter,
    togglingId,
    isBulkProcessing,
    isPending,
    selection,
    handleRefresh,
    handleSearchChange,
    handleClearSearch,
    handleStatusFilterChange,
    handleCampaignFilterChange,
    handlePageChange,
    handleToggleHide,
    handleBulkToggleHide,
  } = useAdminPrayerModeration({ initialData });

  return (
    <div className="space-y-4">
      {/* Top Filter and Actions Toolbar */}
      <AdminPrayerToolbar
        search={search}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        campaignFilter={campaignFilter}
        onCampaignFilterChange={handleCampaignFilterChange}
        campaigns={campaigns}
        isPending={isPending}
        onRefresh={handleRefresh}
      />

      {/* Reusable Bulk Action Bar */}
      <TableSelectionBar
        selectedCount={selection.selectedCount}
        totalCount={prayers.length}
        label="doa"
        onSelectAll={selection.selectAll}
        isAllSelected={selection.allSelected}
        onClearSelection={selection.clearSelection}
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isBulkProcessing}
          onClick={() => handleBulkToggleHide(true)}
          className="bg-white border-slate-300 text-rose-700 hover:bg-rose-50 hover:border-rose-300 font-medium h-8 text-xs gap-1.5 cursor-pointer disabled:pointer-events-none disabled:opacity-50"
        >
          {isBulkProcessing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <EyeOff className="w-3.5 h-3.5 text-rose-600" />
          )}
          <span>Sembunyikan terpilih</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isBulkProcessing}
          onClick={() => handleBulkToggleHide(false)}
          className="bg-white border-slate-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 font-medium h-8 text-xs gap-1.5 cursor-pointer disabled:pointer-events-none disabled:opacity-50"
        >
          {isBulkProcessing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Eye className="w-3.5 h-3.5 text-emerald-600" />
          )}
          <span>Tampilkan terpilih</span>
        </Button>
      </TableSelectionBar>

      <TableContainer>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-200/90">
              <TableRow>
                <TableHead className="w-12 text-center py-2.5">
                  <Checkbox
                    checked={selection.allSelected}
                    indeterminate={selection.isIndeterminate}
                    onCheckedChange={selection.toggleSelectAll}
                    aria-label="Pilih semua doa di halaman ini"
                  />
                </TableHead>
                <TableHead className="w-[170px] font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  No. Invoice
                </TableHead>
                <TableHead className="w-52 font-medium text-slate-600 text-sm py-2.5">
                  Donatur
                </TableHead>
                <TableHead className="min-w-[280px] max-w-[360px] font-medium text-slate-600 text-sm py-2.5">
                  Program donasi
                </TableHead>
                <TableHead className="w-32 text-right font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Nominal
                </TableHead>
                <TableHead className="min-w-[200px] font-medium text-slate-600 text-sm py-2.5">
                  Pesan doa
                </TableHead>
                <TableHead className="w-36 text-center font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Waktu kirim
                </TableHead>
                <TableHead className="w-28 text-center font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Status moderasi
                </TableHead>
                <TableHead className="w-24 text-right font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap pr-4">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {prayers.length === 0 ? (
                <TableEmptyRow
                  colSpan={9}
                  isFiltered={Boolean(search || statusFilter !== "ALL" || campaignFilter !== "ALL")}
                />
              ) : (
                prayers.map((item) => (
                  <AdminPrayerTableRow
                    key={item.id}
                    item={item}
                    isSelected={selection.isSelected(item.id)}
                    onToggleSelect={selection.toggleSelect}
                    isToggling={togglingId === item.id}
                    onToggleHide={handleToggleHide}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Server Pagination Footer */}
        <TablePaginationFooter
          currentPage={currentPage}
          totalPages={totalPages}
          total={total}
          limit={15}
          onPageChange={handlePageChange}
          isPending={isPending}
        />
      </TableContainer>
    </div>
  );
}
