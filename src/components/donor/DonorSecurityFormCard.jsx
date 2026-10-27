"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
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
  const [errors, setErrors] = useState({});

  const { bind, getCleanValues, setValues } = useSanitizedForm({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const passwordData = getCleanValues();

    const newErrors = {};
    if (!passwordData.oldPassword) {
      newErrors.oldPassword = "Kata sandi saat ini wajib diisi untuk verifikasi keamanan.";
    }

    const newPassValidation = validatePasswordInput(
      passwordData.newPassword,
      "Kata sandi baru"
    );
    if (!newPassValidation.isValid) {
      newErrors.newPassword = newPassValidation.message;
    } else if (passwordData.newPassword === passwordData.oldPassword) {
      newErrors.newPassword = "Kata sandi baru harus berbeda dari kata sandi saat ini.";
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi kata sandi baru tidak cocok. Periksa kembali pengetikan Anda.";
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
          Ganti kata sandi untuk menjaga keamanan akun.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div className="space-y-4">
          <FormField label="Kata sandi saat ini" required error={errors.oldPassword}>
            <Input
              id="input-old-password"
              name="oldPassword"
              type="password"
              autoComplete="current-password"
              {...bind("oldPassword")}
              onChange={(e) => {
                bind("oldPassword").onChange(e);
                if (errors.oldPassword) setErrors((prev) => ({ ...prev, oldPassword: undefined }));
              }}
              placeholder="Masukkan sandi saat ini"
              maxLength={128}
              className="h-9.5 text-sm sm:text-sm rounded-md bg-white font-normal"
              required
            />
          </FormField>

          <FormField label="Kata sandi baru" required error={errors.newPassword}>
            <Input
              id="input-new-password"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              {...bind("newPassword")}
              onChange={(e) => {
                bind("newPassword").onChange(e);
                if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: undefined }));
              }}
              placeholder="Minimal 6 karakter"
              maxLength={128}
              className="h-9.5 text-sm sm:text-sm rounded-md bg-white font-normal"
              required
            />
          </FormField>

          <FormField label="Ulangi sandi baru" required error={errors.confirmPassword}>
            <Input
              id="input-confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...bind("confirmPassword")}
              onChange={(e) => {
                bind("confirmPassword").onChange(e);
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              placeholder="Ulangi kata sandi baru"
              maxLength={128}
              className="h-9.5 text-sm sm:text-sm rounded-md bg-white font-normal"
              required
            />
          </FormField>
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
