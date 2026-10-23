"use client";

import { useState, useMemo } from "react";
import { Search, RefreshCw, Copy, Check, Download, Eye, ShieldCheck } from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/formatters";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmptyRow,
  TablePaginationFooter,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AdminTransactionDetailModal } from "@/components/admin/transactions/AdminTransactionDetailModal";
import { AdminTransactionVerifyDialog } from "@/components/admin/transactions/AdminTransactionVerifyDialog";
import { useDebounce } from "@/hooks/useDebounce";
import { sanitizeSearchQuery, maskEmail } from "@/lib/security";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/use-toast";
import { copyToClipboard } from "@/lib/clipboard";

const PAGE_SIZE = 10;

export function AdminTransactionTable({ initialTransactions = [] }) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [channelFilter, setChannelFilter] = useState("ALL");
  const [copiedId, setCopiedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [verifyingTx, setVerifyingTx] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearch = useDebounce(search.trim(), 300);

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

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const handleSearchChange = (e) => {
    setSearch(sanitizeSearchQuery(e.target.value));
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearch("");
    setCurrentPage(1);
  };

  const handleStatusChange = (val) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handleChannelChange = (val) => {
    setChannelFilter(val);
    setCurrentPage(1);
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

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rekap-mutasi-transaksi-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Laporan mutasi berhasil diunduh.");
  };

  return (
    <div className="space-y-4">
      {/* Filter and Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex flex-1 flex-wrap items-center gap-2 max-w-2xl">
          <div className="flex-1 min-w-[200px]">
            <Input
              leftIcon={Search}
              placeholder="Cari nomor invoice, nama donatur..."
              value={search}
              onChange={handleSearchChange}
              onClear={handleClearSearch}
              className="h-10 text-sm font-normal bg-white border-slate-300"
            />
          </div>

          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="h-10 w-40 text-sm font-normal bg-white border border-slate-300 shrink-0">
              <SelectValue placeholder="Semua status" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-slate-200 z-50">
              <SelectItem value="ALL" className="cursor-pointer text-sm font-normal py-2">
                Semua status
              </SelectItem>
              <SelectItem value="PAID" className="cursor-pointer text-sm font-normal py-2">
                Berhasil (PAID)
              </SelectItem>
              <SelectItem value="PENDING" className="cursor-pointer text-sm font-normal py-2">
                Menunggu (PENDING)
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={channelFilter} onValueChange={handleChannelChange}>
            <SelectTrigger className="h-10 w-40 text-sm font-normal bg-white border border-slate-300 shrink-0">
              <SelectValue placeholder="Semua metode" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-slate-200 z-50">
              <SelectItem value="ALL" className="cursor-pointer text-sm font-normal py-2">
                Semua metode
              </SelectItem>
              <SelectItem value="QRIS" className="cursor-pointer text-sm font-normal py-2">
                QRIS
              </SelectItem>
              <SelectItem value="BCA_VA" className="cursor-pointer text-sm font-normal py-2">
                BCA VA
              </SelectItem>
              <SelectItem value="BRI_VA" className="cursor-pointer text-sm font-normal py-2">
                BRI VA
              </SelectItem>
              <SelectItem value="BNI_VA" className="cursor-pointer text-sm font-normal py-2">
                BNI VA
              </SelectItem>
              <SelectItem value="MANDIRI_VA" className="cursor-pointer text-sm font-normal py-2">
                Mandiri VA
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Right Actions: Export + Refresh */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportCsv}
            className="h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            title="Ekspor data ke format CSV"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Ekspor CSV</span>
          </button>

          <button
            type="button"
            onClick={refreshList}
            disabled={isLoading}
            className="h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-lg border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
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
                <TableHead className="w-px font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Nominal
                </TableHead>
                <TableHead className="w-px text-center font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Metode
                </TableHead>
                <TableHead className="w-px font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
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
                  <TableRow key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Invoice */}
                    <TableCell className="w-[170px] text-sm py-3 align-middle">
                      <div className="flex items-center gap-1.5 w-full min-w-0 max-w-[160px]">
                        <span
                          className="font-medium text-slate-900 truncate block select-all"
                          title={item.invoiceId}
                        >
                          {item.invoiceId}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyInvoice(item.invoiceId)}
                          title="Salin nomor invoice"
                          aria-label={`Salin invoice ${item.invoiceId}`}
                          className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                        >
                          {copiedId === item.invoiceId ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </TableCell>

                    {/* Donatur */}
                    <TableCell className="w-px py-3 whitespace-nowrap align-middle">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="w-8 h-8 rounded-full border border-slate-200 shrink-0 bg-slate-100">
                          {item.donorAvatar && <AvatarImage src={item.donorAvatar} alt={item.donorName} />}
                          <AvatarFallback className="bg-slate-100 text-slate-700 text-xs font-medium">
                            {item.isAnonymous ? "HA" : (item.donorName || "D").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 space-y-0.5">
                          <span className="font-medium text-sm text-slate-900 block leading-tight truncate">
                            {item.donorName}
                          </span>
                          {item.donorEmail && (
                            <span className="text-sm text-slate-500 block truncate font-normal">
                              {maskEmail(item.donorEmail)}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Program */}
                    <TableCell className="text-sm text-slate-700 py-3 align-middle">
                      <span className="line-clamp-2 leading-snug font-normal text-slate-800 block">
                        {item.campaignTitle}
                      </span>
                    </TableCell>

                    {/* Nominal */}
                    <TableCell className="w-px font-medium text-sm text-slate-900 py-3 whitespace-nowrap align-middle">
                      {formatRupiah(item.amount)}
                    </TableCell>

                    {/* Metode */}
                    <TableCell className="w-px text-center py-3 whitespace-nowrap uppercase align-middle">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 border border-slate-200 text-slate-700 max-w-[110px] truncate whitespace-nowrap">
                        {item.paymentChannel}
                      </span>
                    </TableCell>

                    {/* Tanggal */}
                    <TableCell className="w-px text-sm text-slate-500 py-3 whitespace-nowrap align-middle">
                      {formatDate(item.createdAt)}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="w-px text-center py-3 whitespace-nowrap align-middle">
                      {item.status === "PAID" ? (
                        <span className="inline-flex items-center justify-center text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 max-w-[100px] truncate whitespace-nowrap">
                          Berhasil
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center text-xs font-medium text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200 max-w-[100px] truncate whitespace-nowrap">
                          Menunggu
                        </span>
                      )}
                    </TableCell>

                    {/* Aksi: Verifikasi + Rincian */}
                    <TableCell className="w-24 text-right py-3 whitespace-nowrap align-middle">
                      <div className="flex items-center justify-end gap-1">
                        {item.status === "PENDING" && (
                          <button
                            type="button"
                            onClick={() => setVerifyingTx(item)}
                            title="Verifikasi manual donasi"
                            aria-label={`Verifikasi donasi: ${item.invoiceId}`}
                            className="p-1.5 rounded-md text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedDetail(item)}
                          title="Lihat rincian donasi"
                          aria-label={`Lihat rincian: ${item.invoiceId}`}
                          className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableEmptyRow colSpan={8} message="Tidak ada mutasi transaksi yang sesuai filter." />
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
      </div>

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
