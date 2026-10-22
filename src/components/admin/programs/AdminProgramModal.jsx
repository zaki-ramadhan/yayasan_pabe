"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/use-toast";

export function AdminProgramModal({
  isOpen,
  onOpenChange,
  campaignToEdit = null,
  categories = [],
  onSuccess,
}) {
  const isEditing = Boolean(campaignToEdit);

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [targetAmount, setTargetAmount] = useState(0);
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [story, setStory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (campaignToEdit) {
      setTitle(campaignToEdit.title || "");
      setCategoryId(campaignToEdit.categoryId || categories[0]?.id || "");
      setTargetAmount(campaignToEdit.targetAmount || 0);
      setEndDate(campaignToEdit.endDate ? campaignToEdit.endDate.split("T")[0] : "");
      setLocation(campaignToEdit.location || "");
      setIsUrgent(Boolean(campaignToEdit.isUrgent));
      setStory(campaignToEdit.story || campaignToEdit.excerpt || "");
    } else {
      setTitle("");
      setCategoryId(categories[0]?.id || "");
      setTargetAmount(0);
      setEndDate("");
      setLocation("Wilayah Binaan PABE");
      setIsUrgent(false);
      setStory("");
    }
  }, [campaignToEdit, categories, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Judul program wajib diisi.");
      return;
    }
    if (!categoryId) {
      toast.error("Kategori program wajib dipilih.");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = isEditing
        ? `/api/admin/programs/${campaignToEdit.id}`
        : "/api/admin/programs";
      const method = isEditing ? "PUT" : "POST";

      const res = await safeFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          categoryId,
          targetAmount,
          endDate: endDate ? new Date(endDate).toISOString() : null,
          location,
          isUrgent,
          story,
          excerpt: story.slice(0, 160),
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(isEditing ? "Program berhasil diperbarui." : "Program baru berhasil dibuat.");
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(data.message || "Gagal menyimpan program.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat menyimpan program.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto p-5 sm:p-6">
        <DialogHeader className="pb-3 border-b border-slate-200">
          <DialogTitle className="text-base sm:text-lg font-semibold text-slate-950">
            {isEditing ? "Sunting Program Donasi" : "Tambah Program Donasi Baru"}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Pastikan rincian akad program, kategori, dan target pendanaan akurat.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Judul Program */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-800">
              Judul Program <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Contoh: Beasiswa Santri Penghafal Al-Qur'an"
              value={title}
              maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 text-sm text-slate-900 border-slate-300 rounded-lg"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Kategori Program */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-800">
                Kategori Program <span className="text-rose-500">*</span>
              </label>
              <Select value={categoryId} onValueChange={setCategoryId} required>
                <SelectTrigger className="h-10 text-sm bg-white">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Target Donasi (Dengan CurrencyInput Pemisah Ribuan 3-Digit Terpusat) */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-800">
                Target Pendanaan (Rp) <span className="text-rose-500">*</span>
              </label>
              <CurrencyInput
                placeholder="0 (atau kosongkan jika tak terbatas)"
                value={targetAmount}
                onChange={(val) => setTargetAmount(val)}
                className="h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Tenggat Waktu (End Date) */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-800">
                Batas Waktu Penggalangan
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-10 text-sm text-slate-900 border-slate-300 rounded-lg"
              />
            </div>

            {/* Wilayah Penyaluran */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-800">
                Wilayah / Lokasi Penyaluran
              </label>
              <Input
                type="text"
                placeholder="Contoh: Jawa Barat & Banten"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-10 text-sm text-slate-900 border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Urgent Program Checkbox */}
          <Checkbox
            id="isUrgent"
            variant="card"
            checked={isUrgent}
            onCheckedChange={setIsUrgent}
            label="Tandai sebagai Program Mendesak"
            description="Program akan mendapat prioritas banner dan badge darurat di beranda utama"
          />

          {/* Deskripsi & Cerita Program */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-800">
              Cerita &amp; Latar Belakang Program
            </label>
            <Textarea
              rows={4}
              placeholder="Ceritakan latar belakang mustahik, tujuan penyaluran dana, dan kebutuhan mendesak..."
              value={story}
              onChange={(e) => setStory(e.target.value)}
              className="w-full text-sm leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 px-4 rounded-lg text-sm font-medium text-slate-700 border-slate-300"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-4 rounded-lg text-sm font-medium bg-primary hover:bg-primary-hover text-white cursor-pointer"
            >
              {isSubmitting ? "Menyimpan..." : isEditing ? "Perbarui Program" : "Publikasikan Program"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
