"use client";

import { useState, useMemo } from "react";
import { Plus, Search, Edit3, Trash2, RefreshCw } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
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
import { AdminFaqModal } from "@/components/admin/faqs/AdminFaqModal";
import { AdminFaqDeleteDialog } from "@/components/admin/faqs/AdminFaqDeleteDialog";
import { useDebounce } from "@/hooks/useDebounce";
import { sanitizeSearchQuery } from "@/lib/security";
import { formatDate } from "@/lib/formatters";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "sonner";

export function AdminFaqTable({ initialFaqs = [] }) {
  const [faqs, setFaqs] = useState(initialFaqs);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [deletingFaq, setDeletingFaq] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

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

  const totalPages = Math.ceil(filteredFaqs.length / PAGE_SIZE) || 1;
  const paginatedFaqs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredFaqs.slice(start, start + PAGE_SIZE);
  }, [filteredFaqs, currentPage]);

  const handleSearchChange = (e) => {
    setSearch(sanitizeSearchQuery(e.target.value));
    setCurrentPage(1);
  };

  const handleCategoryChange = (val) => {
    setCategoryFilter(val);
    setCurrentPage(1);
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

  const refreshList = async () => {
    setIsLoading(true);
    try {
      const res = await safeFetch("/api/admin/faqs");
      const data = await res.json();
      if (data.success && data.data) {
        setFaqs(data.data);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Cari pertanyaan atau jawaban FAQ..."
              className="w-full h-10 pl-9 pr-3 bg-white border border-slate-300 rounded-lg text-sm font-normal text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Simple Clean Category Dropdown */}
          <Select value={categoryFilter} onValueChange={handleCategoryChange}>
            <SelectTrigger className="h-10 w-40 text-sm font-normal bg-white border border-slate-300 rounded-lg shrink-0">
              <SelectValue placeholder="Semua topik" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-slate-200 z-50">
              <SelectItem value="ALL" className="cursor-pointer text-sm font-normal py-2">
                Semua topik
              </SelectItem>
              {availableCategories.map((cat) => (
                <SelectItem key={cat} value={cat} className="cursor-pointer text-sm font-normal py-2">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Right Actions: Segarkan + FAQ Baru */}
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

          <button
            type="button"
            onClick={handleOpenAdd}
            className="h-10 px-3 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>FAQ baru</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-lg border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-200/90">
              <TableRow>
                <TableHead className="py-2.5 px-4 font-medium text-slate-600 text-sm min-w-[280px]">
                  Pertanyaan &amp; Jawaban
                </TableHead>
                <TableHead className="w-36 py-2.5 px-4 font-medium text-slate-600 text-sm whitespace-nowrap">
                  Topik
                </TableHead>
                <TableHead className="w-36 py-2.5 px-4 font-medium text-slate-600 text-sm whitespace-nowrap">
                  Pembaruan
                </TableHead>
                <TableHead className="w-24 text-right py-2.5 px-4 font-medium text-slate-600 text-sm whitespace-nowrap">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {paginatedFaqs && paginatedFaqs.length > 0 ? (
                paginatedFaqs.map((faq, index) => {
                  return (
                    <TableRow key={faq.id || index} className="hover:bg-slate-50/70 transition-colors">
                      {/* Question & Answer snippet */}
                      <TableCell className="py-3 px-4 align-middle">
                        <div className="space-y-0.5">
                          <span className="text-sm font-medium text-slate-900 block leading-snug">
                            {faq.question}
                          </span>
                          <p className="text-xs text-slate-500 line-clamp-1 font-normal leading-normal">
                            {faq.answer}
                          </p>
                        </div>
                      </TableCell>

                      {/* Category Tag */}
                      <TableCell className="w-36 py-3 px-4 whitespace-nowrap align-middle">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/90 whitespace-nowrap">
                          {faq.category || "Umum"}
                        </span>
                      </TableCell>

                      {/* Updated Date */}
                      <TableCell className="w-36 py-3 px-4 whitespace-nowrap align-middle">
                        <span className="text-sm font-normal text-slate-600 tabular-nums block">
                          {formatDate(faq.updatedAt || faq.createdAt)}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="w-24 py-3 px-4 text-right whitespace-nowrap align-middle">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(faq)}
                            title="Sunting FAQ"
                            aria-label={`Sunting FAQ: ${faq.question}`}
                            className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(faq)}
                            title="Hapus FAQ"
                            aria-label={`Hapus FAQ: ${faq.question}`}
                            className="p-1.5 rounded-md text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableEmptyRow
                  colSpan={4}
                  message={
                    search
                      ? "Tidak ada pertanyaan FAQ yang cocok dengan kata kunci pencarian."
                      : "Belum ada pertanyaan FAQ yang dicatat."
                  }
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
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Modal Edit/Create */}
      <AdminFaqModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        faqToEdit={selectedFaq}
        categories={availableCategories}
        onSuccess={refreshList}
      />

      {/* Modal Confirm Delete */}
      <AdminFaqDeleteDialog
        isOpen={Boolean(deletingFaq)}
        onClose={() => setDeletingFaq(null)}
        onConfirm={handleConfirmDelete}
        faq={deletingFaq}
        isLoading={isDeleting}
      />
    </div>
  );
}
