"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableContainer,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableEmptyRow,
  TablePaginationFooter,
} from "@/components/ui/table";
import { AdminFaqModal } from "@/components/admin/faqs/AdminFaqModal";
import { AdminFaqDeleteDialog } from "@/components/admin/faqs/AdminFaqDeleteDialog";
import { AdminFaqToolbar } from "@/components/admin/faqs/AdminFaqToolbar";
import { AdminFaqTableRow } from "@/components/admin/faqs/AdminFaqTableRow";
import { useDebounce } from "@/hooks/useDebounce";
import { sanitizeSearchQuery } from "@/lib/security";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/use-toast";

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
  const [currentPage, setCurrentPage] = useState(1);

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

      {/* Main Table */}
      <TableContainer>
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
                paginatedFaqs.map((faq, index) => (
                  <AdminFaqTableRow
                    key={faq.id || index}
                    faq={faq}
                    onEdit={handleOpenEdit}
                    onDelete={handleOpenDelete}
                  />
                ))
              ) : (
                <TableEmptyRow
                  colSpan={4}
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
            onPageChange={setCurrentPage}
          />
        )}
      </TableContainer>

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
