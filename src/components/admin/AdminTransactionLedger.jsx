"use client";

import { useState, useMemo } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SortDropdown } from "@/components/shared/SortDropdown";
import { formatRupiah } from "@/lib/formatters";
import { exportTransactionsToCsv } from "@/lib/exportCsv";
import { FinancialMetricCard } from "@/components/reports/FinancialMetricCard";
import { FinancialTransactionRow } from "@/components/reports/FinancialTransactionRow";
import {
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableSortHeader,
  TableEmptyRow,
  TablePaginationFooter,
  useTableSort,
} from "@/components/ui/table";

const PERIOD_OPTIONS = [
  { label: "7 Hari Terakhir", value: "7d" },
  { label: "30 Hari Terakhir", value: "30d" },
  { label: "1 Tahun Terakhir", value: "1y" },
];

const TYPE_OPTIONS = [
  { label: "Semua Transaksi", value: "ALL" },
  { label: "Donasi Masuk", value: "INCOME" },
  { label: "Penyaluran Program", value: "EXPENSE" },
];

const PAGE_SIZE = 10;

/**
 * Admin Transaction Ledger Component.
 * Preserved for admin dashboard with filtering, metric cards, paginated table, and CSV export.
 */
export function AdminTransactionLedger({
  transactions = [],
  nextDistributionDate = "25 Sep 2026",
}) {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [selectedType, setSelectedType] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const referenceTime = transactions[0]?.date
      ? Math.max(new Date().getTime(), new Date(transactions[0].date).getTime())
      : new Date().getTime();

    let cutoffDays = 30;
    if (selectedPeriod === "7d") cutoffDays = 7;
    if (selectedPeriod === "30d") cutoffDays = 30;
    if (selectedPeriod === "1y") cutoffDays = 365;

    const cutoffTime = referenceTime - cutoffDays * 24 * 60 * 60 * 1000;

    return transactions.filter((tx) => {
      const txTime = new Date(tx.date).getTime();
      const matchesPeriod = txTime >= cutoffTime;

      const matchesType =
        selectedType === "ALL" ||
        (selectedType === "INCOME" && (tx.type === "INCOME" || tx.amount > 0)) ||
        (selectedType === "EXPENSE" && (tx.type === "EXPENSE" || tx.amount < 0));

      return matchesPeriod && matchesType;
    });
  }, [transactions, selectedPeriod, selectedType]);

  const {
    items: sortedTransactions,
    sortBy,
    sortOrder,
    handleSort,
  } = useTableSort(filteredTransactions, {
    initialSortBy: "date",
    initialSortOrder: "desc",
  });

  const metrics = useMemo(() => {
    let totalIncome = 0;
    let totalExpenses = 0;

    filteredTransactions.forEach((tx) => {
      if (tx.type === "INCOME" || tx.amount > 0) {
        totalIncome += Math.abs(tx.amount);
      } else {
        totalExpenses += Math.abs(tx.amount);
      }
    });

    const netBalance = totalIncome - totalExpenses;

    return {
      totalIncome,
      totalExpenses,
      netBalance,
    };
  }, [filteredTransactions]);

  const totalPages = Math.ceil(sortedTransactions.length / PAGE_SIZE) || 1;
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return sortedTransactions.slice(startIndex, startIndex + PAGE_SIZE);
  }, [sortedTransactions, currentPage]);

  const handlePeriodChange = (val) => {
    setSelectedPeriod(val);
    setCurrentPage(1);
  };

  const handleTypeChange = (val) => {
    setSelectedType(val);
    setCurrentPage(1);
  };

  const handleExportCsv = () => {
    exportTransactionsToCsv(sortedTransactions, "rekap-buku-besar.csv");
  };

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FinancialMetricCard
          label="Total Donasi Masuk"
          value={metrics.totalIncome}
          type="INCOME"
        />
        <FinancialMetricCard
          label="Total Penyaluran"
          value={metrics.totalExpenses}
          type="EXPENSE"
        />
        <FinancialMetricCard
          label="Saldo Kas Bersih"
          value={metrics.netBalance}
          type="NET"
        />
      </div>

      {/* Main Ledger Content Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-5">
        {/* Controls Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-slate-700">Filter Transaksi:</span>
            <SortDropdown
              options={PERIOD_OPTIONS}
              value={selectedPeriod}
              onChange={handlePeriodChange}
              label="Periode"
              className="h-10 px-3.5 text-sm font-normal border-slate-300 text-slate-800"
            />
            <SortDropdown
              options={TYPE_OPTIONS}
              value={selectedType}
              onChange={handleTypeChange}
              label="Tipe Transaksi"
              className="h-10 px-3.5 text-sm font-normal border-slate-300 text-slate-800"
            />
          </div>

          <div className="text-sm font-normal text-slate-600 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-lg self-start lg:self-auto">
            Estimasi penyaluran berikutnya:{" "}
            <span className="font-medium text-slate-900">{nextDistributionDate}</span>
          </div>
        </div>

        {/* Action & Result Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h3 className="text-lg sm:text-xl font-semibold text-slate-950">
              Riwayat Transaksi
            </h3>
            <p className="text-sm font-normal text-slate-600">
              Menampilkan {paginatedTransactions.length} dari {sortedTransactions.length} transaksi
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={filteredTransactions.length === 0}
            className="h-10 px-3.5 text-sm font-medium border-slate-300 text-slate-800 hover:bg-slate-50 gap-2 rounded-lg cursor-pointer self-start sm:self-auto shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-600 shrink-0" />
            <span>Export CSV</span>
          </Button>
        </div>

        {/* Transactions Table */}
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableSortHeader
                  label="Tanggal"
                  sortKey="date"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                />
                <TableSortHeader
                  label="Sumber"
                  sortKey="source"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                />
                <TableSortHeader
                  label="Tipe"
                  sortKey="type"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                />
                <TableSortHeader
                  label="Deskripsi"
                  sortKey="description"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                />
                <TableSortHeader
                  label="Kategori"
                  sortKey="category"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                />
                <TableSortHeader
                  label="Nominal"
                  sortKey="amount"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                  align="right"
                />
                <TableSortHeader
                  label="Status"
                  sortKey="status"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                  align="center"
                />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((tx) => (
                  <FinancialTransactionRow key={tx.id} transaction={tx} />
                ))
              ) : (
                <TableEmptyRow
                  colSpan={7}
                  isFiltered={selectedType !== "ALL" || selectedPeriod !== "30d"}
                />
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {totalPages > 1 && (
          <TablePaginationFooter
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}
