"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CreatableCombobox } from "@/components/ui/creatable-combobox";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/use-toast";

const DEFAULT_ARTICLE_CATEGORIES = [
  "Berita",
  "Penyaluran",
  "Sosial",
  "Edukasi",
  "Ziswaf",
  "Inspirasi",
];

export function AdminArticleModal({
  isOpen,
  onOpenChange,
  articleToEdit = null,
  categories = [],
  onSuccess,
}) {
  const isEditing = Boolean(articleToEdit);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Berita");
  const [customCategories, setCustomCategories] = useState([]);
  const [author, setAuthor] = useState("Redaksi Yayasan PABE");
  const [bannerUrl, setBannerUrl] = useState("/img/hero_card_1.jpeg");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryList = useMemo(() => {
    const fromProps = (categories || []).filter((c) => c !== "Semua Kategori" && c !== "ALL");
    return Array.from(new Set([...DEFAULT_ARTICLE_CATEGORIES, ...fromProps, ...customCategories]));
  }, [categories, customCategories]);

  const handleCreateCategory = (newCat) => {
    const trimmed = newCat.trim();
    if (trimmed) {
      setCustomCategories((prev) => Array.from(new Set([...prev, trimmed])));
      setCategory(trimmed);
      toast.success(`Kategori "${trimmed}" siap digunakan.`);
      return trimmed;
    }
  };

  useEffect(() => {
    if (articleToEdit) {
      setTitle(articleToEdit.title || "");
      setCategory(articleToEdit.category || "Berita");
      setAuthor(articleToEdit.author || "Redaksi Yayasan PABE");
      setBannerUrl(articleToEdit.bannerUrl || "/img/hero_card_1.jpeg");
      setExcerpt(articleToEdit.excerpt || "");
      setContent(articleToEdit.content || "");
    } else {
      setTitle("");
      setCategory("Berita");
      setAuthor("Redaksi Yayasan PABE");
      setBannerUrl("/img/hero_card_1.jpeg");
      setExcerpt("");
      setContent("");
    }
  }, [articleToEdit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Judul artikel wajib diisi.");
      return;
    }
    if (!content.trim()) {
      toast.error("Isi konten artikel wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = isEditing
        ? `/api/admin/articles/${articleToEdit.id}`
        : "/api/admin/articles";
      const method = isEditing ? "PUT" : "POST";

      const res = await safeFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          author,
          bannerUrl,
          excerpt: excerpt.trim() || content.slice(0, 150),
          content,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(isEditing ? "Artikel berhasil diperbarui." : "Artikel baru berhasil diterbitkan.");
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(data.message || "Gagal menyimpan artikel.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat menyimpan artikel.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-5 sm:p-6">
        <DialogHeader className="pb-3 border-b border-slate-200">
          <DialogTitle className="text-base sm:text-lg font-semibold text-slate-950">
            {isEditing ? "Sunting Artikel Berita" : "Tulis Artikel & Berita Baru"}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Kelola publikasi kabar kegiatan yayasan, artikel edukasi ziswaf, dan transparansi kegiatan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Judul Artikel */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-800">
              Judul Artikel <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Contoh: Distribusi 500 Paket Sembako untuk Lansia Dhuafa"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="h-10 text-sm bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Kategori */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-800">
                Kategori Berita <span className="text-rose-500">*</span>
              </label>
              <CreatableCombobox
                options={categoryList}
                value={category}
                onChange={(val) => setCategory(val)}
                onCreate={handleCreateCategory}
                placeholder="Pilih kategori berita..."
                searchPlaceholder="Cari kategori atau buat baru..."
                createPrefix="Buat kategori"
                className="bg-white"
              />
            </div>

            {/* Penulis / Redaksi */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-800">
                Nama Penulis / Redaksi
              </label>
              <Input
                type="text"
                placeholder="Contoh: Tim Humas PABE"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="h-10 text-sm bg-white"
              />
            </div>
          </div>

          {/* Banner URL */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-800">
              URL Gambar Utama / Banner
            </label>
            <Input
              type="text"
              placeholder="/img/hero_card_1.jpeg"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              className="h-10 text-sm bg-white"
            />
          </div>

          {/* Ringkasan Singkat (Excerpt) */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-800">
              Ringkasan Singkat (Lead / Excerpt)
            </label>
            <Textarea
              rows={2}
              placeholder="Ringkasan 1-2 kalimat pengantar artikel untuk kartu dan preview..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full text-sm leading-relaxed bg-white"
            />
          </div>

          {/* Isi Konten Lengkap */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-800">
              Isi Konten Berita Lengkap <span className="text-rose-500">*</span>
            </label>
            <Textarea
              rows={6}
              placeholder="Tuliskan berita lengkap mengenai kegiatan, narasumber, kronologi, serta ucapan terima kasih kepada donatur..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="w-full text-sm leading-relaxed bg-white"
            />
          </div>

          {/* Action Buttons */}
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
              {isSubmitting ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Terbitkan Artikel"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
