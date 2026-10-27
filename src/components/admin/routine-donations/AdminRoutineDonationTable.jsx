"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableEmptyRow,
  TablePaginationFooter,
} from "@/components/ui/table";
import { AdminRoutineDonationDetailDialog } from "./AdminRoutineDonationDetailDialog";
import { AdminRoutineDonationToolbar } from "./AdminRoutineDonationToolbar";
import { AdminRoutineDonationTableRow } from "./AdminRoutineDonationTableRow";
import { useDebounce } from "@/hooks/useDebounce";
import { sanitizeSearchQuery } from "@/lib/security";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/use-toast";

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

  const refreshList = async (options = {}) => {
    const isSilent = Boolean(typeof options === "object" && options?.silent);
    setIsLoading(true);
    try {
      const res = await safeFetch("/api/admin/routine-donations?limit=100");
      const data = await res.json();
      if (data.success && data.data) {
        setItems(data.data);
        if (!isSilent) {
          toast.success("Data komitmen donasi rutin berhasil disegarkan.");
        }
      } else if (!isSilent) {
        toast.error(data.message || "Gagal menyegarkan data donasi rutin.");
      }
    } catch {
      if (!isSilent) {
        toast.error("Gagal menyegarkan data donasi rutin.");
      }
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

  return (
    <div className="space-y-4">
      {/* Filter and Action Bar */}
      <AdminRoutineDonationToolbar
        search={search}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
        frequencyFilter={frequencyFilter}
        onFrequencyFilterChange={(val) => { setFrequencyFilter(val); setCurrentPage(1); }}
        onRefresh={refreshList}
        onExportCsv={exportCsv}
        isLoading={isLoading}
      />

      {/* Main Table */}
      <TableContainer>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-200/90">
              <TableRow>
                <TableHead className="w-60 font-medium text-slate-600 text-sm py-2.5">
                  Donatur &amp; kontak
                </TableHead>
                <TableHead className="font-medium text-slate-600 text-sm py-2.5 min-w-[280px] max-w-[360px]">
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
                  <AdminRoutineDonationTableRow
                    key={item.id}
                    item={item}
                    onViewDetail={(r) => setSelectedItem(r)}
                  />
                ))
              ) : (
                <TableEmptyRow
                  colSpan={7}
                  isFiltered={Boolean(debouncedSearch || statusFilter !== "ALL" || frequencyFilter !== "ALL")}
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
