"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useMemo } from "react";
import { FormDialog } from "@/components/ui/FormDialog";
import { Checkbox } from "@/components/ui/Checkbox";
import { CreatableCombobox } from "@/components/ui/CreatableCombobox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/useToast";
import { toTitleCase } from "@/lib/formatters";

/**
 * Modal for opt-in bulk editing of FAQ category and visibility status.
 */
export function AdminFaqBulkEditModal({
  isOpen,
  onOpenChange,
  selectedIds = [],
  categories = [],
  onSuccess,
}) {
  const [applyCategory, setApplyCategory] = useState(false);
  const [category, setCategory] = useState("Umum");
  const [createdCategories, setCreatedCategories] = useState([]);
  const [applyStatus, setApplyStatus] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setApplyCategory(false);
    setCategory("Umum");
    setApplyStatus(false);
    setIsActive(true);
  }, [isOpen]);

  const categoryList = useMemo(() => {
    const rawList = Array.from(new Set(["Umum", ...categories.filter(Boolean), ...createdCategories]));
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

  const hasAnyField = applyCategory || applyStatus;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasAnyField || selectedIds.length === 0) return;

    const updates = {};
    if (applyCategory) updates.category = category || "Umum";
    if (applyStatus) updates.isActive = isActive;

    setIsSubmitting(true);
    try {
      const res = await safeFetch("/api/admin/faqs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, updates }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || `${selectedIds.length} FAQ berhasil diperbarui.`);
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(data.message || "Gagal memperbarui FAQ terpilih.");
      }
    } catch (err) {
      toast.error(err.message || "Terjadi kendala jaringan saat memperbarui FAQ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={() => !isSubmitting && onOpenChange(false)}
      onSubmit={handleSubmit}
      maxWidth="max-w-md"
      title={`Edit ${selectedIds.length} FAQ terpilih`}
      submitText={`Terapkan ke ${selectedIds.length} item`}
      submittingText="Memperbarui..."
      isSubmitting={isSubmitting}
      submitDisabled={!hasAnyField || selectedIds.length === 0}
    >
      <p className="text-xs text-slate-500">
        Centang kolom yang ingin diubah. Pertanyaan dan jawaban masing-masing FAQ tidak akan berubah.
      </p>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-800 cursor-pointer">
            <Checkbox checked={applyCategory} onCheckedChange={(v) => setApplyCategory(Boolean(v))} />
            <span>Ubah kategori FAQ</span>
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
            <Checkbox checked={applyStatus} onCheckedChange={(v) => setApplyStatus(Boolean(v))} />
            <span>Ubah status tampil</span>
          </label>
          {applyStatus && (
            <Select
              value={isActive ? "ACTIVE" : "INACTIVE"}
              onValueChange={(val) => setIsActive(val === "ACTIVE")}
            >
              <SelectTrigger className="h-10 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Aktif (Tampilkan di publik)</SelectItem>
                <SelectItem value="INACTIVE">Nonaktif (Sembunyikan)</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </FormDialog>
  );
}

