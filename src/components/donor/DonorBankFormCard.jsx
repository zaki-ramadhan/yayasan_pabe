"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { toast } from "@/hooks/useToast";
import { useSanitizedForm } from "@/hooks/useSanitizedForm";
import { cn } from "@/lib/utils";
import {
  sanitizeBankAccount,
  sanitizeBankAccountName,
  validateBankAccount,
} from "@/lib/security";

const BANK_OPTIONS = [
  "BSI (Bank Syariah Indonesia)",
  "BCA (Bank Central Asia)",
  "Bank Mandiri",
  "BRI (Bank Rakyat Indonesia)",
  "BNI (Bank Negara Indonesia)",
  "Bank Muamalat Indonesia",
  "CIMB Niaga Syariah",
  "Bank Permata Syariah",
];

export function DonorBankFormCard({
  profile,
  onUpdateProfile,
  id = "section-bank",
  borderless = false,
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const { values, bind, getCleanValues, setValues, isDirty, isValid } = useSanitizedForm(
    {
      bankName: profile?.bankName || "BSI (Bank Syariah Indonesia)",
      bankAccount: profile?.bankAccount || "",
      bankAccountName: profile?.bankAccountName || "",
    },
    {
      bankAccount: sanitizeBankAccount,
      bankAccountName: sanitizeBankAccountName,
    },
    (vals) => validateBankAccount({ bankAccount: vals.bankAccount, bankAccountName: vals.bankAccountName }).isValid
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanData = getCleanValues();

    const newErrors = {};
    if (cleanData.bankAccount || cleanData.bankAccountName) {
      if (!cleanData.bankAccount) {
        newErrors.bankAccount = "Nomor rekening wajib diisi.";
      } else if (cleanData.bankAccount.length < 5 || cleanData.bankAccount.length > 30) {
        newErrors.bankAccount = "Nomor rekening harus antara 5 hingga 30 digit angka.";
      }

      if (!cleanData.bankAccountName) {
        newErrors.bankAccountName = "Nama pemilik rekening wajib diisi.";
      } else if (cleanData.bankAccountName.length < 2) {
        newErrors.bankAccountName = "Nama pemilik rekening minimal 2 karakter.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      toast({
        title: "Perhatian",
        description: firstError,
        variant: "destructive",
      });
      return;
    }
    setErrors({});

    setIsSaving(true);
    try {
      await onUpdateProfile(cleanData);
      toast({
        title: "Berhasil",
        description: "Data rekening bank berhasil disimpan.",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Gagal Menyimpan",
        description: err.message || "Terjadi kesalahan saat menyimpan rekening.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section
      id={id}
      className={cn(
        "transition-all",
        borderless
          ? "bg-transparent p-0"
          : "rounded-md border border-slate-200/90 bg-sidebar p-5 sm:p-6 shadow-2xs"
      )}
    >
      <div className="pb-4 mb-5 border-b border-slate-200/80">
        <h2 className="text-base font-medium text-slate-950 leading-snug">
          Informasi Rekening Bank
        </h2>
        <p className="text-sm font-normal text-slate-500 mt-0.5">
          Rekening bank untuk keperluan administrasi donasi.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div className="space-y-4">
          <FormField label="Nama bank">
            <Select
              value={values.bankName}
              onValueChange={(val) => setValues((prev) => ({ ...prev, bankName: val }))}
            >
              <SelectTrigger id="select-bank-name" className="h-9.5 text-sm rounded-md bg-white">
                <SelectValue placeholder="Pilih bank" />
              </SelectTrigger>
              <SelectContent>
                {BANK_OPTIONS.map((bank) => (
                  <SelectItem key={bank} value={bank} className="cursor-pointer text-sm">
                    {bank}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Nomor rekening" error={errors.bankAccount}>
            <Input
              id="input-bank-account"
              name="bankAccount"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              {...bind("bankAccount")}
              onChange={(e) => {
                bind("bankAccount").onChange(e);
                if (errors.bankAccount) setErrors((prev) => ({ ...prev, bankAccount: undefined }));
              }}
              placeholder="Contoh: 7123456789"
              maxLength={30}
              className="h-9.5 text-sm sm:text-sm rounded-md bg-white font-normal"
            />
          </FormField>

          <FormField label="Atas nama rekening" error={errors.bankAccountName}>
            <Input
              id="input-bank-account-name"
              name="bankAccountName"
              type="text"
              autoComplete="name"
              {...bind("bankAccountName")}
              onChange={(e) => {
                bind("bankAccountName").onChange(e);
                if (errors.bankAccountName) setErrors((prev) => ({ ...prev, bankAccountName: undefined }));
              }}
              placeholder="Sesuai buku tabungan"
              maxLength={60}
              className="h-9.5 text-sm sm:text-sm rounded-md bg-white font-normal"
            />
          </FormField>
        </div>

        <div className="pt-2 flex justify-start">
          <Button
            type="submit"
            disabled={!isDirty || !isValid || isSaving}
            className="h-9 px-4 rounded-md text-sm font-medium gap-1.5 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
            <span>{isSaving ? "Menyimpan..." : "Simpan"}</span>
          </Button>
        </div>
      </form>
    </section>
  );
}
