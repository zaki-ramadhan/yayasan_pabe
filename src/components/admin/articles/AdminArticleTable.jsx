"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Plus, Search, Edit3, Trash2, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
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
import { AdminArticleModal } from "@/components/admin/articles/AdminArticleModal";
import { useDebounce } from "@/hooks/useDebounce";
import { sanitizeSearchQuery } from "@/lib/security";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";

export function AdminArticleTable({ initialArticles = [], categories = [] }) {
  const [articles, setArticles] = useState(initialArticles);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8;

  const debouncedSearch = useDebounce(search.trim(), 300);

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
      const res = await safeFetch("/api/admin/articles");
      const data = await res.json();
      if (data.success && data.data) {
        setArticles(data.data);
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2.5 max-w-lg">
          <Input
            leftIcon={Search}
            placeholder="Cari judul berita atau penulis..."
            value={search}
            onChange={handleSearchChange}
            onClear={handleClearSearch}
            className="h-10 text-sm bg-white"
          />

          <Select value={categoryFilter} onValueChange={handleCategoryChange}>
            <SelectTrigger className="h-10 w-44 text-sm bg-white shrink-0">
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectItem value="ALL">Semua Kategori</SelectItem>
              {categories
                .filter((c) => c !== "Semua Kategori" && c !== "ALL")
                .map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            type="button"
            variant="outline"
            onClick={refreshList}
            disabled={isLoading}
            className="h-10 px-3 rounded-lg text-sm font-medium text-slate-700 border-slate-300 bg-white hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${isLoading ? "animate-spin" : ""}`} />
            <span>Segarkan</span>
          </Button>

          <Button
            type="button"
            onClick={handleOpenAdd}
            className="h-10 px-4 rounded-lg text-sm font-semibold bg-primary hover:bg-primary/90 text-white flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tulis Artikel Baru</span>
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-lg border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
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
              paginatedArticles.map((article) => {
                const dateDisplay = article.publishedAt
                  ? new Date(article.publishedAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "-";

                return (
                  <TableRow key={article.id}>
                    <TableCell className="py-2.5">
                      <div className="w-12 h-9 rounded bg-slate-100 overflow-hidden relative border border-slate-200 shrink-0">
                        <Image
                          src={article.bannerUrl || "/img/hero_card_1.jpeg"}
                          alt={article.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    </TableCell>

                    <TableCell className="py-2.5">
                      <div className="space-y-0.5">
                        <span className="text-sm font-semibold text-slate-900 block line-clamp-1">
                          {article.title}
                        </span>
                        <div className="flex items-center gap-1 text-sm text-slate-500">
                          <span>/{article.slug}</span>
                          <Link
                            href={`/artikel/${article.slug}`}
                            target="_blank"
                            title="Buka artikel di tab baru"
                            className="text-slate-400 hover:text-primary transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                          </Link>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-2.5 text-center">
                      <span
                        className="inline-block text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200/80 max-w-[140px] truncate whitespace-nowrap align-middle"
                        title={article.category}
                      >
                        {article.category}
                      </span>
                    </TableCell>

                    <TableCell className="text-sm text-slate-600 py-2.5">
                      {article.author}
                    </TableCell>

                    <TableCell className="text-sm text-slate-600 py-2.5 whitespace-nowrap">
                      {dateDisplay}
                    </TableCell>

                    <TableCell className="text-sm text-slate-700 py-2.5 text-center whitespace-nowrap font-medium">
                      {article.likeCount} Suka
                    </TableCell>

                    <TableCell className="text-right py-2.5 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(article)}
                          title="Sunting artikel"
                          className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={deletingId === article.id}
                          onClick={() => handleDelete(article.id, article.title)}
                          title="Hapus artikel"
                          className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
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
      </div>

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
