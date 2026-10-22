"use client";

import { useState, useMemo } from "react";
import { Search, RefreshCw, Eye, Trash2, Phone, MapPin, Mail } from "lucide-react";
import { formatDate } from "@/lib/formatters";
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
import { AdminVolunteerStatusBadge } from "./AdminVolunteerStatusBadge";
import { AdminVolunteerDetailDialog } from "./AdminVolunteerDetailDialog";
import { useDebounce } from "@/hooks/useDebounce";
import { sanitizeSearchQuery, maskEmail } from "@/lib/security";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "sonner";

const PAGE_SIZE = 10;

export function AdminVolunteerTable({ initialVolunteers = [] }) {
  const [volunteers, setVolunteers] = useState(initialVolunteers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
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
      const res = await safeFetch("/api/admin/volunteers");
      const data = await res.json();
      if (data.success && data.data) {
        setVolunteers(data.data);
        toast.success("Data pendaftar relawan berhasil diperbarui.");
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex flex-1 flex-wrap items-center gap-2 max-w-xl">
          <div className="flex-1 min-w-[200px]">
            <Input
              leftIcon={Search}
              placeholder="Cari nama, kota, email, atau bidang minat..."
              value={search}
              onChange={handleSearchChange}
              onClear={handleClearSearch}
              className="h-10 text-sm font-normal bg-white border-slate-300"
            />
          </div>

          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="h-10 w-40 text-sm font-normal bg-white border border-slate-300 shrink-0">
              <SelectValue placeholder="Semua status" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-slate-200 z-50">
              <SelectItem value="ALL" className="cursor-pointer text-sm font-normal py-2">
                Semua status
              </SelectItem>
              <SelectItem value="PENDING" className="cursor-pointer text-sm font-normal py-2">
                Menunggu (PENDING)
              </SelectItem>
              <SelectItem value="CONTACTED" className="cursor-pointer text-sm font-normal py-2">
                Sudah dihubungi
              </SelectItem>
              <SelectItem value="APPROVED" className="cursor-pointer text-sm font-normal py-2">
                Disetujui
              </SelectItem>
              <SelectItem value="REJECTED" className="cursor-pointer text-sm font-normal py-2">
                Ditolak
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Right Actions: Refresh */}
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
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-lg border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
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
                  <TableRow key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Nama & Kontak */}
                    <TableCell className="w-64 space-y-0.5 py-3 align-middle">
                      <span className="font-medium text-sm text-slate-900 block leading-tight">
                        {item.fullName}
                      </span>
                      <div className="flex flex-col text-xs text-slate-500 font-normal">
                        {item.email && <span>{maskEmail(item.email)}</span>}
                        {item.phone && <span>{item.phone}</span>}
                      </div>
                    </TableCell>

                    {/* Domisili */}
                    <TableCell className="w-36 text-sm text-slate-700 py-3 align-middle whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-normal">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.city}</span>
                      </span>
                    </TableCell>

                    {/* Bidang Minat */}
                    <TableCell className="text-sm text-slate-800 py-3 align-middle">
                      <span className="font-medium block leading-snug">
                        {item.interest}
                      </span>
                      {item.motivation && (
                        <p className="text-xs text-slate-500 line-clamp-1 font-normal mt-0.5">
                          {item.motivation}
                        </p>
                      )}
                    </TableCell>

                    {/* Tanggal Daftar */}
                    <TableCell className="w-36 text-sm text-slate-500 py-3 whitespace-nowrap align-middle">
                      {formatDate(item.createdAt)}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="w-32 text-center py-3 whitespace-nowrap align-middle">
                      <AdminVolunteerStatusBadge status={item.status} />
                    </TableCell>

                    {/* Aksi */}
                    <TableCell className="w-24 text-right py-3 whitespace-nowrap align-middle">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedVolunteer(item)}
                          title="Lihat rincian pendaftar"
                          aria-label={`Lihat rincian: ${item.fullName}`}
                          className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.fullName)}
                          title="Hapus berkas pendaftar"
                          aria-label={`Hapus: ${item.fullName}`}
                          className="p-1.5 rounded-md text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
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
      </div>

      {/* Detail Dialog */}
      <AdminVolunteerDetailDialog
        isOpen={Boolean(selectedVolunteer)}
        onClose={() => setSelectedVolunteer(null)}
        volunteer={selectedVolunteer}
        onStatusChange={handleUpdateStatus}
        isUpdating={isUpdatingStatus}
      />
    </div>
  );
}
