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

const AdminArticleModal = dynamic(
  () =>
    import("@/components/admin/articles/AdminArticleModal").then(
      (m) => m.AdminArticleModal
    ),
  { ssr: false }
);
import { AdminArticleToolbar } from "@/components/admin/articles/AdminArticleToolbar";
import { AdminArticleTableRow } from "@/components/admin/articles/AdminArticleTableRow";
import { useTableSelection } from "@/hooks/useTableSelection";
import { useDebounce } from "@/hooks/useDebounce";
import { sanitizeSearchQuery } from "@/lib/security";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/useToast";

const PAGE_SIZE = 10;

export function AdminArticleTable({
  initialArticles = [],
  categories = [],
  initialEditId,
}) {
  const initialEditArticle = useMemo(() => {
    if (!initialEditId) return null;
    return (
      initialArticles.find(
        (a) => String(a.id) === String(initialEditId) || a.slug === initialEditId
      ) || null
    );
  }, [initialEditId, initialArticles]);

  const [articles, setArticles] = useState(initialArticles);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(Boolean(initialEditArticle));
  const [selectedArticle, setSelectedArticle] = useState(initialEditArticle);
  const [isLoading, setIsLoading] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const debouncedSearch = useDebounce(search.trim(), 300);

  const filterCategoryOptions = useMemo(() => {
    const rawCategories = categories.filter((c) => c !== "Semua Kategori" && c !== "ALL");
    return [
      { value: "ALL", label: "Semua Kategori" },
      ...rawCategories.map((cat) => ({ value: cat, label: cat })),
    ];
  }, [categories]);

  const filteredArticles = useMemo(() => {
    return articles.filter((item) => {
      const query = debouncedSearch.toLowerCase();
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.author.toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === "ALL" ||
        item.category.toLowerCase() === categoryFilter.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [articles, debouncedSearch, categoryFilter]);

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems: paginatedArticles,
    resetPage,
  } = usePagination(filteredArticles, { pageSize: PAGE_SIZE });

  const selection = useTableSelection(paginatedArticles);

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

  const handleCategoryChange = (val) => {
    setCategoryFilter(val);
    selection.clearSelection();
    resetPage();
  };

  const handleOpenAdd = () => {
    setSelectedArticle(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const handleDelete = (id, title) => {
    setArticleToDelete({ id, title });
  };

  const handleConfirmDelete = async () => {
    if (!articleToDelete) return;
    const { id } = articleToDelete;

    setDeletingId(id);
    try {
      const res = await safeFetch(`/api/admin/articles/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Artikel berhasil dihapus.");
        setArticles((prev) => prev.filter((a) => a.id !== id));
        setArticleToDelete(null);
      } else {
        toast.error(data.message || "Gagal menghapus artikel.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat menghapus artikel.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (selection.selectedCount === 0) return;
    setIsBulkDeleting(true);
    try {
      const res = await safeFetch("/api/admin/articles", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selection.selectedIds }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || `${selection.selectedCount} artikel berhasil dihapus.`);
        const selectedSet = selection.selectedKeys;
        setArticles((prev) => prev.filter((a) => !selectedSet.has(a.id)));
        selection.clearSelection();
        setIsBulkDeleteOpen(false);
      } else {
        toast.error(data.message || "Gagal menghapus artikel terpilih.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat menghapus artikel.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const refreshList = async () => {
    setIsLoading(true);
    try {
      const res = await safeFetch("/api/admin/articles?limit=100");
      const data = await res.json();
      if (data.success && data.data) {
        setArticles(data.data);
        selection.clearSelection();
        toast.success("Data artikel berhasil diperbarui.");
      } else {
        toast.error(data.message || "Gagal menyegarkan data artikel.");
      }
    } catch {
      toast.error("Gagal menyegarkan data artikel.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <AdminArticleToolbar
        search={search}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        categoryFilter={categoryFilter}
        onCategoryChange={handleCategoryChange}
        categoryOptions={filterCategoryOptions}
        isLoading={isLoading}
        onRefresh={refreshList}
        onOpenAdd={handleOpenAdd}
      />

      {/* Reusable Bulk Action Bar */}
      <TableSelectionBar
        selectedCount={selection.selectedCount}
        totalCount={paginatedArticles.length}
        label="artikel"
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
          <span>Hapus {selection.selectedCount} artikel terpilih</span>
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
                  aria-label="Pilih semua artikel di halaman ini"
                />
              </TableHead>
              <TableHead className="w-16">Banner</TableHead>
              <TableHead className="min-w-[280px] sm:min-w-[340px] max-w-lg">Judul Artikel</TableHead>
              <TableHead className="w-36 text-center">Kategori</TableHead>
              <TableHead className="w-40">Penulis</TableHead>
              <TableHead className="w-32 text-center">Tanggal Rilis</TableHead>
              <TableHead className="w-24 text-center">Apresiasi</TableHead>
              <TableHead className="text-right w-28">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedArticles && paginatedArticles.length > 0 ? (
              paginatedArticles.map((article) => (
                <AdminArticleTableRow
                  key={article.id}
                  article={article}
                  isSelected={selection.isSelected(article.id)}
                  onToggleSelect={selection.toggleSelect}
                  onEdit={handleOpenEdit}
                  onDelete={handleDelete}
                  isDeleting={deletingId === article.id}
                />
              ))
            ) : (
              <TableEmptyRow
                colSpan={8}
                isFiltered={Boolean(search || categoryFilter !== "ALL")}
              />
            )}
          </TableBody>
        </Table>

        {filteredArticles.length > 0 && (
          <TablePaginationFooter
            currentPage={currentPage}
            totalPages={totalPages}
            total={filteredArticles.length}
            limit={PAGE_SIZE}
            onPageChange={(page) => {
              selection.clearSelection();
              setCurrentPage(page);
            }}
          />
        )}
      </TableContainer>

      <AdminArticleModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        articleToEdit={selectedArticle}
        categories={categories}
        onSuccess={refreshList}
      />

      <ConfirmDialog
        isOpen={Boolean(articleToDelete)}
        onClose={() => setArticleToDelete(null)}
        onConfirm={handleConfirmDelete}
        isLoading={Boolean(deletingId)}
        title="Hapus Artikel"
        description={`Apakah Anda yakin ingin menghapus artikel "${articleToDelete?.title}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus sekarang"
        confirmVariant="destructive"
      />

      <ConfirmDialog
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        onConfirm={handleConfirmBulkDelete}
        isLoading={isBulkDeleting}
        title={`Hapus ${selection.selectedCount} Artikel`}
        description={`Apakah Anda yakin ingin menghapus ${selection.selectedCount} artikel berita terpilih? Banner dan konten artikel akan dihapus secara permanen.`}
        confirmLabel="Hapus sekarang"
        confirmVariant="destructive"
      />
    </div>
  );
}
