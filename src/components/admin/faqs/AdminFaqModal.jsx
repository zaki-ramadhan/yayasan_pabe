"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/use-toast";

export function AdminFaqModal({
  isOpen,
  onOpenChange,
  faqToEdit = null,
  onSuccess,
}) {
  const isEditing = Boolean(faqToEdit);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("Umum");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (faqToEdit) {
      setQuestion(faqToEdit.question || "");
      setAnswer(faqToEdit.answer || "");
      setCategory(faqToEdit.category || "Umum");
    } else {
      setQuestion("");
      setAnswer("");
      setCategory("Umum");
    }
  }, [faqToEdit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) {
      toast.error("Pertanyaan wajib diisi.");
      return;
    }
    if (!answer.trim()) {
      toast.error("Jawaban wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = isEditing
        ? `/api/admin/faqs/${faqToEdit.id}`
        : "/api/admin/faqs";
      const method = isEditing ? "PUT" : "POST";

      const res = await safeFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer, category }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(isEditing ? "FAQ berhasil diperbarui." : "FAQ baru berhasil ditambahkan.");
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(data.message || "Gagal menyimpan FAQ.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat menyimpan FAQ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto p-5 sm:p-6">
        <DialogHeader className="pb-3 border-b border-slate-200">
          <DialogTitle className="text-base sm:text-lg font-semibold text-slate-950">
            {isEditing ? "Sunting Tanya Jawab (FAQ)" : "Tambah Tanya Jawab (FAQ) Baru"}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Pertanyaan dan jawaban ini akan ditampilkan pada halaman beranda dan pusat bantuan donatur.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Pertanyaan */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-800">
              Pertanyaan <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Contoh: Bagaimana cara donatur mendapatkan kuitansi resmi?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              className="h-10 text-sm bg-white"
            />
          </div>

          {/* Kategori FAQ */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-800">
              Kategori / Topik
            </label>
            <Input
              type="text"
              placeholder="Contoh: Donasi, Penyaluran, Legalitas, Zakat"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-10 text-sm bg-white"
            />
          </div>

          {/* Jawaban */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-800">
              Jawaban Lengkap <span className="text-rose-500">*</span>
            </label>
            <Textarea
              rows={4}
              placeholder="Tuliskan jawaban yang ramah, informatif, dan jelas bagi calon donatur..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              required
              className="w-full text-sm leading-relaxed bg-white"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="h-10 px-4 text-sm font-medium cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-4 text-sm font-semibold bg-primary hover:bg-primary/90 text-white cursor-pointer"
            >
              {isSubmitting ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Simpan FAQ"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
