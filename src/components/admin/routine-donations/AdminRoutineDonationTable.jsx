"use client";

import { useState, useMemo } from "react";
import { Search, RefreshCw, Eye, Download, Calendar, Clock } from "lucide-react";
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
import { AdminRoutineDonationStatusBadge } from "./AdminRoutineDonationStatusBadge";
import { AdminRoutineDonationDetailDialog } from "./AdminRoutineDonationDetailDialog";
import { useDebounce } from "@/hooks/useDebounce";
import { sanitizeSearchQuery, maskEmail } from "@/lib/security";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "sonner";

const PAGE_SIZE = 10;

export function AdminRoutineDonationTable({ initialRoutineDonations = [] }) {
  const [items, setItems] = useState(initialRoutineDonations);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [frequencyFilter, setFrequencyFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearch = useDebounce(search.trim(), 300);

  const filtered = useMemo(() => {
    return items.filter((r) => {
      if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
      if (frequencyFilter !== "ALL" && r.frequency !== frequencyFilter) return false;
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const matchName = (r.donorName || "").toLowerCase().includes(q);
        const matchEmail = (r.donorEmail || "").toLowerCase().includes(q);
        const matchTitle = (r.programTitle || "").toLowerCase().includes(q);
        const matchPhone = (r.donorPhone || "").toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchTitle && !matchPhone) return false;
      }
      return true;
    });
  }, [items, statusFilter, frequencyFilter, debouncedSearch]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginatedItems = useMemo(() => {
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

  const refreshList = async () => {
    setIsLoading(true);
    try {
      const res = await safeFetch("/api/admin/routine-donations");
      const data = await res.json();
      if (data.success && data.data) {
        setItems(data.data);
        toast.success("Data komitmen donasi rutin berhasil diperbarui.");
      }
    } catch {
      toast.error("Gagal menyegarkan data donasi rutin.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    setIsUpdatingStatus(true);
    try {
      const res = await safeFetch("/api/admin/routine-donations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();

      if (data.success) {
        setItems((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
        if (selectedItem && selectedItem.id === id) {
          setSelectedItem((prev) => ({ ...prev, status: newStatus }));
        }
        toast.success(`Status komitmen berhasil diubah menjadi ${newStatus}.`);
      } else {
        toast.error(data.message || "Gagal memperbarui status komitmen.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat memperbarui status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const exportCsv = () => {
    if (items.length === 0) {
      toast.error("Tidak ada data untuk diekspor.");
      return;
    }

    const headers = [
      "ID",
      "Nama Donatur",
      "Email",
      "Nomor HP",
      "Program Donasi",
      "Nominal Komitmen",
      "Frekuensi",
      "Tipe Rutin",
      "Status",
      "Tanggal Dibuat",
    ];

    const rows = items.map((r) => [
      `"${r.id}"`,
      `"${r.donorName.replace(/"/g, '""')}"`,
      `"${(r.donorEmail || "").replace(/"/g, '""')}"`,
      `"${(r.donorPhone || "").replace(/"/g, '""')}"`,
      `"${(r.programTitle || "").replace(/"/g, '""')}"`,
      r.amount,
      `"${r.frequency}"`,
      `"${r.routineType}"`,
      `"${r.status}"`,
      `"${r.createdAt}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `donasi-rutin-gsm-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Buku komitmen donasi rutin berhasil diunduh (CSV).");
  };

  const getFrequencyText = (item) => {
    if (item.frequency === "DAILY") return "Setiap hari";
    if (item.frequency === "WEEKLY") return `Setiap ${item.selectedDay || "pekan"}`;
    if (item.frequency === "MONTHLY") return "Setiap bulan";
    return item.frequency;
  };

  return (
    <div className="space-y-4">
      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Left Filters */}
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              placeholder="Cari donatur atau program..."
              value={search}
              onChange={handleSearchChange}
              onClear={handleClearSearch}
              className="pl-9 h-10 text-sm font-normal bg-white"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}>
            <SelectTrigger className="w-36 h-10 text-sm font-normal bg-white shrink-0">
              <SelectValue placeholder="Semua status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-sm font-normal">
                Semua status
              </SelectItem>
              <SelectItem value="ACTIVE" className="text-sm font-normal">
                Aktif
              </SelectItem>
              <SelectItem value="PAUSED" className="text-sm font-normal">
                Dijeda
              </SelectItem>
              <SelectItem value="CANCELLED" className="text-sm font-normal">
                Dibatalkan
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Frequency Filter */}
          <Select value={frequencyFilter} onValueChange={(val) => { setFrequencyFilter(val); setCurrentPage(1); }}>
            <SelectTrigger className="w-36 h-10 text-sm font-normal bg-white shrink-0">
              <SelectValue placeholder="Semua frekuensi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-sm font-normal">
                Semua frekuensi
              </SelectItem>
              <SelectItem value="DAILY" className="text-sm font-normal">
                Harian
              </SelectItem>
              <SelectItem value="WEEKLY" className="text-sm font-normal">
                Mingguan
              </SelectItem>
              <SelectItem value="MONTHLY" className="text-sm font-normal">
                Bulanan
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={refreshList}
            disabled={isLoading}
            className="h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${isLoading ? "animate-spin" : ""}`} />
            <span>Segarkan</span>
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-lg border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-200/90">
              <TableRow>
                <TableHead className="w-60 font-medium text-slate-600 text-sm py-2.5">
                  Donatur &amp; kontak
                </TableHead>
                <TableHead className="font-medium text-slate-600 text-sm py-2.5 min-w-[200px]">
                  Program kebaikan
                </TableHead>
                <TableHead className="w-36 font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Komitmen nominal
                </TableHead>
                <TableHead className="w-40 font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Frekuensi &amp; jadwal
                </TableHead>
                <TableHead className="w-36 font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Tipe komitmen
                </TableHead>
                <TableHead className="w-28 text-center font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Status
                </TableHead>
                <TableHead className="w-24 text-right font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {paginatedItems && paginatedItems.length > 0 ? (
                paginatedItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Donatur & Kontak */}
                    <TableCell className="w-60 space-y-0.5 py-3 align-middle">
                      <span className="font-medium text-sm text-slate-900 block leading-tight">
                        {item.donorName}
                      </span>
                      <div className="flex flex-col text-xs text-slate-500 font-normal">
                        {item.donorEmail && <span>{maskEmail(item.donorEmail)}</span>}
                        {item.donorPhone && <span>{item.donorPhone}</span>}
                      </div>
                    </TableCell>

                    {/* Program Kebaikan */}
                    <TableCell className="text-sm text-slate-800 py-3 align-middle">
                      <span className="font-medium block leading-snug">
                        {item.programTitle}
                      </span>
                      <span className="text-xs text-slate-500 font-normal block mt-0.5">
                        Didaftarkan {formatDate(item.createdAt)}
                      </span>
                    </TableCell>

                    {/* Komitmen Nominal */}
                    <TableCell className="w-36 text-sm font-medium text-slate-900 py-3 align-middle whitespace-nowrap">
                      {formatRupiah(item.amount)}
                    </TableCell>

                    {/* Frekuensi & Jadwal */}
                    <TableCell className="w-40 text-sm text-slate-700 py-3 align-middle whitespace-nowrap">
                      <div className="space-y-0.5">
                        <span className="font-normal block leading-tight">
                          {getFrequencyText(item)}
                        </span>
                        <span className="text-xs text-slate-500 font-normal block">
                          Pukul {item.reminderTime} WIB
                        </span>
                      </div>
                    </TableCell>

                    {/* Tipe Komitmen */}
                    <TableCell className="w-36 text-xs text-slate-600 py-3 align-middle whitespace-nowrap font-normal">
                      {item.routineType === "AUTO_DONATION" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                          Auto debet
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200/60">
                          Pengingat
                        </span>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="w-28 text-center py-3 align-middle whitespace-nowrap">
                      <AdminRoutineDonationStatusBadge status={item.status} />
                    </TableCell>

                    {/* Aksi */}
                    <TableCell className="w-24 text-right py-3 align-middle whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedItem(item)}
                        title="Lihat rincian komitmen donasi rutin"
                        className="inline-flex items-center justify-center p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableEmptyRow
                  colSpan={7}
                  message="Belum ada data komitmen donasi rutin yang terdaftar."
                />
              )}
            </TableBody>
          </Table>
        </div>

        <TablePaginationFooter
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {/* Detail Dialog */}
      <AdminRoutineDonationDetailDialog
        donation={selectedItem}
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        onStatusChange={handleUpdateStatus}
        isUpdating={isUpdatingStatus}
      />
    </div>
  );
}
