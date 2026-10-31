"use client";

import { useState, useMemo } from "react";
import { Trash2, Loader2 } from "lucide-react";
import {
  Table,
  TableContainer,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableEmptyRow,
  TablePaginationFooter,
  usePagination,
} from "@/components/ui/Table";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { TableSelectionBar } from "@/components/ui/TableSelectionBar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { AdminFaqModal } from "@/components/admin/faqs/AdminFaqModal";
import { AdminFaqDeleteDialog } from "@/components/admin/faqs/AdminFaqDeleteDialog";
import { AdminFaqToolbar } from "@/components/admin/faqs/AdminFaqToolbar";
import { AdminFaqTableRow } from "@/components/admin/faqs/AdminFaqTableRow";
import { useTableSelection } from "@/hooks/useTableSelection";
import { useDebounce } from "@/hooks/useDebounce";
import { sanitizeSearchQuery } from "@/lib/security";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/useToast";

const PAGE_SIZE = 10;

export function AdminFaqTable({ initialFaqs = [] }) {
  const [faqs, setFaqs] = useState(initialFaqs);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [deletingFaq, setDeletingFaq] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const debouncedSearch = useDebounce(search.trim(), 300);

  const availableCategories = useMemo(() => {
    return Array.from(new Set(faqs.map((f) => f.category).filter(Boolean)));
  }, [faqs]);

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      if (categoryFilter !== "ALL" && faq.category !== categoryFilter) return false;
      if (!debouncedSearch) return true;
      const q = debouncedSearch.toLowerCase();
      return (
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q) ||
        (faq.category && faq.category.toLowerCase().includes(q))
      );
    });
  }, [faqs, categoryFilter, debouncedSearch]);

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems: paginatedFaqs,
    resetPage,
  } = usePagination(filteredFaqs, { pageSize: PAGE_SIZE });

  const selection = useTableSelection(paginatedFaqs);

  const handleSearchChange = (e) => {
    setSearch(sanitizeSearchQuery(e.target.value));
    selection.clearSelection();
    resetPage();
  };

  const handleCategoryChange = (val) => {
    setCategoryFilter(val);
    selection.clearSelection();
    resetPage();
  };

  const handleOpenAdd = () => {
    setSelectedFaq(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (faq) => {
    setSelectedFaq(faq);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (faq) => {
    setDeletingFaq(faq);
  };

  const handleConfirmDelete = async () => {
    if (!deletingFaq?.id) return;
    setIsDeleting(true);
    try {
      const res = await safeFetch(`/api/admin/faqs/${deletingFaq.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Pertanyaan FAQ berhasil dihapus.");
        setFaqs((prev) => prev.filter((f) => f.id !== deletingFaq.id));
        setDeletingFaq(null);
      } else {
        toast.error(data.message || "Gagal menghapus FAQ.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat menghapus FAQ.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (selection.selectedCount === 0) return;
    setIsBulkDeleting(true);
    try {
      const res = await safeFetch("/api/admin/faqs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selection.selectedIds }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || `${selection.selectedCount} FAQ berhasil dihapus.`);
        const selectedSet = selection.selectedKeys;
        setFaqs((prev) => prev.filter((f) => !selectedSet.has(f.id)));
        selection.clearSelection();
        setIsBulkDeleteOpen(false);
      } else {
        toast.error(data.message || "Gagal menghapus FAQ terpilih.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat menghapus FAQ.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const refreshList = async () => {
    setIsLoading(true);
    try {
      const res = await safeFetch("/api/admin/faqs");
      const data = await res.json();
      if (data.success && data.data) {
        setFaqs(data.data);
        selection.clearSelection();
        toast.success("Data FAQ berhasil diperbarui.");
      } else {
        toast.error(data.message || "Gagal menyegarkan data FAQ.");
      }
    } catch {
      toast.error("Gagal menyegarkan data FAQ.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Action Bar */}
      <AdminFaqToolbar
        search={search}
        onSearchChange={handleSearchChange}
        categoryFilter={categoryFilter}
        onCategoryChange={handleCategoryChange}
        categories={availableCategories}
        isLoading={isLoading}
        onRefresh={refreshList}
        onOpenAdd={handleOpenAdd}
      />

      {/* Reusable Bulk Action Bar */}
      <TableSelectionBar
        selectedCount={selection.selectedCount}
        totalCount={paginatedFaqs.length}
        label="FAQ"
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
          <span>Hapus {selection.selectedCount} FAQ terpilih</span>
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
                    aria-label="Pilih semua FAQ di halaman ini"
                  />
                </TableHead>
                <TableHead className="py-2.5 px-4 font-medium text-slate-600 text-sm min-w-[280px]">
                  Pertanyaan &amp; Jawaban
                </TableHead>
                <TableHead className="w-36 py-2.5 px-4 text-center font-medium text-slate-600 text-sm whitespace-nowrap">
                  Topik
                </TableHead>
                <TableHead className="w-36 py-2.5 px-4 text-center font-medium text-slate-600 text-sm whitespace-nowrap">
                  Pembaruan
                </TableHead>
                <TableHead className="w-24 text-right py-2.5 px-4 font-medium text-slate-600 text-sm whitespace-nowrap">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {paginatedFaqs && paginatedFaqs.length > 0 ? (
                paginatedFaqs.map((faq, index) => (
                  <AdminFaqTableRow
                    key={faq.id || index}
                    faq={faq}
                    isSelected={selection.isSelected(faq.id)}
                    onToggleSelect={selection.toggleSelect}
                    onEdit={handleOpenEdit}
                    onDelete={handleOpenDelete}
                  />
                ))
              ) : (
                <TableEmptyRow
                  colSpan={5}
                  isFiltered={Boolean(search)}
                />
              )}
            </TableBody>
          </Table>
        </div>

        {filteredFaqs.length > 0 && (
          <TablePaginationFooter
            currentPage={currentPage}
            totalPages={totalPages}
            total={filteredFaqs.length}
            limit={PAGE_SIZE}
            onPageChange={(page) => {
              selection.clearSelection();
              setCurrentPage(page);
            }}
          />
        )}
      </TableContainer>

      <AdminFaqModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        faqToEdit={selectedFaq}
        categories={availableCategories}
        onSuccess={refreshList}
      />

      <AdminFaqDeleteDialog
        isOpen={Boolean(deletingFaq)}
        onClose={() => setDeletingFaq(null)}
        onConfirm={handleConfirmDelete}
        faq={deletingFaq}
        isLoading={isDeleting}
      />

      <ConfirmDialog
        isOpen={isBulkDeleteOpen}
        onOpenChange={setIsBulkDeleteOpen}
        onConfirm={handleConfirmBulkDelete}
        isLoading={isBulkDeleting}
        title={`Hapus ${selection.selectedCount} FAQ`}
        description={`Apakah Anda yakin ingin menghapus ${selection.selectedCount} pertanyaan FAQ terpilih? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.`}
        confirmText="Hapus FAQ"
        variant="destructive"
      />
    </div>
  );
}
