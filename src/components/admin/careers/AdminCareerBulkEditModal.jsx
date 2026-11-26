"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from "react";
import { FormDialog } from "@/components/ui/FormDialog";
import { Checkbox } from "@/components/ui/Checkbox";
import { DatePicker } from "@/components/ui/DatePicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/useToast";

/**
 * Modal for opt-in bulk editing of job vacancy status and deadline.
 */
export function AdminCareerBulkEditModal({
  isOpen,
  onOpenChange,
  selectedIds = [],
  onSuccess,
}) {
  const [applyStatus, setApplyStatus] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [applyDeadline, setApplyDeadline] = useState(false);
  const [deadline, setDeadline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setApplyStatus(false);
    setIsActive(true);
    setApplyDeadline(false);
    setDeadline("");
  }, [isOpen]);

  const hasAnyField = applyStatus || (applyDeadline && Boolean(deadline));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasAnyField || selectedIds.length === 0) return;

    const updates = {};
    if (applyStatus) updates.isActive = isActive;
    if (applyDeadline && deadline) updates.deadline = deadline;

    setIsSubmitting(true);
    try {
      const res = await safeFetch("/api/admin/careers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, updates }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || `${selectedIds.length} lowongan berhasil diperbarui.`);
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(data.message || "Gagal memperbarui lowongan terpilih.");
      }
    } catch (err) {
      toast.error(err.message || "Terjadi kendala jaringan saat memperbarui lowongan.");
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
      title={`Edit ${selectedIds.length} lowongan terpilih`}
      submitText={`Terapkan ke ${selectedIds.length} item`}
      submittingText="Memperbarui..."
      isSubmitting={isSubmitting}
      submitDisabled={!hasAnyField || selectedIds.length === 0}
    >
      <p className="text-xs text-slate-500">
        Centang kolom yang ingin diubah. Judul, deskripsi, kuota, dan data pelamar tetap utuh.
      </p>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-800 cursor-pointer">
            <Checkbox checked={applyStatus} onCheckedChange={(v) => setApplyStatus(Boolean(v))} />
            <span>Ubah status lowongan</span>
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
                <SelectItem value="ACTIVE">Aktif (Dibuka)</SelectItem>
                <SelectItem value="INACTIVE">Ditutup (Nonaktif)</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-800 cursor-pointer">
            <Checkbox checked={applyDeadline} onCheckedChange={(v) => setApplyDeadline(Boolean(v))} />
            <span>Ubah batas waktu lamaran</span>
          </label>
          {applyDeadline && (
            <DatePicker
              value={deadline}
              onChange={setDeadline}
              clearable={false}
              placeholder="Pilih batas waktu baru..."
            />
          )}
        </div>
      </div>
    </FormDialog>
  );
}

