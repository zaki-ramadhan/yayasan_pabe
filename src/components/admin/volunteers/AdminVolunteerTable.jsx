"use client";

import { useState, useMemo } from "react";
import { Trash2, CheckCircle2, XCircle, Loader2 } from "lucide-react";
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
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { TableSelectionBar } from "@/components/ui/TableSelectionBar";
import { AdminVolunteerDetailDialog } from "./AdminVolunteerDetailDialog";
import { AdminVolunteerToolbar } from "./AdminVolunteerToolbar";
import { AdminVolunteerTableRow } from "./AdminVolunteerTableRow";
import { VolunteerPrintDialog } from "@/components/volunteer/VolunteerPrintDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useTableSelection } from "@/hooks/useTableSelection";
import { usePagination } from "@/hooks/usePagination";
import { useDebounce } from "@/hooks/useDebounce";
import { sanitizeSearchQuery } from "@/lib/security";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/useToast";

const PAGE_SIZE = 10;

export function AdminVolunteerTable({ initialVolunteers = [] }) {
  const [volunteers, setVolunteers] = useState(initialVolunteers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [cardVolunteer, setCardVolunteer] = useState(null);
  const [volunteerToDelete, setVolunteerToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkStatusUpdating, setIsBulkStatusUpdating] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
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

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems: paginatedVolunteers,
    resetPage,
  } = usePagination(filtered, { pageSize: PAGE_SIZE });

  const selection = useTableSelection(paginatedVolunteers);

  const handleSearchChange = (e) => {
    setSearch(sanitizeSearchQuery(e.target.value));
    selection.clearSelection();
    resetPage();
  };

  const handleClearSearch = () => {
    setSearch("");
    selection.clearSelection();
    resetPage();
  };

  const handleStatusFilterChange = (val) => {
    setStatusFilter(val);
    selection.clearSelection();
    resetPage();
  };

  const refreshList = async () => {
    setIsLoading(true);
    try {
      const res = await safeFetch("/api/admin/volunteers?limit=100");
      const data = await res.json();
      if (data.success && data.data) {
        setVolunteers(data.data);
        selection.clearSelection();
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

  const handleDelete = (id, name) => {
    setVolunteerToDelete({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!volunteerToDelete) return;
    const { id } = volunteerToDelete;

    setIsDeleting(true);
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
        setVolunteerToDelete(null);
      } else {
        toast.error(data.message || "Gagal menghapus data relawan.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat menghapus data.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (selection.selectedCount === 0) return;
    setIsBulkDeleting(true);
    try {
      const res = await safeFetch("/api/admin/volunteers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selection.selectedIds }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || `${selection.selectedCount} relawan berhasil dihapus.`);
        const selectedSet = selection.selectedKeys;
        setVolunteers((prev) => prev.filter((v) => !selectedSet.has(v.id)));
        selection.clearSelection();
        setIsBulkDeleteOpen(false);
      } else {
        toast.error(data.message || "Gagal menghapus relawan terpilih.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat menghapus relawan.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleBulkUpdateStatus = async (newStatus) => {
    if (selection.selectedCount === 0) return;
    setIsBulkStatusUpdating(true);
    try {
      const res = await safeFetch("/api/admin/volunteers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selection.selectedIds, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        const selectedSet = selection.selectedKeys;
        setVolunteers((prev) =>
          prev.map((v) => (selectedSet.has(v.id) ? { ...v, status: newStatus } : v))
        );
        toast.success(
          data.message ||
            `${selection.selectedCount} relawan berhasil diperbarui menjadi ${newStatus}.`
        );
        selection.clearSelection();
      } else {
        toast.error(data.message || "Gagal memperbarui status relawan terpilih.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat memperbarui status.");
    } finally {
      setIsBulkStatusUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      <AdminVolunteerToolbar
        search={search}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        isLoading={isLoading}
        onRefresh={refreshList}
      />

      {/* Reusable Bulk Action Bar */}
      <TableSelectionBar
        selectedCount={selection.selectedCount}
        totalCount={paginatedVolunteers.length}
        label="relawan"
        onSelectAll={selection.selectAll}
        isAllSelected={selection.allSelected}
        onClearSelection={selection.clearSelection}
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isBulkStatusUpdating}
          onClick={() => handleBulkUpdateStatus("APPROVED")}
          className="bg-white border-slate-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 font-medium h-8 text-xs gap-1.5 cursor-pointer disabled:pointer-events-none disabled:opacity-50"
        >
          {isBulkStatusUpdating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          )}
          <span>Setujui</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isBulkStatusUpdating}
          onClick={() => handleBulkUpdateStatus("REJECTED")}
          className="bg-white border-slate-300 text-rose-700 hover:bg-rose-50 hover:border-rose-300 font-medium h-8 text-xs gap-1.5 cursor-pointer disabled:pointer-events-none disabled:opacity-50"
        >
          {isBulkStatusUpdating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
          )}
          <span>Tolak</span>
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => setIsBulkDeleteOpen(true)}
          className="font-medium h-8 text-xs gap-1.5 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Hapus</span>
        </Button>
      </TableSelectionBar>

      <TableContainer>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-200/90">
              <TableRow>
                <TableHead className="w-12 text-center py-2.5 px-3">
                  <Checkbox
                    checked={selection.allSelected}
                    indeterminate={selection.isIndeterminate}
                    onCheckedChange={selection.toggleSelectAll}
                    aria-label="Pilih semua relawan di halaman ini"
                  />
                </TableHead>
                <TableHead className="w-60 min-w-[200px] font-medium text-slate-600 text-sm py-2.5">
                  Relawan
                </TableHead>
                <TableHead className="w-40 text-center font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  No. Telepon
                </TableHead>
                <TableHead className="w-36 font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Domisili
                </TableHead>
                <TableHead className="font-medium text-slate-600 text-sm py-2.5 min-w-[200px]">
                  Bidang minat
                </TableHead>
                <TableHead className="w-36 text-center font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
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
                    isSelected={selection.isSelected(item.id)}
                    onToggleSelect={selection.toggleSelect}
                    onViewDetail={setSelectedVolunteer}
                    onPrintCard={setCardVolunteer}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <TableEmptyRow
                  colSpan={8}
                  isFiltered={Boolean(debouncedSearch || statusFilter !== "ALL")}
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
            onPageChange={(page) => {
              selection.clearSelection();
              setCurrentPage(page);
            }}
          />
        )}
      </TableContainer>

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

      <VolunteerPrintDialog
        isOpen={Boolean(cardVolunteer)}
        onClose={() => setCardVolunteer(null)}
        volunteer={cardVolunteer}
      />

      <ConfirmDialog
        isOpen={Boolean(volunteerToDelete)}
        onClose={() => setVolunteerToDelete(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Hapus Data Relawan"
        description={`Hapus berkas pendaftaran relawan atas nama "${volunteerToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus sekarang"
        confirmVariant="destructive"
      />

      <ConfirmDialog
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        onConfirm={handleConfirmBulkDelete}
        isLoading={isBulkDeleting}
        title={`Hapus ${selection.selectedCount} Data Relawan`}
        description={`Apakah Anda yakin ingin menghapus ${selection.selectedCount} data pendaftar relawan terpilih? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus sekarang"
        confirmVariant="destructive"
      />
    </div>
  );
}
