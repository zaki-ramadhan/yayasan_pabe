"use client";

import { useState } from "react";
import { Plus, Search, Edit3, Trash2, HelpCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminFaqModal } from "@/components/admin/faqs/AdminFaqModal";
import { useDebounce } from "@/hooks/useDebounce";
import { sanitizeSearchQuery } from "@/lib/security";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/use-toast";

export function AdminFaqTable({ initialFaqs = [] }) {
  const [faqs, setFaqs] = useState(initialFaqs);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const debouncedSearch = useDebounce(search.trim(), 300);

  const filteredFaqs = faqs.filter((faq) => {
    if (!debouncedSearch) return true;
    const q = debouncedSearch.toLowerCase();
    return (
      faq.question.toLowerCase().includes(q) ||
      faq.answer.toLowerCase().includes(q) ||
      (faq.category && faq.category.toLowerCase().includes(q))
    );
  });

  const handleOpenAdd = () => {
    setSelectedFaq(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (faq) => {
    setSelectedFaq(faq);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, question) => {
    if (!window.confirm(`Yakin ingin menghapus FAQ: "${question}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await safeFetch(`/api/admin/faqs/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("FAQ berhasil dihapus.");
        setFaqs((prev) => prev.filter((f) => f.id !== id));
      } else {
        toast.error(data.message || "Gagal menghapus FAQ.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat menghapus FAQ.");
    } finally {
      setDeletingId(null);
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
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 max-w-md">
          <Input
            leftIcon={Search}
            placeholder="Cari pertanyaan atau jawaban FAQ..."
            value={search}
            onChange={(e) => setSearch(sanitizeSearchQuery(e.target.value))}
            onClear={() => setSearch("")}
            className="h-10 text-sm bg-white"
          />
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
            <span>Tambah FAQ Baru</span>
          </Button>
        </div>
      </div>

      {/* List of FAQ Cards */}
      <div className="space-y-3">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, index) => (
            <div
              key={faq.id || index}
              className="rounded-lg border border-slate-200/90 bg-white p-4 sm:p-5 space-y-2.5 shadow-2xs transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                      {faq.question}
                    </h3>
                    {faq.category && (
                      <span className="inline-block mt-1 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {faq.category}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(faq)}
                    title="Sunting FAQ"
                    className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={deletingId === faq.id}
                    onClick={() => handleDelete(faq.id, faq.question)}
                    title="Hapus FAQ"
                    className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="pl-9.5 text-sm text-slate-700 leading-relaxed border-t border-slate-100 pt-2.5">
                {faq.answer}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-slate-200/90 bg-white p-8 text-center text-sm text-slate-500 shadow-2xs">
            {search
              ? "Tidak ada pertanyaan FAQ yang cocok dengan kata kunci pencarian."
              : "Belum ada pertanyaan FAQ yang dicatat."}
          </div>
        )}
      </div>

      {/* Modal */}
      <AdminFaqModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        faqToEdit={selectedFaq}
        onSuccess={refreshList}
      />
    </div>
  );
}
