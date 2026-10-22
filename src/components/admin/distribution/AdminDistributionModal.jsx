"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/use-toast";

export function AdminDistributionModal({
  isOpen,
  onOpenChange,
  campaigns = [],
  onSuccess,
}) {
  const [campaignId, setCampaignId] = useState(campaigns[0]?.id || "");
  const [title, setTitle] = useState("");
  const [disbursedAmount, setDisbursedAmount] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const res = await safeFetch("/api/admin/distributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          title,
          disbursedAmount,
          date,
          content,
          images: [],
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Dokumentasi penyaluran mustahik berhasil dicatat.");
        setTitle("");
        setDisbursedAmount(0);
        setContent("");
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(data.message || "Gagal mencatat penyaluran.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat menyimpan penyaluran.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto p-5 sm:p-6">
        <DialogHeader className="pb-3 border-b border-slate-200">
          <DialogTitle className="text-base sm:text-lg font-semibold text-slate-950">
            Catat Penyaluran Donasi ke Mustahik
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Input bukti realisasi distribusi amanah donatur untuk transparansi publik dan audit.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Program Donasi Asal */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-800">
              Program Donasi Terkait <span className="text-rose-500">*</span>
            </label>
            <Select value={campaignId} onValueChange={setCampaignId} required>
              <SelectTrigger className="h-10 text-sm bg-white">
                <SelectValue placeholder="Pilih Program Donasi" />
              </SelectTrigger>
              <SelectContent>
                {campaigns.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Judul Kegiatan Penyaluran */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-800">
              Judul Kegiatan Penyaluran <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Contoh: Penyaluran Paket Sembako & Santunan 50 Yatim Dhuafa"
              value={title}
              maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 text-sm text-slate-900 border-slate-300 rounded-lg"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Nominal Dana yang Disalurkan (Dengan CurrencyInput Pemisah Ribuan 3-Digit Terpusat) */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-800">
                Alokasi Dana Tersalurkan (Rp) <span className="text-rose-500">*</span>
              </label>
              <CurrencyInput
                placeholder="0"
                value={disbursedAmount}
                onChange={(val) => setDisbursedAmount(val)}
                className="h-10"
                required
              />
            </div>

            {/* Tanggal Penyaluran */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-800">
                Tanggal Penyaluran <span className="text-rose-500">*</span>
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 text-sm text-slate-900 border-slate-300 rounded-lg"
                required
              />
            </div>
          </div>

          {/* Catatan / Berita Penyaluran */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-800">
              Deskripsi Berita &amp; Rincian Penyaluran <span className="text-rose-500">*</span>
            </label>
            <Textarea
              rows={4}
              placeholder="Rincian jumlah penerima manfaat, lokasi penyerahan, dan ucapan doa dari mustahik..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full text-sm leading-relaxed"
              required
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
              {isSubmitting ? "Menyimpan..." : "Simpan Rekam Penyaluran"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
