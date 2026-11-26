"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useMemo } from "react";
import { FormDialog } from "@/components/ui/FormDialog";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { CreatableCombobox } from "@/components/ui/CreatableCombobox";
import { DatePicker } from "@/components/ui/DatePicker";
import { AutoResizeTextarea } from "@/components/ui/AutoResizeTextarea";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/useToast";
import { sanitizeStandardText } from "@/lib/sanitizer";
import { toTitleCase } from "@/lib/formatters";
import { DEFAULT_GALLERY_CATEGORY } from "@/lib/galleryConstants";
import { FIELD_LIMITS } from "@/constants/fieldValidationLimits";

/**
 * Modal for opt-in bulk metadata editing across multiple selected gallery items.
 */
export function AdminGalleryBulkEditModal({
  isOpen,
  onOpenChange,
  selectedIds = [],
  categories = [],
  onSuccess,
}) {
  const [applyTitle, setApplyTitle] = useState(false);
  const [title, setTitle] = useState("");
  const [applyCategory, setApplyCategory] = useState(false);
  const [category, setCategory] = useState(DEFAULT_GALLERY_CATEGORY);
  const [createdCategories, setCreatedCategories] = useState([]);
  const [applyDate, setApplyDate] = useState(false);
  const [activityDate, setActivityDate] = useState("");
  const [applyDescription, setApplyDescription] = useState(false);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setApplyTitle(false);
    setTitle("");
    setApplyCategory(false);
    setCategory(DEFAULT_GALLERY_CATEGORY);
    setApplyDate(false);
    setActivityDate("");
    setApplyDescription(false);
    setDescription("");
  }, [isOpen]);

  const categoryList = useMemo(() => {
    const rawList = Array.from(
      new Set([
        ...categories.filter((c) => c && c !== "Semua Kategori" && c !== "ALL"),
        ...createdCategories,
      ])
    );
    return rawList.map((name) => ({ id: name, label: name, name }));
  }, [categories, createdCategories]);

  const handleCreateCategory = (name) => {
    const formatted = toTitleCase(name);
    if (!formatted) return;
    if (!createdCategories.includes(formatted)) {
      setCreatedCategories((prev) => [...prev, formatted]);
    }
    setCategory(formatted);
    toast.success(`Kategori "${formatted}" berhasil ditambahkan.`);
    return { id: formatted, label: formatted, name: formatted };
  };

  const hasAnyField = applyTitle || applyCategory || applyDate || applyDescription;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasAnyField || selectedIds.length === 0) return;

    const updates = {};
    if (applyTitle) updates.title = title.trim() || "Dokumentasi kegiatan";
    if (applyCategory) updates.category = category || DEFAULT_GALLERY_CATEGORY;
    if (applyDate) updates.activityDate = activityDate ? new Date(activityDate).toISOString() : null;
    if (applyDescription) updates.description = description.trim() || null;

    setIsSubmitting(true);
    try {
      const res = await safeFetch("/api/admin/gallery", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, updates }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || `${selectedIds.length} dokumentasi berhasil diperbarui.`);
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(data.message || "Gagal memperbarui dokumentasi terpilih.");
      }
    } catch (err) {
      toast.error(err.message || "Terjadi kendala jaringan saat memperbarui dokumentasi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={() => !isSubmitting && onOpenChange(false)}
      onSubmit={handleSubmit}
      maxWidth="max-w-lg"
      title={`Edit ${selectedIds.length} dokumentasi terpilih`}
      submitText={`Terapkan ke ${selectedIds.length} item`}
      submittingText="Memperbarui..."
      isSubmitting={isSubmitting}
      submitDisabled={!hasAnyField || selectedIds.length === 0}
    >
      <p className="text-xs text-slate-500">
        Centang kolom yang ingin diubah. Kolom yang tidak dicentang tetap mempertahankan data aslinya; berkas foto/video tidak berubah.
      </p>

      <div className="space-y-3.5">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-800 cursor-pointer">
            <Checkbox checked={applyTitle} onCheckedChange={(v) => setApplyTitle(Boolean(v))} />
            <span>Ubah judul kegiatan</span>
          </label>
          {applyTitle && (
            <Input
              type="text"
              placeholder="Judul kegiatan baru..."
              value={title}
              minLength={FIELD_LIMITS.GALLERY_TITLE.min}
              maxLength={FIELD_LIMITS.GALLERY_TITLE.max}
              onChange={(e) => setTitle(sanitizeStandardText(e.target.value, FIELD_LIMITS.GALLERY_TITLE.max))}
              className="h-10 text-sm text-slate-900 border-slate-300 rounded-lg"
            />
          )}
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-800 cursor-pointer">
            <Checkbox checked={applyCategory} onCheckedChange={(v) => setApplyCategory(Boolean(v))} />
            <span>Ubah kategori kegiatan</span>
          </label>
          {applyCategory && (
            <CreatableCombobox
              options={categoryList}
              value={category}
              onChange={setCategory}
              onCreate={handleCreateCategory}
              placeholder="Pilih kategori..."
              searchPlaceholder="Cari atau buat kategori..."
              createPrefix="Buat kategori"
              className="bg-white"
            />
          )}
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-800 cursor-pointer">
            <Checkbox checked={applyDate} onCheckedChange={(v) => setApplyDate(Boolean(v))} />
            <span>Ubah tanggal kegiatan (kosongkan untuk menghapus tanggal)</span>
          </label>
          {applyDate && (
            <DatePicker
              value={activityDate}
              onChange={setActivityDate}
              placeholder="Kosong / pilih tanggal baru..."
            />
          )}
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-800 cursor-pointer">
            <Checkbox checked={applyDescription} onCheckedChange={(v) => setApplyDescription(Boolean(v))} />
            <span>Ubah keterangan (kosongkan untuk menghapus keterangan)</span>
          </label>
          {applyDescription && (
            <AutoResizeTextarea
              minRows={2}
              maxRows={5}
              minLength={FIELD_LIMITS.GALLERY_DESCRIPTION.min}
              maxLength={FIELD_LIMITS.GALLERY_DESCRIPTION.max}
              placeholder="Keterangan baru..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-sm leading-relaxed"
            />
          )}
        </div>
      </div>
    </FormDialog>
  );
}

