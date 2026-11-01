"use client";

import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

/**
 * Tampilan status tautan reset tidak valid atau telah kedaluwarsa.
 * Reusable untuk state error verifikasi token URL.
 */
export function ResetPasswordInvalidState({
  title = "Tautan tidak valid",
  message = "Tautan pengaturan ulang kata sandi tidak valid atau telah kedaluwarsa. Silakan ajukan permintaan baru.",
  actionText = "Kembali ke halaman masuk",
  actionHref = "/login",
}) {
  const router = useRouter();

  return (
    <div className="space-y-6 text-center py-6">
      <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
          {message}
        </p>
      </div>
      <Button
        type="button"
        onClick={() => router.push(actionHref)}
        className="h-10 px-6 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg cursor-pointer"
      >
        {actionText}
      </Button>
    </div>
  );
}
