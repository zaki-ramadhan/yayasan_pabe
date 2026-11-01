"use client";

import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

/**
 * Tampilan status sukses setelah kata sandi berhasil diatur ulang.
 * Reusable untuk alur konfirmasi perubahan kredensial akun.
 */
export function ResetPasswordSuccessState({
  title = "Kata sandi berhasil diubah",
  message = "Kata sandi baru Anda telah aktif. Silakan masuk menggunakan kata sandi baru untuk melanjutkan.",
  actionText = "Masuk ke akun sekarang",
  actionHref = "/login",
}) {
  const router = useRouter();

  return (
    <div className="space-y-6 text-center py-6">
      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-6 h-6" />
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
        className="w-full h-10 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg cursor-pointer"
      >
        {actionText}
      </Button>
    </div>
  );
}
