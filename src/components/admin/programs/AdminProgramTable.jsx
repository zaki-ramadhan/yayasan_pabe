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
  usePagination,
} from "@/components/ui/Table";
import dynamic from "next/dynamic";

const AdminProgramModal = dynamic(
  () =>
    import("./AdminProgramModal").then(
      (m) => m.AdminProgramModal
    ),
  { ssr: false }
);
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AdminProgramToolbar } from "./AdminProgramToolbar";
import { AdminProgramTableRow } from "./AdminProgramTableRow";
import { TableSelectionBar } from "@/components/ui/TableSelectionBar";
import { Checkbox } from "@/components/ui/Checkbox";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useTableSelection } from "@/hooks/useTableSelection";
import { useDebounce } from "@/hooks/useDebounce";
import { sanitizeSearchQuery } from "@/lib/security";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/useToast";

export function AdminProgramTable({
  initialCampaigns = [],
  categories = [],
  initialEditId,
  initialError = null,
}) {
  const [error, setError] = useState(initialError);
  const initialEditCampaign = useMemo(() => {
    if (!initialEditId) return null;
    return (
      initialCampaigns.find(
        (c) => String(c.id) === String(initialEditId) || c.slug === initialEditId
      ) || null
    );
  }, [initialEditId, initialCampaigns]);

  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(Boolean(initialEditCampaign));
  const [editingCampaign, setEditingCampaign] = useState(initialEditCampaign);
  const [isLoading, setIsLoading] = useState(false);
  const PAGE_SIZE = 10;

  const debouncedSearch = useDebounce(search.trim(), 300);

  const filterCategoryOptions = useMemo(() => {
    return [
      { value: "ALL", label: "Semua Kategori" },
      ...(categories || []).map((cat) => ({
        value: cat.id || cat.name,
        label: cat.name || cat.label,
      })),
    ];
  }, [categories]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((item) => {
      if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
      if (categoryFilter !== "ALL") {
        const matchesId = item.categoryId === categoryFilter;
        const matchesName = item.category?.toLowerCase() === categoryFilter.toLowerCase();
        if (!matchesId && !matchesName) return false;
      }
      if (debouncedSearch && !item.title.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
      return true;
    });
  }, [campaigns, statusFilter, categoryFilter, debouncedSearch]);

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems: paginatedCampaigns,
    resetPage,
  } = usePagination(filteredCampaigns, { pageSize: PAGE_SIZE });

  const selection = useTableSelection(paginatedCampaigns);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

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

  const handleStatusChange = (val) => {
    setStatusFilter(val);
    selection.clearSelection();
    resetPage();
  };

  const handleCategoryChange = (val) => {
    setCategoryFilter(val);
    selection.clearSelection();
    resetPage();
  };

  const refreshList = async () => {
    setIsLoading(true);
    try {
      const res = await safeFetch("/api/admin/programs?limit=100");
      const data = await res.json();
      if (data.success && data.data) {
        setCampaigns(data.data);
        setError(null);
        selection.clearSelection();
        toast.success("Data program donasi berhasil diperbarui.");
      } else {
        const errMsg = data.message || data.error || "Gagal menyegarkan data program.";
        setError(errMsg);
        toast.error(errMsg);
      }
    } catch {
      setError("Gagal menghubungi server database.");
      toast.error("Gagal menyegarkan data program.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingCampaign(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (campaign) => {
    setEditingCampaign(campaign);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (id, newStatus) => {
    try {
      const res = await safeFetch(`/api/admin/programs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Status program berhasil diubah ke ${newStatus}.`);
        setCampaigns((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
        );
      } else {
        toast.error(data.message || "Gagal mengubah status program.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat memperbarui status.");
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (selection.selectedCount === 0) return;
    setIsBulkDeleting(true);
    try {
      const res = await safeFetch("/api/admin/programs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selection.selectedIds }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || `${selection.selectedCount} program berhasil dihapus.`);
        const selectedSet = selection.selectedKeys;
        setCampaigns((prev) => prev.filter((c) => !selectedSet.has(c.id)));
        selection.clearSelection();
        setIsBulkDeleteOpen(false);
      } else {
        toast.error(data.message || "Gagal menghapus program terpilih.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat menghapus program.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Bar & Add Action */}
      <AdminProgramToolbar
        search={search}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        categoryFilter={categoryFilter}
        onCategoryChange={handleCategoryChange}
        filterCategoryOptions={filterCategoryOptions}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        onRefresh={refreshList}
        onOpenAdd={handleOpenAdd}
        isLoading={isLoading}
      />

      {error && (
        <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 flex items-center justify-between gap-3 text-sm">
          <span>{error}</span>
          <Button size="sm" variant="outline" onClick={refreshList} disabled={isLoading}>
            Coba muat ulang
          </Button>
        </div>
      )}

      {/* Reusable Floating Bulk Action Bar */}
      <TableSelectionBar
        selectedCount={selection.selectedCount}
        totalCount={paginatedCampaigns.length}
        label="program"
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
          <span>Hapus {selection.selectedCount} program terpilih</span>
        </Button>
      </TableSelectionBar>

      {/* Table Container */}
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
                    aria-label="Pilih semua program di halaman ini"
                  />
                </TableHead>
                <TableHead className="min-w-[240px] font-medium text-slate-600 text-sm py-2.5">Program Donasi</TableHead>
                <TableHead className="w-32 text-center font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">Kategori</TableHead>
                <TableHead className="w-56 min-w-[220px] text-center font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">Capaian &amp; Target</TableHead>
                <TableHead className="w-36 text-center font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">Donatur &amp; Waktu</TableHead>
                <TableHead className="w-44 font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">Penyaluran Dana</TableHead>
                <TableHead className="w-24 text-center font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">Status</TableHead>
                <TableHead className="w-14 text-right font-medium text-slate-600 text-sm py-2.5">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {paginatedCampaigns && paginatedCampaigns.length > 0 ? (
                paginatedCampaigns.map((item) => (
                  <AdminProgramTableRow
                    key={item.id}
                    item={item}
                    isSelected={selection.isSelected(item.id)}
                    onToggleSelect={selection.toggleSelect}
                    onEdit={handleOpenEdit}
                    onToggleStatus={handleToggleStatus}
                  />
                ))
              ) : (
                <TableEmptyRow
                  colSpan={8}
                  isFiltered={Boolean(debouncedSearch || statusFilter !== "ALL" || categoryFilter !== "ALL")}
                />
              )}
            </TableBody>
          </Table>
        </div>

        {filteredCampaigns.length > 0 && (
          <TablePaginationFooter
            currentPage={currentPage}
            totalPages={totalPages}
            total={filteredCampaigns.length}
            limit={PAGE_SIZE}
            onPageChange={(page) => {
              selection.clearSelection();
              setCurrentPage(page);
            }}
          />
        )}
      </TableContainer>

      {/* Program Modal (Add/Edit) */}
      <AdminProgramModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        campaignToEdit={editingCampaign}
        categories={categories}
        onSuccess={refreshList}
      />

      {/* Bulk Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        onConfirm={handleConfirmBulkDelete}
        isLoading={isBulkDeleting}
        title={`Hapus ${selection.selectedCount} Program Donasi`}
        description={`Apakah Anda yakin ingin menghapus ${selection.selectedCount} program terpilih? Program hanya dapat dihapus jika belum memiliki riwayat transaksi donasi masuk demi integritas audit keuangan.`}
        confirmLabel="Hapus sekarang"
        confirmVariant="destructive"
      />
    </div>
  );
}
