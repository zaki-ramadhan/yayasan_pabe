"use client";

import { useState, useMemo } from "react";
import { Trash2 } from "lucide-react";
import {
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableEmptyRow,
  TablePaginationFooter,
  usePagination,
} from "@/components/ui/Table";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { TableSelectionBar } from "@/components/ui/TableSelectionBar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { AdminCareerModal } from "@/components/admin/careers/AdminCareerModal";
import { AdminApplicantDrawer } from "@/components/admin/careers/AdminApplicantDrawer";
import { AdminCareerToolbar } from "@/components/admin/careers/AdminCareerToolbar";
import { AdminCareerTableRow } from "@/components/admin/careers/AdminCareerTableRow";
import { useTableSelection } from "@/hooks/useTableSelection";
import { useDebounce } from "@/hooks/useDebounce";
import { sanitizeSearchQuery } from "@/lib/security";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/useToast";

export function AdminCareerTable({ initialVacancies = [] }) {
  const [vacancies, setVacancies] = useState(initialVacancies);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState(null);
  const [drawerVacancy, setDrawerVacancy] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [careerToDelete, setCareerToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const PAGE_SIZE = 10;

  const debouncedSearch = useDebounce(search.trim(), 300);

  const filteredVacancies = useMemo(() => {
    return vacancies.filter((job) => {
      const query = debouncedSearch.toLowerCase();
      if (!query) return true;
      return (
        job.title.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query)
      );
    });
  }, [vacancies, debouncedSearch]);

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems: paginatedVacancies,
    resetPage,
  } = usePagination(filteredVacancies, { pageSize: PAGE_SIZE });

  const selection = useTableSelection(paginatedVacancies);

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

  const handleOpenAdd = () => {
    setSelectedVacancy(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (vacancy) => {
    setSelectedVacancy(vacancy);
    setIsModalOpen(true);
  };

  const handleOpenApplicants = (vacancy) => {
    setDrawerVacancy(vacancy);
    setIsDrawerOpen(true);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = !currentStatus;
    try {
      const res = await safeFetch(`/api/admin/careers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Status lowongan berhasil diubah menjadi ${nextStatus ? "Aktif" : "Nonaktif"}.`);
        setVacancies((prev) =>
          prev.map((v) => (v.id === id ? { ...v, isActive: nextStatus } : v))
        );
      } else {
        toast.error(data.message || "Gagal mengubah status lowongan.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat memperbarui status.");
    }
  };

  const handleDelete = (id, title) => {
    setCareerToDelete({ id, title });
  };

  const handleConfirmDelete = async () => {
    if (!careerToDelete) return;
    const { id } = careerToDelete;

    setDeletingId(id);
    try {
      const res = await safeFetch(`/api/admin/careers/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Lowongan pekerjaan berhasil dihapus.");
        setVacancies((prev) => prev.filter((v) => v.id !== id));
        setCareerToDelete(null);
      } else {
        toast.error(data.message || "Gagal menghapus lowongan.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat menghapus lowongan.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (selection.selectedCount === 0) return;
    setIsBulkDeleting(true);
    try {
      const res = await safeFetch("/api/admin/careers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selection.selectedIds }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || `${selection.selectedCount} lowongan berhasil dihapus.`);
        const selectedSet = selection.selectedKeys;
        setVacancies((prev) => prev.filter((v) => !selectedSet.has(v.id)));
        selection.clearSelection();
        setIsBulkDeleteOpen(false);
      } else {
        toast.error(data.message || "Gagal menghapus lowongan terpilih.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat menghapus lowongan.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const refreshList = async () => {
    setIsLoading(true);
    try {
      const res = await safeFetch("/api/admin/careers?limit=100");
      const data = await res.json();
      if (data.success && data.data) {
        setVacancies(data.data);
        selection.clearSelection();
        toast.success("Data lowongan berhasil diperbarui.");
      } else {
        toast.error(data.message || "Gagal menyegarkan data lowongan.");
      }
    } catch {
      toast.error("Gagal menyegarkan data lowongan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <AdminCareerToolbar
        search={search}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        onRefresh={refreshList}
        onOpenAdd={handleOpenAdd}
        isLoading={isLoading}
      />

      {/* Reusable Bulk Action Bar */}
      <TableSelectionBar
        selectedCount={selection.selectedCount}
        totalCount={paginatedVacancies.length}
        label="lowongan"
        onSelectAll={selection.selectAll}
        isAllSelected={selection.allSelected}
        onClearSelection={selection.clearSelection}
      >
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => setIsBulkDeleteOpen(true)}
          className="font-medium h-8 text-xs gap-1.5 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Hapus {selection.selectedCount} lowongan terpilih</span>
        </Button>
      </TableSelectionBar>

      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center py-2.5 px-3">
                <Checkbox
                  checked={selection.allSelected}
                  indeterminate={selection.isIndeterminate}
                  onCheckedChange={selection.toggleSelectAll}
                  aria-label="Pilih semua lowongan di halaman ini"
                />
              </TableHead>
              <TableHead className="min-w-[260px] w-64">Posisi &amp; Kode</TableHead>
              <TableHead className="min-w-[180px] w-48">Tipe &amp; Sistem</TableHead>
              <TableHead className="min-w-[160px] w-48">Lokasi</TableHead>
              <TableHead className="w-36 text-center">Batas Waktu</TableHead>
              <TableHead className="w-32 text-center">Pelamar</TableHead>
              <TableHead className="w-28 text-center">Status</TableHead>
              <TableHead className="text-right w-24">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedVacancies && paginatedVacancies.length > 0 ? (
              paginatedVacancies.map((job) => (
                <AdminCareerTableRow
                  key={job.id}
                  job={job}
                  isSelected={selection.isSelected(job.id)}
                  onToggleSelect={selection.toggleSelect}
                  onOpenApplicants={handleOpenApplicants}
                  onToggleStatus={handleToggleStatus}
                  onEdit={handleOpenEdit}
                  onDelete={handleDelete}
                  isDeleting={deletingId === job.id}
                />
              ))
            ) : (
              <TableEmptyRow
                colSpan={8}
                isFiltered={Boolean(search || departmentFilter !== "ALL")}
              />
            )}
          </TableBody>
        </Table>

        {filteredVacancies.length > 0 && (
          <TablePaginationFooter
            currentPage={currentPage}
            totalPages={totalPages}
            total={filteredVacancies.length}
            limit={PAGE_SIZE}
            onPageChange={(page) => {
              selection.clearSelection();
              setCurrentPage(page);
            }}
          />
        )}
      </TableContainer>

      <AdminCareerModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        vacancyToEdit={selectedVacancy}
        onSuccess={refreshList}
      />

      <AdminApplicantDrawer
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        vacancy={drawerVacancy}
      />

      <ConfirmDialog
        isOpen={Boolean(careerToDelete)}
        onClose={() => setCareerToDelete(null)}
        onConfirm={handleConfirmDelete}
        isLoading={Boolean(deletingId)}
        title="Hapus Lowongan"
        description={`Apakah Anda yakin ingin menghapus lowongan "${careerToDelete?.title}" beserta seluruh data pelamarnya? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus sekarang"
        confirmVariant="destructive"
      />

      <ConfirmDialog
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        onConfirm={handleConfirmBulkDelete}
        isLoading={isBulkDeleting}
        title={`Hapus ${selection.selectedCount} Lowongan`}
        description={`Apakah Anda yakin ingin menghapus ${selection.selectedCount} lowongan pekerjaan terpilih beserta seluruh data pelamarnya? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus sekarang"
        confirmVariant="destructive"
      />
    </div>
  );
}
