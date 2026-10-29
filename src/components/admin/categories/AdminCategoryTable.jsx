"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { Trash2 } from "lucide-react";
import {
  Table,
  TableContainer,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableEmptyRow,
} from "@/components/ui/Table";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { TableSelectionBar } from "@/components/ui/TableSelectionBar";
import { AdminCategoryModal } from "./AdminCategoryModal";
import { AdminCategoryToolbar } from "./AdminCategoryToolbar";
import { AdminCategoryTableRow } from "./AdminCategoryTableRow";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useTableSelection } from "@/hooks/useTableSelection";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "@/hooks/useToast";
import { safeFetch } from "@/lib/safeFetch";

export function AdminCategoryTable({ initialCategories = [] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const selection = useTableSelection(categories);

  const debouncedSearch = useDebounce(search.trim(), 300);
  const isInitialMount = useRef(true);

  const fetchCategories = async (searchTerm = search) => {
    try {
      const res = await safeFetch(`/api/admin/categories?search=${encodeURIComponent(searchTerm)}`);
      const json = await res.json();
      if (json.success && json.data) {
        setCategories(json.data);
      }
    } catch {
      toast.error("Gagal memuat kategori program.");
    }
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    selection.clearSelection();
    startTransition(() => {
      fetchCategories(debouncedSearch);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleRefresh = () => {
    selection.clearSelection();
    startTransition(() => {
      fetchCategories(debouncedSearch);
      toast.success("Daftar kategori berhasil dimuat ulang.");
    });
  };

  const handleOpenCreate = () => {
    setSelectedCategory(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setSelectedCategory(cat);
    setModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const isEdit = Boolean(selectedCategory);
      const url = "/api/admin/categories";
      const method = isEdit ? "PUT" : "POST";

      const res = await safeFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { id: selectedCategory.id, ...formData } : formData),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setModalOpen(false);
        fetchCategories(debouncedSearch);
      } else {
        toast.error(data.message || "Gagal menyimpan kategori.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat menyimpan kategori.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (cat) => {
    setCategoryToDelete(cat);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      setIsDeleting(true);
      const res = await safeFetch(`/api/admin/categories?id=${categoryToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Kategori berhasil dihapus.");
        setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
        setCategoryToDelete(null);
      } else {
        toast.error(data.message || "Gagal menghapus kategori.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat menghapus kategori.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (selection.selectedCount === 0) return;
    setIsBulkDeleting(true);
    try {
      const res = await safeFetch("/api/admin/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selection.selectedIds }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || `${selection.selectedCount} kategori berhasil dihapus.`);
        const selectedSet = selection.selectedKeys;
        setCategories((prev) => prev.filter((c) => !selectedSet.has(c.id)));
        selection.clearSelection();
        setIsBulkDeleteOpen(false);
      } else {
        toast.error(data.message || "Gagal menghapus kategori terpilih.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat menghapus kategori.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <AdminCategoryToolbar
        search={search}
        onSearchChange={(val) => {
          selection.clearSelection();
          setSearch(val);
        }}
        onClearSearch={() => {
          selection.clearSelection();
          setSearch("");
        }}
        onRefresh={handleRefresh}
        onOpenCreate={handleOpenCreate}
        isPending={isPending}
      />

      {/* Reusable Bulk Action Bar */}
      <TableSelectionBar
        selectedCount={selection.selectedCount}
        totalCount={categories.length}
        label="kategori"
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
          <span>Hapus {selection.selectedCount} kategori terpilih</span>
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
                    aria-label="Pilih semua kategori di halaman ini"
                  />
                </TableHead>
                <TableHead className="min-w-[220px] font-medium text-slate-600 text-sm py-2.5">
                  Nama kategori
                </TableHead>
                <TableHead className="min-w-[180px] font-medium text-slate-600 text-sm py-2.5">
                  Pengenal URL (slug)
                </TableHead>
                <TableHead className="w-36 text-center font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Jumlah program
                </TableHead>
                <TableHead className="w-24 text-right font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap pr-4">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {categories.length === 0 ? (
                <TableEmptyRow
                  colSpan={5}
                  isFiltered={Boolean(debouncedSearch)}
                />
              ) : (
                categories.map((item) => (
                  <AdminCategoryTableRow
                    key={item.id}
                    item={item}
                    isSelected={selection.isSelected(item.id)}
                    onToggleSelect={selection.toggleSelect}
                    onEdit={handleOpenEdit}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </TableContainer>

      <AdminCategoryModal
        category={selectedCategory}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog
        isOpen={Boolean(categoryToDelete)}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Hapus Kategori"
        description={`Apakah Anda yakin ingin menghapus kategori "${categoryToDelete?.name}"?`}
        confirmLabel="Hapus sekarang"
        confirmVariant="destructive"
      />

      <ConfirmDialog
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        onConfirm={handleConfirmBulkDelete}
        isLoading={isBulkDeleting}
        title={`Hapus ${selection.selectedCount} Kategori`}
        description={`Apakah Anda yakin ingin menghapus ${selection.selectedCount} kategori terpilih? Kategori yang masih terhubung dengan program kampanye aktif tidak akan dihapus.`}
        confirmLabel="Hapus sekarang"
        confirmVariant="destructive"
      />
    </div>
  );
}
