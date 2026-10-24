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
import { AdminArticleModal } from "@/components/admin/articles/AdminArticleModal";
import { AdminArticleToolbar } from "@/components/admin/articles/AdminArticleToolbar";
import { AdminArticleTableRow } from "@/components/admin/articles/AdminArticleTableRow";
import { useDebounce } from "@/hooks/useDebounce";
import { sanitizeSearchQuery } from "@/lib/security";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/use-toast";

const PAGE_SIZE = 10;

export function AdminArticleTable({ initialArticles = [], categories = [] }) {
  const [articles, setArticles] = useState(initialArticles);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

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

  const totalPages = Math.ceil(filteredArticles.length / PAGE_SIZE) || 1;
  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredArticles.slice(start, start + PAGE_SIZE);
  }, [filteredArticles, currentPage]);

  const handleSearchChange = (e) => {
    setSearch(sanitizeSearchQuery(e.target.value));
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearch("");
    setCurrentPage(1);
  };

  const handleCategoryChange = (val) => {
    setCategoryFilter(val);
    setCurrentPage(1);
  };

  const handleOpenAdd = () => {
    setSelectedArticle(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Yakin ingin menghapus artikel "${title}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await safeFetch(`/api/admin/articles/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Artikel berhasil dihapus.");
        setArticles((prev) => prev.filter((a) => a.id !== id));
      } else {
        toast.error(data.message || "Gagal menghapus artikel.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat menghapus artikel.");
    } finally {
      setDeletingId(null);
    }
  };

  const refreshList = async () => {
    setIsLoading(true);
    try {
      const res = await safeFetch("/api/admin/articles?limit=100");
      const data = await res.json();
      if (data.success && data.data) {
        setArticles(data.data);
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
      {/* Filter and Action Bar */}
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

      {/* Main Table */}
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Banner</TableHead>
              <TableHead>Judul Artikel</TableHead>
              <TableHead className="w-36 text-center">Kategori</TableHead>
              <TableHead className="w-40">Penulis</TableHead>
              <TableHead className="w-32">Tanggal Rilis</TableHead>
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
                  onEdit={handleOpenEdit}
                  onDelete={handleDelete}
                  isDeleting={deletingId === article.id}
                />
              ))
            ) : (
              <TableEmptyRow
                colSpan={7}
                message={
                  search || categoryFilter !== "ALL"
                    ? "Tidak ada artikel yang sesuai dengan filter pencarian."
                    : "Belum ada artikel berita yang diterbitkan."
                }
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
            onPageChange={setCurrentPage}
          />
        )}
      </TableContainer>

      {/* Modal Dialog */}
      <AdminArticleModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        articleToEdit={selectedArticle}
        categories={categories}
        onSuccess={refreshList}
      />
    </div>
  );
}
