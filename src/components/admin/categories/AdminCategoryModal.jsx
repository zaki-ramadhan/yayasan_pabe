"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from "react";
import { FolderPlus, Edit3 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AdminCategoryModal({
  category,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}) {
  const isEdit = Boolean(category);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  useEffect(() => {
    if (category) {
      setName(category.name || "");
      setSlug(category.slug || "");
    } else {
      setName("");
      setSlug("");
    }
  }, [category, isOpen]);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (!isEdit) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
      );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      ...(category ? { id: category.id } : {}),
      name: name.trim(),
      slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white border border-slate-200 shadow-xl rounded-xl p-5">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            {isEdit ? <Edit3 className="w-5 h-5" /> : <FolderPlus className="w-5 h-5" />}
            <DialogTitle className="text-base font-medium text-slate-900">
              {isEdit ? "Sunting kategori program" : "Tambah kategori program baru"}
            </DialogTitle>
          </div>
          <p className="text-sm font-normal text-slate-500">
            {isEdit
              ? "Perbarui nama atau pengenal tautan kategori program kampanye."
              : "Buat kategori baru untuk mengelompokkan program donasi yayasan."}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-800 block">
              Nama kategori
            </label>
            <Input
              value={name}
              onChange={handleNameChange}
              placeholder="Contoh: Pendidikan & Dakwah"
              className="text-sm font-normal"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-800 block">
              Pengenal URL (Slug)
            </label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="contoh: pendidikan-dakwah"
              className="text-sm font-normal font-mono"
              required
            />
          </div>

          <DialogFooter className="gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10 px-4 text-sm font-normal cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="h-10 px-4 text-sm font-medium cursor-pointer"
            >
              {isSubmitting ? "Menyimpan..." : isEdit ? "Simpan perubahan" : "Tambah kategori"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
