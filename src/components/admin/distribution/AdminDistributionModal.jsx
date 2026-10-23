"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { CreatableCombobox } from "@/components/ui/creatable-combobox";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/use-toast";

export function AdminDistributionModal({
  isOpen,
  onOpenChange,
  campaigns = [],
  distributionToEdit = null,
  onSuccess,
}) {
  const isEditing = Boolean(distributionToEdit);

  const [campaignId, setCampaignId] = useState(campaigns[0]?.id || "");
  const [title, setTitle] = useState("");
  const [disbursedAmount, setDisbursedAmount] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (distributionToEdit) {
      setCampaignId(distributionToEdit.campaignId || campaigns[0]?.id || "");
      setTitle(distributionToEdit.title || "");
      setDisbursedAmount(Number(distributionToEdit.disbursedAmount || 0));
      setDate(
        distributionToEdit.date
          ? distributionToEdit.date.slice(0, 10)
          : new Date().toISOString().split("T")[0]
      );
      setContent(distributionToEdit.content || "");
    } else {
      setCampaignId(campaigns[0]?.id || "");
      setTitle("");
      setDisbursedAmount(0);
      setDate(new Date().toISOString().split("T")[0]);
      setContent("");
    }
  }, [distributionToEdit, isOpen, campaigns]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Judul penyaluran wajib diisi.");
      return;
    }
    if (!campaignId) {
      toast.error("Pilih program donasi asal penyaluran.");
      return;
    }

    if (disbursedAmount <= 0) {
      toast.error("Nominal dana penyaluran wajib lebih dari Rp 0.");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = isEditing
        ? `/api/admin/distributions/${distributionToEdit.id}`
        : "/api/admin/distributions";
      const method = isEditing ? "PUT" : "POST";

      const res = await safeFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          title: title.trim(),
          disbursedAmount,
          date,
          content: content.trim(),
          images: distributionToEdit?.images || [],
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(
          isEditing
            ? "Rekam penyaluran berhasil diperbarui."
            : "Dokumentasi penyaluran mustahik berhasil dicatat."
        );
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(data.message || "Gagal menyimpan penyaluran.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat menyimpan penyaluran.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto p-5 sm:p-6 bg-white border border-slate-200">
        <DialogHeader className="pb-3 border-b border-slate-200">
          <DialogTitle className="text-base sm:text-lg font-medium text-slate-900 leading-tight">
            {isEditing ? "Sunting rekam penyaluran donasi" : "Catat penyaluran donasi ke mustahik"}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 font-normal">
            Input bukti realisasi distribusi amanah donatur untuk transparansi publik dan audit.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Program Donasi Asal */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-800">
              Program donasi terkait <span className="text-rose-500">*</span>
            </label>
            <CreatableCombobox
              options={campaigns.map((c) => ({ value: c.id, label: c.title }))}
              value={campaignId}
              onChange={(val) => setCampaignId(val)}
              placeholder="Pilih program donasi terkait..."
              searchPlaceholder="Ketik untuk mencari program donasi..."
              emptyMessage="Program donasi tidak ditemukan."
            />
          </div>

          {/* Judul Kegiatan Penyaluran */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-800">
              Judul kegiatan penyaluran <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Contoh: Penyaluran Paket Sembako & Santunan 50 Yatim Dhuafa"
              value={title}
              maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 text-sm font-normal text-slate-900 border-slate-300 rounded-lg"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Nominal Dana yang Disalurkan */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-800">
                Alokasi dana tersalurkan (Rp) <span className="text-rose-500">*</span>
              </label>
              <CurrencyInput
                placeholder="0"
                value={disbursedAmount}
                onChange={(val) => setDisbursedAmount(val)}
                className="h-10 text-sm font-normal"
                required
              />
            </div>

            {/* Tanggal Penyaluran */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-800">
                Tanggal penyaluran <span className="text-rose-500">*</span>
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 text-sm font-normal text-slate-900 border-slate-300 rounded-lg"
                required
              />
            </div>
          </div>

          {/* Catatan / Berita Penyaluran */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-800">
              Deskripsi berita &amp; rincian penyaluran <span className="text-rose-500">*</span>
            </label>
            <Textarea
              rows={4}
              placeholder="Rincian jumlah penerima manfaat, lokasi penyerahan, dan ucapan doa dari mustahik..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full text-sm font-normal leading-relaxed border-slate-300"
              required
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 px-4 rounded-lg text-sm font-medium text-slate-700 border-slate-300 cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-4 rounded-lg text-sm font-medium bg-primary hover:bg-primary/90 text-white cursor-pointer"
            >
              {isSubmitting ? "Menyimpan..." : isEditing ? "Simpan perubahan" : "Simpan penyaluran"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
