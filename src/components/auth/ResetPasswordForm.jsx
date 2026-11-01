"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AuthFormHeader } from "@/components/auth/AuthFormHeader";
import { ResetPasswordFields } from "@/components/auth/ResetPasswordFields";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/useToast";

/**
 * Formulir pengisian kata sandi baru.
 * Single Responsibility: Menangani validasi form, submit ke API, dan feedback.
 */
export function ResetPasswordForm({ token, userEmail = "", onSuccess }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!password.trim()) {
      newErrors.password = "Kata sandi baru wajib diisi.";
    } else if (password.length < 6) {
      newErrors.password = "Kata sandi minimal 6 karakter.";
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Konfirmasi kata sandi wajib diisi.";
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Konfirmasi kata sandi tidak cocok.";
    }

    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      const firstError = Object.values(formErrors)[0];
      toast.error(firstError);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await safeFetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
        timeoutMs: 15000,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Gagal mengatur ulang kata sandi.");
      }

      toast.success(data.message || "Kata sandi berhasil diatur ulang.");
      if (typeof onSuccess === "function") {
        onSuccess();
      }
    } catch (err) {
      toast.error(err.message || "Terjadi kendala saat mengatur ulang kata sandi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled =
    !password.trim() ||
    password.length < 6 ||
    !confirmPassword.trim() ||
    password !== confirmPassword ||
    isSubmitting;

  return (
    <div className="space-y-6">
      <AuthFormHeader
        title="Buat kata sandi baru"
        subtitle={
          userEmail
            ? `Atur ulang kata sandi untuk akun ${userEmail}`
            : "Silakan masukkan kata sandi baru akun Anda."
        }
      />

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <ResetPasswordFields
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          errors={errors}
          setErrors={setErrors}
          disabled={isSubmitting}
        />

        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={isSubmitDisabled}
          className="w-full h-11 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg mt-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Menyimpan kata sandi..." : "Simpan kata sandi baru"}
        </Button>
      </form>

      <div className="pt-4 border-t border-slate-200 text-center text-sm text-slate-600">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke halaman masuk</span>
        </Link>
      </div>
    </div>
  );
}
