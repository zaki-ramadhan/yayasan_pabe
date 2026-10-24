"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableEmptyRow,
  TablePaginationFooter,
  TableSkeletonRows,
} from "@/components/ui/table";
import { AdminDonorToolbar } from "./AdminDonorToolbar";
import { AdminDonorTableRow } from "./AdminDonorTableRow";
import { AdminDonorDetailDrawer } from "./AdminDonorDetailDrawer";
import { useDebounce } from "@/hooks/useDebounce";
import { sanitizeSearchQuery } from "@/lib/security";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/use-toast";

const PAGE_SIZE = 10;

export function AdminDonorTable({ initialData = {} }) {
  const [donors, setDonors] = useState(initialData.items || []);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearch = useDebounce(search.trim(), 300);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return donors;
    const q = debouncedSearch.toLowerCase();
    return donors.filter((d) => {
      const matchName = (d.name || "").toLowerCase().includes(q);
      const matchEmail = (d.email || "").toLowerCase().includes(q);
      const matchPhone = (d.phone || "").toLowerCase().includes(q);
      return matchName || matchEmail || matchPhone;
    });
  }, [donors, debouncedSearch]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginatedDonors = useMemo(() => {
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

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await safeFetch("/api/admin/donors?limit=100");
      const data = await res.json();
      if (data.success) {
        setDonors(data.data || []);
        toast.success("Daftar donatur berhasil diperbarui.");
      } else {
        toast.error(data.message || "Gagal menyinkronkan data.");
      }
    } catch {
      toast.error("Gagal menghubungi server.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleExportCsv = () => {
    if (filtered.length === 0) {
      toast.error("Tidak ada data donatur untuk diekspor.");
      return;
    }

    const headers = [
      "Nama Donatur",
      "Email",
      "No Telepon",
      "Total Donasi (Rp)",
      "Frekuensi Donasi",
      "Donasi Terakhir",
    ];

    const rows = filtered.map((d) => [
      `"${(d.name || "").replace(/"/g, '""')}"`,
      `"${(d.email || "").replace(/"/g, '""')}"`,
      `"${(d.phone || "").replace(/"/g, '""')}"`,
      d.totalPaidAmount || 0,
      d.paidCount || 0,
      `"${d.lastDonatedAt || ""}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `daftar_donatur_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Berkas CSV daftar donatur berhasil diunduh.");
  };

  return (
    <div className="space-y-4">
      <AdminDonorToolbar
        search={search}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        onExportCsv={handleExportCsv}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />

      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[260px]">Donatur</TableHead>
              <TableHead className="w-44">No. Telepon</TableHead>
              <TableHead className="w-px whitespace-nowrap">Total Donasi</TableHead>
              <TableHead className="w-px whitespace-nowrap text-center">Frekuensi</TableHead>
              <TableHead className="w-px whitespace-nowrap">Terakhir Donasi</TableHead>
              <TableHead className="w-20 text-right pr-4">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeletonRows rows={5} columns={6} />
            ) : paginatedDonors.length === 0 ? (
              <TableEmptyRow
                colSpan={6}
                message={
                  search
                    ? "Tidak ada data donatur yang sesuai dengan kata kunci pencarian."
                    : "Belum ada riwayat donatur tercatat di sistem."
                }
              />
            ) : (
              paginatedDonors.map((donor) => (
                <AdminDonorTableRow
                  key={donor.id}
                  donor={donor}
                  onOpenDetail={(d) => setSelectedDonor(d)}
                />
              ))
            )}
          </TableBody>
        </Table>

        <TablePaginationFooter
          currentPage={currentPage}
          totalPages={totalPages}
          total={filtered.length}
          limit={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </TableContainer>

      <AdminDonorDetailDrawer
        isOpen={Boolean(selectedDonor)}
        onOpenChange={(open) => !open && setSelectedDonor(null)}
        donor={selectedDonor}
      />
    </div>
  );
}
