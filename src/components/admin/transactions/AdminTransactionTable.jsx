"use client";

import { useState, useMemo } from "react";
import { Search, RefreshCw, Copy, Check } from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
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
import { useDebounce } from "@/hooks/useDebounce";
import { sanitizeSearchQuery, maskEmail } from "@/lib/security";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { USER_ROLES } from "@/services/authService";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/use-toast";
import { copyToClipboard } from "@/lib/clipboard";

const PAGE_SIZE = 10;

export function AdminTransactionTable({ initialTransactions = [] }) {
  const { currentUser } = useCurrentUser();
  const isSuperAdmin = currentUser?.role === USER_ROLES.SUPER_ADMIN;

  const [transactions, setTransactions] = useState(initialTransactions);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [channelFilter, setChannelFilter] = useState("ALL");
  const [copiedId, setCopiedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

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
    try {
      const res = await safeFetch("/api/admin/transactions");
      const data = await res.json();
      if (data.success && data.data) {
        setTransactions(data.data);
        toast.success("Data transaksi berhasil diperbarui.");
      }
    } catch {
      // silent
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2.5 max-w-2xl">
          <div className="flex-1 min-w-[220px]">
            <Input
              leftIcon={Search}
              placeholder="Cari nomor invoice, nama donatur..."
              value={search}
              onChange={handleSearchChange}
              onClear={handleClearSearch}
              className="h-10 text-sm bg-white"
            />
          </div>

          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="h-10 w-44 text-sm bg-white shrink-0">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectItem value="ALL">Semua Status</SelectItem>
              <SelectItem value="PAID">Berhasil (PAID)</SelectItem>
              <SelectItem value="PENDING">Menunggu (PENDING)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={channelFilter} onValueChange={handleChannelChange}>
            <SelectTrigger className="h-10 w-44 text-sm bg-white shrink-0">
              <SelectValue placeholder="Semua Metode" />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectItem value="ALL">Semua Metode</SelectItem>
              <SelectItem value="QRIS">QRIS</SelectItem>
              <SelectItem value="BCA_VA">BCA VA</SelectItem>
              <SelectItem value="BRI_VA">BRI VA</SelectItem>
              <SelectItem value="BNI_VA">BNI VA</SelectItem>
              <SelectItem value="MANDIRI_VA">Mandiri VA</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={refreshList}
          className="h-10 px-3.5 rounded-lg text-sm font-medium text-slate-700 border-slate-300 bg-white hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
          <span>Segarkan</span>
        </Button>
      </div>

      {/* Table Container */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-200/90">
              <TableRow>
                <TableHead className="w-[170px] font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">Invoice</TableHead>
                <TableHead className="w-px font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">Donatur</TableHead>
                <TableHead className="w-full font-medium text-slate-600 text-sm py-2.5 min-w-[220px]">Program Tujuan</TableHead>
                <TableHead className="w-px font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">Nominal</TableHead>
                <TableHead className="w-px text-center font-medium text-slate-600 text-sm py-1.5 leading-tight whitespace-nowrap">
                  Metode<br />Pembayaran
                </TableHead>
                <TableHead className="w-px font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">Tanggal</TableHead>
                <TableHead className="w-px text-center font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {paginatedTransactions && paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/70 transition-colors">
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

                    <TableCell className="w-px space-y-0.5 py-3 whitespace-nowrap align-middle">
                      <span className="font-medium text-sm text-slate-900 block leading-tight">
                        {item.donorName}
                      </span>
                      {item.donorEmail && (
                        <span className="text-sm text-slate-500 block truncate">
                          {maskEmail(item.donorEmail)}
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-sm text-slate-700 py-3 align-middle">
                      <span className="line-clamp-2 leading-snug font-normal text-slate-800 block">{item.campaignTitle}</span>
                    </TableCell>

                    <TableCell className="w-px font-semibold text-sm text-slate-900 py-3 whitespace-nowrap align-middle">
                      {formatRupiah(item.amount)}
                    </TableCell>

                    <TableCell className="w-px text-center py-3 whitespace-nowrap uppercase align-middle">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 border border-slate-200 text-slate-700 max-w-[110px] truncate whitespace-nowrap">
                        {item.paymentChannel}
                      </span>
                    </TableCell>

                    <TableCell className="w-px text-sm text-slate-500 py-3 whitespace-nowrap align-middle">
                      {formatDate(item.createdAt)}
                    </TableCell>

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
                  </TableRow>
                ))
              ) : (
                <TableEmptyRow colSpan={7} message="Tidak ada mutasi transaksi yang sesuai filter." />
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
    </div>
  );
}
