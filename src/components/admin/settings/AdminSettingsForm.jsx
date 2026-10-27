"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { AdminSettingsIdentitySection } from "./AdminSettingsIdentitySection";
import { AdminSettingsLegalSection } from "./AdminSettingsLegalSection";
import { AdminSettingsContactSection } from "./AdminSettingsContactSection";
import { AdminSettingsBankSection } from "./AdminSettingsBankSection";

import { validateOrgSettings } from "@/lib/validator";

export function AdminSettingsForm({ initialSettings }) {
  const router = useRouter();
  const [formData, setFormData] = useState(initialSettings || {});
  const [prevInitial, setPrevInitial] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  if (initialSettings !== prevInitial) {
    setPrevInitial(initialSettings);
    setFormData(initialSettings || {});
  }

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
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
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
        {
          bank: "",
          accountNumber: "",
          accountName: prev.name || "Yayasan Payung Berkah",
          category: "Infaq & Sedekah",
        },
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

    // 1. Validasi menyeluruh input dan aturan bisnis
    const validation = validateOrgSettings(formData);
    if (!validation.isValid) {
      setErrors(validation.errors || {});
      toast.error(validation.error);
      return;
    }
    setErrors({});

    // 2. Bersihkan dan trim seluruh field sebelum dikirim
    const cleanedPayload = {
      ...formData,
      name: (formData.name || "").trim(),
      shortName: (formData.shortName || "").trim(),
      tagline: (formData.tagline || "").trim(),
      vision: (formData.vision || "").trim(),
      legal: {
        skKemenkumham: (formData.legal?.skKemenkumham || "").trim(),
        npwp: (formData.legal?.npwp || "").trim(),
        izinIzinSosial: (formData.legal?.izinIzinSosial || "").trim(),
      },
      contacts: {
        address: (formData.contacts?.address || "").trim(),
        phone: (formData.contacts?.phone || "").trim(),
        whatsapp: (formData.contacts?.whatsapp || "").trim(),
        email: (formData.contacts?.email || "").trim().toLowerCase(),
        officeHours: (formData.contacts?.officeHours || "").trim(),
      },
      officialBankAccounts: (formData.officialBankAccounts || []).map((b) => ({
        bank: (b.bank || "").trim(),
        accountNumber: (b.accountNumber || "").trim().replace(/\D/g, ""),
        accountName: (b.accountName || "").trim(),
        category: (b.category || "").trim(),
      })),
    };

    setIsSaving(true);
    try {
      const res = await safeFetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedPayload),
      });
      const data = await res.json();

      if (data.success) {
        setFormData(data.data);
        toast.success("Pengaturan profil yayasan berhasil disimpan.");
        router.refresh();
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
      <AdminSettingsIdentitySection
        formData={formData}
        errors={errors}
        onFieldChange={handleFieldChange}
      />

      {/* 2. Legalitas & Perizinan */}
      <AdminSettingsLegalSection
        formData={formData}
        errors={errors}
        onFieldChange={handleFieldChange}
      />

      {/* 3. Kontak & Kantor */}
      <AdminSettingsContactSection
        formData={formData}
        errors={errors}
        onFieldChange={handleFieldChange}
      />

      {/* 4. Rekening Bank Resmi */}
      <AdminSettingsBankSection
        bankAccounts={formData.officialBankAccounts || []}
        errors={errors}
        onAddBankAccount={handleAddBankAccount}
        onRemoveBankAccount={handleRemoveBankAccount}
        onBankAccountChange={handleBankAccountChange}
      />

      {/* Action Footer */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="submit"
          isLoading={isSaving}
          disabled={isSaving}
          className="h-10 px-5 text-sm font-medium"
        >
          {isSaving ? "Menyimpan perubahan..." : "Simpan pengaturan"}
        </Button>
      </div>
    </form>
  );
}
