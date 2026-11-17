"use client";

import { CheckIcon as Check } from "@solar-icons/react/line-duotone/check";
import { DangerCircleIcon as AlertCircle } from "@solar-icons/react/line-duotone/danger-circle";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

function GoogleSvgIcon({ className = "w-7 h-7" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function FacebookSvgIcon({ className = "w-7 h-7" }) {
  return (
    <svg
      className={`${className} fill-[#1877F2]`}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

/**
 * Komponen tampilan verifikasi login OAuth (Google / Facebook)
 * Menampilkan ikon provider dengan lingkaran loading berputar, teks utama (maksimal font-medium), dan sub-teks simpel.
 *
 * @param {object} props
 * @param {"google"|"facebook"|"social"} [props.provider="google"] - Provider OAuth
 * @param {"processing"|"success"|"error"} [props.status="processing"] - Status autentikasi
 * @param {string} [props.title] - Teks utama kustom
 * @param {string} [props.subtitle] - Sub-teks kustom
 * @param {string} [props.errorMessage] - Pesan detail jika status error
 */
export function AuthVerificationSpinner({
  provider = "google",
  status = "processing",
  title,
  subtitle,
  errorMessage,
}) {
  const normProvider = (provider || "google").toLowerCase();
  const isGoogle = normProvider === "google";
  const isFacebook = normProvider === "facebook" || normProvider === "fb";

  const defaultTitle =
    status === "success"
      ? "Autentikasi berhasil"
      : status === "error"
      ? "Autentikasi belum selesai"
      : isGoogle
      ? "Menghubungkan akun Google..."
      : isFacebook
      ? "Menghubungkan akun Facebook..."
      : "Menghubungkan akun Anda...";

  const defaultSubtitle =
    status === "success"
      ? "Mengalihkan Anda ke portal yayasan..."
      : status === "error"
      ? errorMessage || "Gagal memproses autentikasi. Silakan coba kembali."
      : "Mohon tunggu sejenak, kami sedang menyiapkan sesi Anda.";

  const displayTitle = title || defaultTitle;
  const displaySubtitle = subtitle || defaultSubtitle;

  return (
    <div className="min-h-screen bg-slate-50/70 flex items-center justify-center p-4 sm:p-6 select-none">
      <div className="w-full max-w-sm sm:max-w-md mx-auto text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 mx-auto">
          {status === "processing" ? (
            <>
              <svg
                className="absolute inset-0 w-full h-full animate-spin [animation-duration:1.2s]"
                viewBox="0 0 100 100"
                aria-hidden="true"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="3.5"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray="75 200"
                />
              </svg>

              <div className="relative z-10 flex items-center justify-center">
                {isGoogle ? (
                  <GoogleSvgIcon className="w-10 h-10 sm:w-11 sm:h-11" />
                ) : isFacebook ? (
                  <FacebookSvgIcon className="w-10 h-10 sm:w-11 sm:h-11" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-emerald-600" />
                )}
              </div>
            </>
          ) : status === "success" ? (
            <div className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 mx-auto">
              <div className="absolute inset-0 rounded-full border-[3px] border-emerald-500 bg-emerald-50/40 animate-in zoom-in-95 duration-200" />
              <div className="relative z-10 flex items-center justify-center text-emerald-600">
                <Check className="w-9 h-9 sm:w-10 sm:h-10 stroke-[2.5]" />
              </div>
            </div>
          ) : (
            <div className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 mx-auto">
              <div className="absolute inset-0 rounded-full border-[3px] border-rose-300 bg-rose-50/50 animate-in zoom-in-95 duration-200" />
              <div className="relative z-10 flex items-center justify-center text-rose-600">
                <AlertCircle className="w-9 h-9 sm:w-10 sm:h-10 stroke-[2]" />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-1.5 px-2">
          <h1 className="text-lg sm:text-xl font-medium text-slate-900 tracking-tight leading-snug">
            {displayTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed max-w-xs sm:max-w-sm mx-auto">
            {displaySubtitle}
          </p>
        </div>

        {status === "error" && (
          <div className="pt-2 max-w-xs mx-auto animate-in fade-in duration-200">
            <Link href="/login" className="block">
              <Button
                variant="outline"
                className="w-full text-xs sm:text-sm font-medium h-10 border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Kembali ke Halaman Masuk
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

