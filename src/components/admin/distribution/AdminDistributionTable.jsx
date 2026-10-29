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
import dynamic from "next/dynamic";

const AdminDistributionModal = dynamic(
  () =>
    import("./AdminDistributionModal").then(
      (m) => m.AdminDistributionModal
    ),
  { ssr: false }
);
import { AdminDistributionDeleteDialog } from "./AdminDistributionDeleteDialog";
import { AdminDistributionToolbar } from "./AdminDistributionToolbar";
import { AdminDistributionTableRow } from "./AdminDistributionTableRow";
import { useTableSelection } from "@/hooks/useTableSelection";
import { useDebounce } from "@/hooks/useDebounce";
import { sanitizeSearchQuery } from "@/lib/security";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/useToast";

export function AdminDistributionTable({
  initialDistributions = [],
  campaigns = [],
}) {
  const [distributions, setDistributions] = useState(initialDistributions);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDistribution, setSelectedDistribution] = useState(null);
  const [deletingDistribution, setDeletingDistribution] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const PAGE_SIZE = 10;

  const debouncedSearch = useDebounce(search.trim(), 300);

  const filtered = useMemo(() => {
    return distributions.filter((item) => {
      if (!debouncedSearch) return true;
      const term = debouncedSearch.toLowerCase();
      return (
        item.title.toLowerCase().includes(term) ||
        (item.campaignTitle && item.campaignTitle.toLowerCase().includes(term))
      );
    });
  }, [distributions, debouncedSearch]);

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems: paginatedDistributions,
    resetPage,
  } = usePagination(filtered, { pageSize: PAGE_SIZE });

  const selection = useTableSelection(paginatedDistributions);

  const handleSearchChange = (e) => {
    setSearch(sanitizeSearchQuery(e.target.value));
    resetPage();
  };

  const handleClearSearch = () => {
    setSearch("");
    resetPage();
  };

  const refreshList = async () => {
    setIsLoading(true);
    try {
      const res = await safeFetch("/api/admin/distributions?limit=100");
      const data = await res.json();
      if (data.success && data.data) {
        setDistributions(data.data);
        selection.clearSelection();
        toast.success("Data rekam penyaluran berhasil diperbarui.");
      } else {
        toast.error(data.message || "Gagal menyegarkan data penyaluran.");
      }
    } catch {
      toast.error("Gagal menyegarkan data penyaluran.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setSelectedDistribution(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setSelectedDistribution(item);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (item) => {
    setDeletingDistribution(item);
  };

  const handleConfirmDelete = async () => {
    if (!deletingDistribution?.id) return;
    setIsDeleting(true);
    try {
      const res = await safeFetch(`/api/admin/distributions/${deletingDistribution.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Rekam penyaluran berhasil dihapus.");
        setDistributions((prev) => prev.filter((d) => d.id !== deletingDistribution.id));
        selection.clearSelection();
        setDeletingDistribution(null);
      } else {
        toast.error(data.message || "Gagal menghapus penyaluran.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat menghapus penyaluran.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (selection.selectedCount === 0) return;
    setIsBulkDeleting(true);
    try {
      const res = await safeFetch("/api/admin/distributions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selection.selectedIds }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Rekam penyaluran terpilih berhasil dihapus.");
        setDistributions((prev) => prev.filter((d) => !selection.selectedIds.includes(d.id)));
        selection.clearSelection();
        setIsBulkDeleteDialogOpen(false);
      } else {
        toast.error(data.message || "Gagal menghapus rekam penyaluran terpilih.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat menghapus data terpilih.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Bar: Search & Action Buttons */}
      <AdminDistributionToolbar
        search={search}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        isLoading={isLoading}
        onRefresh={refreshList}
        onOpenAdd={handleOpenAdd}
      />

      {/* Floating Bulk Action Bar */}
      <TableSelectionBar
        selectedCount={selection.selectedCount}
        totalCount={paginatedDistributions.length}
        itemLabel="penyaluran"
        onSelectAll={selection.selectAll}
        isAllSelected={selection.allSelected}
        onClearSelection={selection.clearSelection}
      >
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => setIsBulkDeleteDialogOpen(true)}
          className="h-8 gap-1.5 text-xs font-medium"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Hapus ({selection.selectedCount})
        </Button>
      </TableSelectionBar>

      {/* Table Container */}
      <TableContainer>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-200/90">
              <TableRow>
                <TableHead className="w-12 px-4 py-2.5">
                  <Checkbox
                    checked={selection.allSelected}
                    indeterminate={selection.isIndeterminate}
                    onCheckedChange={selection.toggleSelectAll}
                    aria-label="Pilih semua data penyaluran pada halaman ini"
                  />
                </TableHead>
                <TableHead className="w-72 font-medium text-slate-600 text-sm py-2.5">
                  Program donasi asal
                </TableHead>
                <TableHead className="font-medium text-slate-600 text-sm py-2.5">
                  Judul kegiatan &amp; berita
                </TableHead>
                <TableHead className="w-36 font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Tanggal realisasi
                </TableHead>
                <TableHead className="w-40 text-right font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Dana tersalurkan
                </TableHead>
                <TableHead className="w-24 text-right font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {paginatedDistributions && paginatedDistributions.length > 0 ? (
                paginatedDistributions.map((item) => (
                  <AdminDistributionTableRow
                    key={item.id}
                    item={item}
                    isSelected={selection.isSelected(item.id)}
                    onToggleSelect={() => selection.toggleSelect(item.id)}
                    onEdit={handleOpenEdit}
                    onDelete={handleOpenDelete}
                  />
                ))
              ) : (
                <TableEmptyRow colSpan={6} isFiltered={Boolean(debouncedSearch)} />
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

      <AdminDistributionModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        campaigns={campaigns}
        distributionToEdit={selectedDistribution}
        onSuccess={refreshList}
      />

      <AdminDistributionDeleteDialog
        isOpen={Boolean(deletingDistribution)}
        onClose={() => setDeletingDistribution(null)}
        onConfirm={handleConfirmDelete}
        distribution={deletingDistribution}
        isLoading={isDeleting}
      />

      <ConfirmDialog
        isOpen={isBulkDeleteDialogOpen}
        onClose={() => setIsBulkDeleteDialogOpen(false)}
        onConfirm={handleConfirmBulkDelete}
        isLoading={isBulkDeleting}
        title={`Hapus ${selection.selectedCount} Data Penyaluran`}
        description={`Apakah Anda yakin ingin menghapus ${selection.selectedCount} data rekam penyaluran bantuan terpilih? Berkas foto dokumentasi terkait di penyimpanan R2 juga akan dibersihkan.`}
        confirmLabel="Hapus sekarang"
        confirmVariant="destructive"
      />
    </div>
  );
}
