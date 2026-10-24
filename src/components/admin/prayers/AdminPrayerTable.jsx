"use client";

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
} from "@/components/ui/table";
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
    isPending,
    handleRefresh,
    handleSearchChange,
    handleClearSearch,
    handleStatusFilterChange,
    handleCampaignFilterChange,
    handlePageChange,
    handleToggleHide,
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

      {/* Main Table Container */}
      <TableContainer>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-200/90">
              <TableRow>
                <TableHead className="w-[170px] font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  No. Invoice
                </TableHead>
                <TableHead className="w-52 font-medium text-slate-600 text-sm py-2.5">
                  Donatur
                </TableHead>
                <TableHead className="min-w-[280px] max-w-[360px] font-medium text-slate-600 text-sm py-2.5">
                  Program donasi
                </TableHead>
                <TableHead className="w-32 font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Nominal
                </TableHead>
                <TableHead className="min-w-[200px] font-medium text-slate-600 text-sm py-2.5">
                  Pesan doa
                </TableHead>
                <TableHead className="w-36 font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
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
                  colSpan={8}
                  message="Tidak ada doa donatur yang cocok dengan filter atau kata kunci pencarian."
                />
              ) : (
                prayers.map((item) => (
                  <AdminPrayerTableRow
                    key={item.id}
                    item={item}
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
