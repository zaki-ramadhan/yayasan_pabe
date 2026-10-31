"use client";

import { useState, useMemo } from "react";
import { formatDate } from "@/lib/formatters";
import {
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableEmptyRow,
  TablePaginationFooter,
} from "@/components/ui/Table";
import { AdminTransactionDetailModal } from "@/components/admin/transactions/AdminTransactionDetailModal";
import { AdminTransactionVerifyDialog } from "@/components/admin/transactions/AdminTransactionVerifyDialog";
import { AdminTransactionToolbar } from "@/components/admin/transactions/AdminTransactionToolbar";
import { AdminTransactionTableRow } from "@/components/admin/transactions/AdminTransactionTableRow";
import { usePagination } from "@/hooks/usePagination";
import { useDebounce } from "@/hooks/useDebounce";
import { sanitizeSearchQuery, maskEmail } from "@/lib/security";
import { downloadCsv } from "@/lib/exportCsv";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/useToast";
import { copyToClipboard } from "@/lib/clipboard";

const PAGE_SIZE = 10;

export function AdminTransactionTable({ initialTransactions = [] }) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [channelFilter, setChannelFilter] = useState("ALL");
  const [copiedId, setCopiedId] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [verifyingTx, setVerifyingTx] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearch = useDebounce(search.trim(), 300);
  const isSearching = Boolean(search.trim().length > 0 && search.trim() !== debouncedSearch);

  const handleCopyInvoice = async (invoiceId) => {
    if (!invoiceId) return;
    const success = await copyToClipboard(invoiceId);
    if (success) {
      setCopiedId(invoiceId);
      toast.success(`Nomor invoice ${invoiceId} berhasil disalin.`);
      setTimeout(() => {
        setCopiedId((prev) => (prev === invoiceId ? null : prev));
      }, 2000);
    } else {
      toast.error("Gagal menyalin nomor invoice.");
    }
  };

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
      if (channelFilter !== "ALL" && t.paymentChannel !== channelFilter) return false;
      if (debouncedSearch) {
        const term = debouncedSearch.toLowerCase();
        const matchInv = t.invoiceId.toLowerCase().includes(term);
        const matchName = t.donorName.toLowerCase().includes(term);
        const matchEmail = (t.donorEmail || "").toLowerCase().includes(term);
        if (!matchInv && !matchName && !matchEmail) return false;
      }
      return true;
    });
  }, [transactions, statusFilter, channelFilter, debouncedSearch]);

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems: paginatedTransactions,
    resetPage,
  } = usePagination(filtered, { pageSize: PAGE_SIZE });

  const handleSearchChange = (e) => {
    setSearch(sanitizeSearchQuery(e.target.value));
    resetPage();
  };

  const handleClearSearch = () => {
    setSearch("");
    resetPage();
  };

  const handleStatusChange = (val) => {
    setStatusFilter(val);
    resetPage();
  };

  const handleChannelChange = (val) => {
    setChannelFilter(val);
    resetPage();
  };

  const refreshList = async () => {
    setIsLoading(true);
    try {
      const res = await safeFetch("/api/admin/transactions?limit=100");
      const data = await res.json();
      if (data.success && data.data) {
        setTransactions(data.data);
        toast.success("Data transaksi berhasil diperbarui.");
      } else {
        toast.error(data.message || "Gagal menyegarkan data transaksi.");
      }
    } catch {
      toast.error("Gagal menyegarkan data transaksi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmVerify = async () => {
    if (!verifyingTx?.id) return;
    setIsVerifying(true);
    try {
      const res = await safeFetch(`/api/admin/transactions/${verifyingTx.id}/verify`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Donasi berhasil diverifikasi dan dana terakumulasi.");
        setTransactions((prev) =>
          prev.map((t) => (t.id === verifyingTx.id ? { ...t, status: "PAID", paidAt: new Date().toISOString() } : t))
        );
        setVerifyingTx(null);
      } else {
        toast.error(data.message || "Gagal memverifikasi transaksi.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat memverifikasi transaksi.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleExportCsv = () => {
    if (filtered.length === 0) {
      toast.error("Tidak ada data transaksi untuk diekspor.");
      return;
    }

    const headers = ["Invoice", "Donatur", "Email", "Nomor HP", "Program", "Nominal", "Metode", "Status", "Tanggal"];
    const rows = filtered.map((t) => [
      t.invoiceId,
      `"${(t.donorName || "").replace(/"/g, '""')}"`,
      t.donorEmail ? maskEmail(t.donorEmail) : "-",
      t.donorPhone || "-",
      `"${(t.campaignTitle || "").replace(/"/g, '""')}"`,
      t.amount,
      t.paymentChannel,
      t.status,
      formatDate(t.createdAt),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    downloadCsv(`rekap-mutasi-transaksi-${new Date().toISOString().slice(0, 10)}.csv`, csvContent);
    toast.success("Laporan mutasi berhasil diunduh.");
  };

  return (
    <div className="space-y-4">
      <AdminTransactionToolbar
        search={search}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        channelFilter={channelFilter}
        onChannelChange={handleChannelChange}
        onExportCsv={handleExportCsv}
        onRefresh={refreshList}
        isLoading={isLoading}
        isSearching={isSearching}
      />

      <TableContainer>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-200/90">
              <TableRow>
                <TableHead className="w-[170px] font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Invoice
                </TableHead>
                <TableHead className="w-px font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Donatur
                </TableHead>
                <TableHead className="w-full font-medium text-slate-600 text-sm py-2.5 min-w-[200px]">
                  Program tujuan
                </TableHead>
                <TableHead className="w-px text-right font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Nominal
                </TableHead>
                <TableHead className="w-px text-center font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Metode
                </TableHead>
                <TableHead className="w-px text-center font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Tanggal
                </TableHead>
                <TableHead className="w-px text-center font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Status
                </TableHead>
                <TableHead className="w-24 text-right font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {paginatedTransactions && paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((item) => (
                  <AdminTransactionTableRow
                    key={item.id}
                    item={item}
                    copiedId={copiedId}
                    onCopyInvoice={handleCopyInvoice}
                    onOpenVerify={(tx) => setVerifyingTx(tx)}
                    onOpenDetail={(tx) => setSelectedDetail(tx)}
                  />
                ))
              ) : (
                <TableEmptyRow
                  colSpan={8}
                  isFiltered={Boolean(debouncedSearch || statusFilter !== "ALL" || channelFilter !== "ALL")}
                />
              )}
            </TableBody>
          </Table>
        </div>

        {filtered.length > 0 && (
          <TablePaginationFooter
            currentPage={currentPage}
            totalPages={totalPages}
            total={filtered.length}
            limit={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        )}
      </TableContainer>

      {/* Detail Modal */}
      <AdminTransactionDetailModal
        isOpen={Boolean(selectedDetail)}
        onClose={() => setSelectedDetail(null)}
        transaction={selectedDetail}
        onOpenVerify={(tx) => setVerifyingTx(tx)}
      />

      {/* Verify Confirmation Dialog */}
      <AdminTransactionVerifyDialog
        isOpen={Boolean(verifyingTx)}
        onClose={() => setVerifyingTx(null)}
        onConfirm={handleConfirmVerify}
        transaction={verifyingTx}
        isLoading={isVerifying}
      />
    </div>
  );
}
