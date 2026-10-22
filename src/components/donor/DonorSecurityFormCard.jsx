"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useSanitizedForm } from "@/hooks/useSanitizedForm";
import { cn } from "@/lib/utils";
import { validatePasswordInput } from "@/lib/security";

export function DonorSecurityFormCard({
  onUpdatePassword,
  id = "section-security",
  borderless = false,
}) {
  const [isSaving, setIsSaving] = useState(false);

  const { bind, getCleanValues, setValues } = useSanitizedForm({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const passwordData = getCleanValues();

    if (!passwordData.oldPassword) {
      toast({
        title: "Perhatian",
        description: "Kata sandi saat ini wajib diisi untuk verifikasi keamanan.",
        variant: "destructive",
      });
      return;
    }

    const newPassValidation = validatePasswordInput(
      passwordData.newPassword,
      "Kata sandi baru"
    );
    if (!newPassValidation.isValid) {
      toast({
        title: "Perhatian",
        description: newPassValidation.message,
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Perhatian",
        description: "Konfirmasi kata sandi baru tidak cocok. Periksa kembali pengetikan Anda.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword === passwordData.oldPassword) {
      toast({
        title: "Perhatian",
        description: "Kata sandi baru harus berbeda dari kata sandi saat ini.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await onUpdatePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      toast({
        title: "Berhasil",
        description: "Kata sandi akun Anda berhasil diperbarui.",
        variant: "success",
      });
      setValues({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast({
        title: "Gagal Memperbarui",
        description: err.message || "Terjadi kesalahan saat memperbarui kata sandi.",
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
        <div className="flex items-center gap-2">
          <h2 className="text-base font-medium text-slate-950 leading-snug">
            Keamanan Akun
          </h2>
        </div>
        <p className="text-sm font-normal text-slate-500 mt-0.5">
          Perbarui kata sandi secara berkala untuk menjaga perlindungan akun Anda
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div className="space-y-4">
          <div>
            <label htmlFor="input-old-password" className="text-sm font-medium text-slate-700 block mb-1.5">
              Kata Sandi Saat Ini
            </label>
            <Input
              id="input-old-password"
              name="oldPassword"
              type="password"
              autoComplete="current-password"
              {...bind("oldPassword")}
              placeholder="Masukkan sandi saat ini"
              maxLength={128}
              className="h-9.5 text-sm sm:text-sm rounded-md border-slate-200 bg-white"
              required
            />
          </div>

          <div>
            <label htmlFor="input-new-password" className="text-sm font-medium text-slate-700 block mb-1.5">
              Kata Sandi Baru
            </label>
            <Input
              id="input-new-password"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              {...bind("newPassword")}
              placeholder="Minimal 6 karakter"
              maxLength={128}
              className="h-9.5 text-sm sm:text-sm rounded-md border-slate-200 bg-white"
              required
            />
          </div>

          <div>
            <label htmlFor="input-confirm-password" className="text-sm font-medium text-slate-700 block mb-1.5">
              Ulangi Sandi Baru
            </label>
            <Input
              id="input-confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...bind("confirmPassword")}
              placeholder="Ulangi kata sandi baru"
              maxLength={128}
              className="h-9.5 text-sm sm:text-sm rounded-md border-slate-200 bg-white"
              required
            />
          </div>
        </div>

        <div className="pt-2 flex justify-start">
          <Button
            type="submit"
            disabled={isSaving}
            variant="outline"
            className="h-9 px-4 rounded-md text-sm font-medium border-slate-300 bg-white text-slate-800 hover:bg-slate-50 gap-1.5 cursor-pointer"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
            <span>Perbarui Kata Sandi</span>
          </Button>
        </div>
      </form>
    </section>
  );
}
