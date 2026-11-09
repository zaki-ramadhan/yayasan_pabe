"use client";

import { useState, useMemo, useEffect } from "react";
import { formatDate, formatPaymentChannel } from "@/lib/formatters";
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
import { AdminTransactionToolbar } from "@/components/admin/transactions/AdminTransactionToolbar";
import { AdminTransactionTableRow } from "@/components/admin/transactions/AdminTransactionTableRow";
import { AdminTransactionTableSkeletonRows } from "@/components/admin/transactions/AdminTransactionSkeleton";
import { usePagination } from "@/hooks/usePagination";
import { useDebounce } from "@/hooks/useDebounce";
import { sanitizeSearchQuery, maskEmail } from "@/lib/security";
import { downloadCsv } from "@/lib/exportCsv";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/useToast";
import { copyToClipboard } from "@/lib/clipboard";
import { useAdminLiveEvent } from "@/hooks/useAdminLiveFeed";

const PAGE_SIZE = 10;

export function AdminTransactionTable({ initialTransactions = [] }) {
  const [transactions, setTransactions] = useState(
    initialTransactions.filter((t) => t.status === "PAID")
  );
  const [serverResults, setServerResults] = useState(null);
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState("ALL");
  const [copiedId, setCopiedId] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const applyLiveTransactionMutation = (incomingTx) => {
    if (!incomingTx || !incomingTx.invoiceId) return;

    const updateList = (list) => {
      if (!Array.isArray(list)) return list;
      if (incomingTx.status && incomingTx.status !== "PAID") {
        return list.filter(
          (t) => t.id !== incomingTx.id && t.invoiceId !== incomingTx.invoiceId
        );
      }
      const exists = list.some(
        (t) => t.id === incomingTx.id || t.invoiceId === incomingTx.invoiceId
      );
      if (exists) {
        return list.map((t) =>
          t.invoiceId === incomingTx.invoiceId ? { ...t, ...incomingTx, status: "PAID" } : t
        );
      }
      return [{ ...incomingTx, status: "PAID" }, ...list];
    };

    setTransactions((prev) => updateList(prev));
    setServerResults((prev) => (prev ? updateList(prev) : null));
    setSelectedDetail((prev) => {
      if (!prev || prev.invoiceId !== incomingTx.invoiceId) return prev;
      if (incomingTx.status && incomingTx.status !== "PAID") return null;
      return { ...prev, ...incomingTx };
    });
  };

  useAdminLiveEvent("DONATION_PAID", (event) => {
    const newTx = event?.data;
    if (!newTx) return;
    applyLiveTransactionMutation({ ...newTx, status: "PAID" });
  });

  useAdminLiveEvent("DONATION_UPDATED", (event) => {
    const updatedTx = event?.data;
    if (!updatedTx) return;
    applyLiveTransactionMutation(updatedTx);
  });

  const debouncedSearch = useDebounce(search.trim(), 300);
  const isSearching = Boolean(search.trim().length > 0 && search.trim() !== debouncedSearch);

  const hasFilter = Boolean(debouncedSearch || channelFilter !== "ALL");

  useEffect(() => {
    if (!hasFilter) return;

    let cancelled = false;
    const fetchFiltered = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (channelFilter !== "ALL") params.set("paymentChannel", channelFilter);
        params.set("limit", "100");

        const res = await safeFetch(`/api/admin/transactions?${params.toString()}`);
        const json = await res.json();
        if (!cancelled && json.success && Array.isArray(json.data)) {
          setServerResults(json.data);
        }
      } catch {
        // ignore error
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchFiltered();
    return () => {
      cancelled = true;
    };
  }, [hasFilter, debouncedSearch, channelFilter]);

  const activeTransactions = hasFilter && serverResults !== null ? serverResults : transactions;

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
    return activeTransactions.filter((t) => {
      if (t.status && t.status !== "PAID") return false;
      if (
        channelFilter !== "ALL" &&
        String(t.paymentChannel || "").toLowerCase() !== channelFilter.toLowerCase()
      ) {
        return false;
      }
      if (debouncedSearch) {
        const term = debouncedSearch.toLowerCase();
        const matchInv = t.invoiceId.toLowerCase().includes(term);
        const matchName = t.donorName.toLowerCase().includes(term);
        const matchEmail = (t.donorEmail || "").toLowerCase().includes(term);
        if (!matchInv && !matchName && !matchEmail) return false;
      }
      return true;
    });
  }, [activeTransactions, channelFilter, debouncedSearch]);

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

  const handleExportCsv = () => {
    if (filtered.length === 0) {
      toast.error("Tidak ada data transaksi untuk diekspor.");
      return;
    }

    const headers = ["Invoice", "Donatur", "Email", "Nomor HP", "Program", "Nominal", "Metode", "Status", "Tanggal Diterima"];
    const rows = filtered.map((t) => [
      t.invoiceId,
      `"${(t.donorName || "").replace(/"/g, '""')}"`,
      t.donorEmail ? maskEmail(t.donorEmail) : "-",
      t.donorPhone || "-",
      `"${(t.campaignTitle || "").replace(/"/g, '""')}"`,
      t.amount,
      `"${formatPaymentChannel(t.paymentChannel)}"`,
      t.status,
      formatDate(t.paidAt || t.createdAt),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    downloadCsv(`rekap-mutasi-donasi-masuk-${new Date().toISOString().slice(0, 10)}.csv`, csvContent);
    toast.success("Laporan mutasi berhasil diunduh.");
  };

  return (
    <div className="space-y-4">
      <AdminTransactionToolbar
        search={search}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
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
                <TableHead className="min-w-[240px] max-w-[340px] font-medium text-slate-600 text-sm py-2.5">
                  Program donasi
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
              {isLoading ? (
                <AdminTransactionTableSkeletonRows rows={5} />
              ) : paginatedTransactions && paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((item) => (
                  <AdminTransactionTableRow
                    key={item.id}
                    item={item}
                    copiedId={copiedId}
                    onCopyInvoice={handleCopyInvoice}
                    onOpenDetail={(tx) => setSelectedDetail(tx)}
                  />
                ))
              ) : (
                <TableEmptyRow
                  colSpan={8}
                  isFiltered={Boolean(debouncedSearch || channelFilter !== "ALL")}
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
      />
    </div>
  );
}
