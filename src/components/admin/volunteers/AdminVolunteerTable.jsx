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
import { AdminVolunteerDetailDialog } from "./AdminVolunteerDetailDialog";
import { AdminVolunteerToolbar } from "./AdminVolunteerToolbar";
import { AdminVolunteerTableRow } from "./AdminVolunteerTableRow";
import { VolunteerPrintDialog } from "@/components/volunteer/VolunteerPrintDialog";
import { useDebounce } from "@/hooks/useDebounce";
import { sanitizeSearchQuery } from "@/lib/security";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/use-toast";

const PAGE_SIZE = 10;

export function AdminVolunteerTable({ initialVolunteers = [] }) {
  const [volunteers, setVolunteers] = useState(initialVolunteers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [cardVolunteer, setCardVolunteer] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearch = useDebounce(search.trim(), 300);

  const filtered = useMemo(() => {
    return volunteers.filter((v) => {
      if (statusFilter !== "ALL" && v.status !== statusFilter) return false;
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const matchName = (v.fullName || "").toLowerCase().includes(q);
        const matchEmail = (v.email || "").toLowerCase().includes(q);
        const matchCity = (v.city || "").toLowerCase().includes(q);
        const matchInterest = (v.interest || "").toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchCity && !matchInterest) return false;
      }
      return true;
    });
  }, [volunteers, statusFilter, debouncedSearch]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginatedVolunteers = useMemo(() => {
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

  const handleStatusFilterChange = (val) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const refreshList = async () => {
    setIsLoading(true);
    try {
      const res = await safeFetch("/api/admin/volunteers?limit=100");
      const data = await res.json();
      if (data.success && data.data) {
        setVolunteers(data.data);
        toast.success("Data pendaftar relawan berhasil diperbarui.");
      } else {
        toast.error(data.message || "Gagal menyegarkan data relawan.");
      }
    } catch {
      toast.error("Gagal menyegarkan data relawan.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    setIsUpdatingStatus(true);
    try {
      const res = await safeFetch("/api/admin/volunteers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Status relawan berhasil diperbarui.");
        setVolunteers((prev) =>
          prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v))
        );
        if (selectedVolunteer && selectedVolunteer.id === id) {
          setSelectedVolunteer((prev) => ({ ...prev, status: newStatus }));
        }
      } else {
        toast.error(data.message || "Gagal mengubah status relawan.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat memperbarui status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Hapus berkas pendaftaran relawan atas nama "${name}"?`)) return;

    try {
      const res = await safeFetch(`/api/admin/volunteers?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Data relawan berhasil dihapus.");
        setVolunteers((prev) => prev.filter((v) => v.id !== id));
        if (selectedVolunteer?.id === id) {
          setSelectedVolunteer(null);
        }
      } else {
        toast.error(data.message || "Gagal menghapus data relawan.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat menghapus data.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Actions Bar */}
      <AdminVolunteerToolbar
        search={search}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        isLoading={isLoading}
        onRefresh={refreshList}
      />

      {/* Main Table */}
      <TableContainer>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-200/90">
              <TableRow>
                <TableHead className="w-64 font-medium text-slate-600 text-sm py-2.5">
                  Nama &amp; kontak
                </TableHead>
                <TableHead className="w-36 font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Domisili
                </TableHead>
                <TableHead className="font-medium text-slate-600 text-sm py-2.5 min-w-[200px]">
                  Bidang minat
                </TableHead>
                <TableHead className="w-36 font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Tanggal daftar
                </TableHead>
                <TableHead className="w-32 text-center font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Status
                </TableHead>
                <TableHead className="w-24 text-right font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {paginatedVolunteers && paginatedVolunteers.length > 0 ? (
                paginatedVolunteers.map((item) => (
                  <AdminVolunteerTableRow
                    key={item.id}
                    item={item}
                    onViewDetail={setSelectedVolunteer}
                    onPrintCard={setCardVolunteer}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <TableEmptyRow
                  colSpan={6}
                  message="Belum ada pendaftar relawan yang sesuai dengan kriteria filter."
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
      <AdminVolunteerDetailDialog
        isOpen={Boolean(selectedVolunteer)}
        onClose={() => setSelectedVolunteer(null)}
        volunteer={selectedVolunteer}
        onStatusChange={handleUpdateStatus}
        onPrintCard={(v) => {
          setSelectedVolunteer(null);
          setCardVolunteer(v);
        }}
        isUpdating={isUpdatingStatus}
      />

      {/* Print KTA / ID Card Dialog */}
      <VolunteerPrintDialog
        isOpen={Boolean(cardVolunteer)}
        onClose={() => setCardVolunteer(null)}
        volunteer={cardVolunteer}
      />
    </div>
  );
}
