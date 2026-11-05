"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";
import { safeFetch } from "@/lib/safeFetch";
import { usePersistentCooldown } from "@/hooks/usePersistentCooldown";

export function ActivationNoticeCard() {
  const searchParams = useSearchParams();
  const rawEmail = searchParams.get("email") || "";
  const email = rawEmail.trim().toLowerCase();

  const { cooldown, startCooldown, isCoolingDown } = usePersistentCooldown(
    "pabe_resend_activation_cooldown",
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

  const getEmailProviderUrl = () => {
    if (email.endsWith("@gmail.com")) return "https://mail.google.com";
    if (email.endsWith("@yahoo.com") || email.endsWith("@ymail.com")) return "https://mail.yahoo.com";
    if (email.endsWith("@outlook.com") || email.endsWith("@hotmail.com")) return "https://outlook.live.com";
    return null;
  };

  const providerUrl = getEmailProviderUrl();

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-white border border-slate-200 rounded-xl shadow-xs text-center space-y-6">
      {/* Icon Amplop Surat Bersih */}
      <div className="mx-auto w-14 h-14 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
          />
        </svg>
      </div>

      <div className="space-y-2">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Verifikasi email akun Anda
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Tautan aktivasi telah dikirimkan ke alamat:
        </p>
        <p className="text-sm font-semibold text-slate-900 bg-slate-100 py-1.5 px-3 rounded-md inline-block break-all border border-slate-200">
          {email || "email Anda"}
        </p>
      </div>

      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed text-left bg-blue-50/60 border border-blue-100 p-3.5 rounded-lg">
        Silakan periksa kotak masuk (atau folder spam) email Anda dan klik tombol <strong>&ldquo;Aktifkan Akun Saya&rdquo;</strong> untuk menyelesaikan pendaftaran sebelum masuk.
      </p>

      <div className="space-y-3 pt-2">
        {providerUrl && (
          <a
            href={providerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg cursor-pointer transition-colors shadow-xs"
          >
            <span>Buka Inbox Email</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={handleResend}
          disabled={!email || isResending || cooldown > 0}
          className="w-full h-10 text-sm font-medium border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
        >
          {isResending
            ? "Mengirimkan ulang..."
            : cooldown > 0
            ? `Kirim ulang aktivasi (${cooldown}s)`
            : "Kirim ulang email aktivasi"}
        </Button>
      </div>

      <div className="pt-2 border-t border-slate-100">
        <Link
          href="/login"
          className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          Sudah verifikasi? <span className="text-primary hover:underline font-semibold">Masuk ke akun</span>
        </Link>
      </div>
    </div>
  );
}
