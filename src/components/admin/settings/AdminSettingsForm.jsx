"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/use-toast";

export function AdminSettingsForm({ initialSettings }) {
  const [formData, setFormData] = useState(initialSettings || {});
  const [isSaving, setIsSaving] = useState(false);

  const handleFieldChange = (section, field, value) => {
    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleBankAccountChange = (index, field, value) => {
    setFormData((prev) => {
      const accounts = [...(prev.officialBankAccounts || [])];
      accounts[index] = { ...accounts[index], [field]: value };
      return { ...prev, officialBankAccounts: accounts };
    });
  };

  const handleAddBankAccount = () => {
    setFormData((prev) => ({
      ...prev,
      officialBankAccounts: [
        ...(prev.officialBankAccounts || []),
        { bank: "", accountNumber: "", accountName: prev.name || "Yayasan Generasi Sejahtera Mandiri", category: "Infaq & Sedekah" },
      ],
    }));
  };

  const handleRemoveBankAccount = (index) => {
    setFormData((prev) => {
      const accounts = [...(prev.officialBankAccounts || [])];
      accounts.splice(index, 1);
      return { ...prev, officialBankAccounts: accounts };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await safeFetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        setFormData(data.data);
        toast.success("Pengaturan profil yayasan berhasil disimpan.");
      } else {
        toast.error(data.message || "Gagal menyimpan pengaturan.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat menyimpan pengaturan.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* 1. Identitas Yayasan */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-3">
        <div className="pb-2.5 border-b border-slate-100">
          <h2 className="text-base font-medium text-slate-900 leading-tight">
            Identitas &amp; profil yayasan
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm font-normal">
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-medium text-slate-700">Nama resmi yayasan</label>
            <Input
              value={formData.name || ""}
              onChange={(e) => handleFieldChange(null, "name", e.target.value)}
              placeholder="Contoh: Yayasan Generasi Sejahtera Mandiri"
              className="h-10 text-sm font-normal"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Singkatan / sebutan brand</label>
            <Input
              value={formData.shortName || ""}
              onChange={(e) => handleFieldChange(null, "shortName", e.target.value)}
              placeholder="Contoh: GSM"
              className="h-10 text-sm font-normal"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Tagline yayasan</label>
            <Input
              value={formData.tagline || ""}
              onChange={(e) => handleFieldChange(null, "tagline", e.target.value)}
              placeholder="Tagline atau moto lembaga"
              className="h-10 text-sm font-normal"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-medium text-slate-700">Visi lembaga</label>
            <Textarea
              rows={2}
              value={formData.vision || ""}
              onChange={(e) => handleFieldChange(null, "vision", e.target.value)}
              placeholder="Visi jangka panjang yayasan"
              className="w-full text-sm font-normal border-slate-300"
            />
          </div>
        </div>
      </div>

      {/* 2. Legalitas & Perizinan */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-3">
        <div className="pb-2.5 border-b border-slate-100">
          <h2 className="text-base font-medium text-slate-900 leading-tight">
            Legalitas &amp; perizinan resmi
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-sm font-normal">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">SK Kemenkumham RI</label>
            <Input
              value={formData.legal?.skKemenkumham || ""}
              onChange={(e) => handleFieldChange("legal", "skKemenkumham", e.target.value)}
              placeholder="AHU-xxxx.AH.01.xx"
              className="h-10 text-sm font-normal"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Nomor Pokok Wajib Pajak (NPWP)</label>
            <Input
              value={formData.legal?.npwp || ""}
              onChange={(e) => handleFieldChange("legal", "npwp", e.target.value)}
              placeholder="00.000.000.0-000.000"
              className="h-10 text-sm font-normal"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Izin operasional dinsos</label>
            <Input
              value={formData.legal?.izinIzinSosial || ""}
              onChange={(e) => handleFieldChange("legal", "izinIzinSosial", e.target.value)}
              placeholder="Nomor izin dinas sosial"
              className="h-10 text-sm font-normal"
            />
          </div>
        </div>
      </div>

      {/* 3. Kontak & Kantor */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-3">
        <div className="pb-2.5 border-b border-slate-100">
          <h2 className="text-base font-medium text-slate-900 leading-tight">
            Kontak layanan &amp; alamat kantor
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm font-normal">
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-medium text-slate-700">Alamat lengkap kantor</label>
            <Input
              value={formData.contacts?.address || ""}
              onChange={(e) => handleFieldChange("contacts", "address", e.target.value)}
              placeholder="Alamat kantor yayasan"
              className="h-10 text-sm font-normal"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">WhatsApp resmi layanan</label>
            <Input
              value={formData.contacts?.whatsapp || ""}
              onChange={(e) => handleFieldChange("contacts", "whatsapp", e.target.value)}
              placeholder="+62 8xx-xxxx-xxxx"
              className="h-10 text-sm font-normal"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Email resmi layanan</label>
            <Input
              value={formData.contacts?.email || ""}
              onChange={(e) => handleFieldChange("contacts", "email", e.target.value)}
              placeholder="layanan@yayasangsm.id"
              type="email"
              className="h-10 text-sm font-normal"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Telepon kantor</label>
            <Input
              value={formData.contacts?.phone || ""}
              onChange={(e) => handleFieldChange("contacts", "phone", e.target.value)}
              placeholder="(021) xxxx-xxxx"
              className="h-10 text-sm font-normal"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Jam pelayanan kantor</label>
            <Input
              value={formData.contacts?.officeHours || ""}
              onChange={(e) => handleFieldChange("contacts", "officeHours", e.target.value)}
              placeholder="Senin - Jumat, 08.00 - 17.00 WIB"
              className="h-10 text-sm font-normal"
            />
          </div>
        </div>
      </div>

      {/* 4. Rekening Bank Resmi */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
          <h2 className="text-base font-medium text-slate-900 leading-tight">
            Rekening bank resmi yayasan
          </h2>
          <button
            type="button"
            onClick={handleAddBankAccount}
            className="h-9 px-3 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-slate-700" />
            <span>Tambah rekening</span>
          </button>
        </div>

        <div className="space-y-3">
          {(formData.officialBankAccounts || []).map((account, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-lg grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
            >
              <div className="sm:col-span-3 space-y-1">
                <label className="text-xs font-medium text-slate-700">Nama bank</label>
                <Input
                  value={account.bank || ""}
                  onChange={(e) => handleBankAccountChange(idx, "bank", e.target.value)}
                  placeholder="Contoh: Bank Syariah Indonesia"
                  className="h-9 text-sm font-normal bg-white"
                  required
                />
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="text-xs font-medium text-slate-700">Nomor rekening</label>
                <Input
                  value={account.accountNumber || ""}
                  onChange={(e) => handleBankAccountChange(idx, "accountNumber", e.target.value)}
                  placeholder="Nomor rekening bank"
                  className="h-9 text-sm font-normal bg-white"
                  required
                />
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="text-xs font-medium text-slate-700">Atas nama pemilik rekening</label>
                <Input
                  value={account.accountName || ""}
                  onChange={(e) => handleBankAccountChange(idx, "accountName", e.target.value)}
                  placeholder="Atas nama yayasan"
                  className="h-9 text-sm font-normal bg-white"
                  required
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-medium text-slate-700">Kategori alokasi</label>
                <Input
                  value={account.category || ""}
                  onChange={(e) => handleBankAccountChange(idx, "category", e.target.value)}
                  placeholder="Infaq / Zakat / Operasional"
                  className="h-9 text-sm font-normal bg-white"
                />
              </div>

              <div className="sm:col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRemoveBankAccount(idx)}
                  title="Hapus rekening ini"
                  className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {(!formData.officialBankAccounts || formData.officialBankAccounts.length === 0) && (
            <p className="text-sm text-slate-500 text-center py-4 italic font-normal">
              Belum ada rekening bank resmi yang ditambahkan.
            </p>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
        >
          <span>{isSaving ? "Menyimpan perubahan..." : "Simpan semua pengaturan"}</span>
        </button>
      </div>
    </form>
  );
}
