"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { safeFetch } from "@/lib/safeFetch";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { ResetPasswordInvalidState } from "@/components/auth/ResetPasswordInvalidState";
import { ResetPasswordSuccessState } from "@/components/auth/ResetPasswordSuccessState";

/**
 * Koordinator Tampilan Reset Kata Sandi.
 * Single Responsibility: Mengorkestrasi state siklus hidup token (validating, invalid, valid, success)
 * dan mendelegasikan render ke sub-komponen modular.
 */
export function ResetPasswordCard({ token, siteKey }) {
  const [status, setStatus] = useState(token ? "validating" : "invalid");
  const [userEmail, setUserEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState(
    token ? "" : "Tautan pengaturan ulang kata sandi tidak ditemukan."
  );

  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    async function validateToken() {
      try {
        const res = await safeFetch(
          `/api/auth/reset-password?token=${encodeURIComponent(token)}`,
          {
            method: "GET",
            timeoutMs: 10000,
          }
        );
        const data = await res.json();

        if (!isMounted) return;

        if (res.ok && data.success && data.isValid) {
          setStatus("valid");
          setUserEmail(data.email || "");
        } else {
          setStatus("invalid");
          setErrorMessage(
            data.message || "Tautan reset tidak valid atau telah kedaluwarsa."
          );
        }
      } catch (err) {
        if (!isMounted) return;
        setStatus("invalid");
        setErrorMessage(
          "Gagal memvalidasi tautan reset. Silakan coba beberapa saat lagi."
        );
      }
    }

    validateToken();
    return () => {
      isMounted = false;
    };
  }, [token]);

  // 1. Tampilan Validasi Token Awal (Loading)
  if (status === "validating") {
    return (
      <div className="py-12 text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        <p className="text-sm text-slate-600">
          Memverifikasi tautan pengaturan ulang...
        </p>
      </div>
    );
  }

  // 2. Tampilan Token Tidak Valid / Kedaluwarsa
  if (status === "invalid") {
    return <ResetPasswordInvalidState message={errorMessage} />;
  }

  // 3. Tampilan Sukses Setelah Mengubah Sandi
  if (status === "success") {
    return <ResetPasswordSuccessState />;
  }

  // 4. Form Pengisian Kata Sandi Baru
  return (
    <ResetPasswordForm
      token={token}
      siteKey={siteKey}
      userEmail={userEmail}
      onSuccess={() => setStatus("success")}
    />
  );
}
