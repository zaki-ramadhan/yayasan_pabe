"use client";

import { useState } from "react";
import { toast } from "@/hooks/useToast";
import { safeFetch } from "@/lib/safeFetch";
import { usePersistentCooldown } from "@/hooks/usePersistentCooldown";

export function AccountNotActivatedAlert({ email, onClear }) {
  const { cooldown, startCooldown, isCoolingDown } = usePersistentCooldown(
    "pabe_alert_resend_cooldown",
    60
  );
  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    if (!email || isResending || isCoolingDown) return;

    setIsResending(true);
    try {
      const res = await safeFetch("/api/auth/resend-activation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Gagal mengirim ulang email aktivasi.");
      }

      startCooldown(60);
      toast.success(data.message || "Tautan aktivasi baru telah dikirimkan ke email Anda.");
    } catch (err) {
      toast.error(err.message || "Terjadi kendala saat mengirim ulang email.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div
      role="alert"
      className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-sm space-y-3"
    >
      <div className="flex items-start gap-3">
        <svg
          className="w-5 h-5 text-amber-600 shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
        <div className="flex-1 space-y-1">
          <p className="font-semibold text-amber-950">Akun Belum Aktif</p>
          <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
            Akun Anda dengan email <strong>{email}</strong> belum diaktivasi. Silakan periksa inbox email Anda untuk mengklik tautan aktivasi.
          </p>
        </div>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="text-amber-500 hover:text-amber-800 p-1 cursor-pointer"
            aria-label="Tutup pesan peringatan"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="pt-1 flex items-center gap-3">
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending || cooldown > 0}
          className="text-xs font-semibold text-primary hover:text-primary-hover hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isResending
            ? "Mengirimkan ulang..."
            : cooldown > 0
            ? `Kirim ulang aktivasi (${cooldown}s)`
            : "Kirim ulang email aktivasi"}
        </button>
      </div>
    </div>
  );
}
