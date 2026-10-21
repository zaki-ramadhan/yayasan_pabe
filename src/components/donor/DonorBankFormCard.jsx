"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const { values, bind, getCleanValues, setValues } = useSanitizedForm(
    {
      bankName: profile?.bankName || "BSI (Bank Syariah Indonesia)",
      bankAccount: profile?.bankAccount || "",
      bankAccountName: profile?.bankAccountName || "",
    },
    {
      bankAccount: sanitizeBankAccount,
      bankAccountName: sanitizeBankAccountName,
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanData = getCleanValues();

    const validation = validateBankAccount(cleanData);
    if (!validation.isValid) {
      toast({
        title: "Perhatian",
        description: validation.message,
        variant: "destructive",
      });
      return;
    }

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
          Digunakan untuk verifikasi administrasi dan konfirmasi penyaluran resmi
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div className="space-y-4">
          <div>
            <label htmlFor="select-bank-name" className="text-sm font-medium text-slate-700 block mb-1.5">
              Nama Bank
            </label>
            <Select
              value={values.bankName}
              onValueChange={(val) => setValues((prev) => ({ ...prev, bankName: val }))}
            >
              <SelectTrigger id="select-bank-name" className="h-9.5 text-sm rounded-md border-slate-200 bg-white">
                <SelectValue placeholder="Pilih Bank" />
              </SelectTrigger>
              <SelectContent>
                {BANK_OPTIONS.map((bank) => (
                  <SelectItem key={bank} value={bank} className="cursor-pointer text-sm">
                    {bank}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="input-bank-account" className="text-sm font-medium text-slate-700 block mb-1.5">
              Nomor Rekening
            </label>
            <Input
              id="input-bank-account"
              name="bankAccount"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              {...bind("bankAccount")}
              placeholder="Contoh: 7123456789"
              maxLength={30}
              className="h-9.5 text-sm sm:text-sm rounded-md border-slate-200 bg-white"
            />
          </div>

          <div>
            <label htmlFor="input-bank-account-name" className="text-sm font-medium text-slate-700 block mb-1.5">
              Atas Nama Rekening
            </label>
            <Input
              id="input-bank-account-name"
              name="bankAccountName"
              type="text"
              autoComplete="name"
              {...bind("bankAccountName")}
              placeholder="Sesuai buku tabungan"
              maxLength={60}
              className="h-9.5 text-sm sm:text-sm rounded-md border-slate-200 bg-white"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-start">
          <Button
            type="submit"
            disabled={isSaving}
            className="h-9 px-4 rounded-md text-sm font-medium gap-1.5 cursor-pointer"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
            <span>Simpan Rekening Bank</span>
          </Button>
        </div>
      </form>
    </section>
  );
}
