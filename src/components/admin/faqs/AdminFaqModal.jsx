"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "sonner";

const DEFAULT_FAQ_CATEGORIES = ["Umum", "Donasi", "Penyaluran", "Legalitas", "Zakat"];

export function AdminFaqModal({
  isOpen,
  onOpenChange,
  faqToEdit = null,
  categories = [],
  onSuccess,
}) {
  const isEditing = Boolean(faqToEdit);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("Umum");
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customCategories, setCustomCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryList = useMemo(() => {
    return Array.from(new Set([...DEFAULT_FAQ_CATEGORIES, ...(categories || []), ...customCategories]));
  }, [categories, customCategories]);

  useEffect(() => {
    if (faqToEdit) {
      setQuestion(faqToEdit.question || "");
      setAnswer(faqToEdit.answer || "");
      const cat = faqToEdit.category || "Umum";
      setCategory(cat);
      setIsCustomMode(!DEFAULT_FAQ_CATEGORIES.includes(cat) && !categories.includes(cat));
    } else {
      setQuestion("");
      setAnswer("");
      setCategory("Umum");
      setIsCustomMode(false);
    }
  }, [faqToEdit, isOpen, categories]);

  const handleToggleCustomMode = () => {
    if (isCustomMode) {
      setIsCustomMode(false);
      setCategory(categoryList[0] || "Umum");
    } else {
      setIsCustomMode(true);
      setCategory("");
    }
  };

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

    const finalCategory = category.trim() || "Umum";

    setIsSubmitting(true);
    try {
      const url = isEditing
        ? `/api/admin/faqs/${faqToEdit.id}`
        : "/api/admin/faqs";
      const method = isEditing ? "PUT" : "POST";

      const res = await safeFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim(), answer: answer.trim(), category: finalCategory }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(isEditing ? "FAQ berhasil diperbarui." : "FAQ baru berhasil ditambahkan.");
        if (isCustomMode && finalCategory) {
          setCustomCategories((prev) => Array.from(new Set([...prev, finalCategory])));
        }
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
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto p-5 sm:p-6 bg-white border border-slate-200">
        <DialogHeader className="pb-3 border-b border-slate-200">
          <DialogTitle className="text-base sm:text-lg font-medium text-slate-900">
            {isEditing ? "Sunting tanya jawab (FAQ)" : "Tambah tanya jawab (FAQ) baru"}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 font-normal">
            Pertanyaan dan jawaban ini akan ditampilkan pada halaman beranda dan pusat bantuan donatur.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Pertanyaan */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-800">
              Pertanyaan <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Contoh: Bagaimana cara donatur mendapatkan kuitansi resmi?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              className="h-10 text-sm font-normal bg-white border-slate-300"
            />
          </div>

          {/* Kategori FAQ */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-800">
                Kategori / topik
              </label>
              <button
                type="button"
                onClick={handleToggleCustomMode}
                className="text-xs font-medium text-primary hover:underline cursor-pointer"
              >
                {isCustomMode ? "Pilih dari daftar topik" : "+ Tambah topik baru"}
              </button>
            </div>

            {isCustomMode ? (
              <Input
                type="text"
                placeholder="Tulis nama topik baru (misal: Relawan, Beasiswa)..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-10 text-sm font-normal bg-white border-slate-300"
                autoFocus
              />
            ) : (
              <Select value={category} onValueChange={(val) => setCategory(val)}>
                <SelectTrigger className="h-10 text-sm font-normal bg-white border border-slate-300 rounded-lg w-full">
                  <SelectValue placeholder="Pilih topik FAQ" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-slate-200 z-50">
                  {categoryList.map((cat) => (
                    <SelectItem key={cat} value={cat} className="cursor-pointer text-sm font-normal py-2">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Jawaban */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-800">
              Jawaban lengkap <span className="text-rose-500">*</span>
            </label>
            <Textarea
              rows={4}
              placeholder="Tuliskan jawaban yang ramah, informatif, dan jelas bagi calon donatur..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              required
              className="w-full text-sm font-normal leading-relaxed bg-white border-slate-300"
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
              className="h-10 px-4 text-sm font-medium bg-primary hover:bg-primary/90 text-white cursor-pointer"
            >
              {isSubmitting ? "Menyimpan..." : isEditing ? "Simpan perubahan" : "Simpan FAQ"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
