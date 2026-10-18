"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SocialAuthGroup } from "@/components/auth/SocialAuthGroup";
import { AuthFormHeader } from "@/components/auth/AuthFormHeader";
import { AuthNoticeBanner } from "@/components/auth/AuthNoticeBanner";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { USER_ROLES, loginUser, getRedirectPathForRole, simulateSocialAuth, redirectToGoogleOAuth } from "@/services/authService";
import { sanitizeEmail, sanitizePhone, validateEmail, validatePhone, stripEmojis } from "@/lib/security";
import { cn } from "@/lib/utils";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const handledErrorRef = useRef(false);

  const redirectUrl = searchParams.get("redirect") || searchParams.get("callbackUrl");
  const reasonParam = searchParams.get("reason");
  const isDonationRedirect = reasonParam === "donation_requires_login" || reasonParam === "auth_required";

  useEffect(() => {
    if (handledErrorRef.current) return;
    const errorParam = searchParams.get("error");
    if (errorParam) {
      handledErrorRef.current = true;
      const errorMessages = {
        access_denied: "Persetujuan akun Google dibatalkan.",
        no_code_provided: "Kode autentikasi Google tidak ditemukan.",
        oauth_credentials_missing: "Kredensial GOOGLE_CLIENT_SECRET belum lengkap di .env.",
        token_exchange_failed: "Gagal menukar token dengan Google. Pastikan Client Secret valid.",
        userinfo_fetch_failed: "Gagal mengambil data profil dari Google.",
        no_email_provided: "Akun Google tidak menyediakan alamat email.",
        internal_oauth_error: "Terjadi kesalahan internal pada server autentikasi.",
      };
      toast.error(errorMessages[errorParam] || `Gagal registrasi: ${errorParam}`);
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors = {};

    // 1. Username validation
    const cleanUsername = stripEmojis(username).trim();
    if (!cleanUsername) {
      newErrors.username = "Nama pengguna wajib diisi.";
    } else if (cleanUsername.length < 3) {
      newErrors.username = "Nama pengguna minimal 3 karakter.";
    } else if (cleanUsername.length > 30) {
      newErrors.username = "Nama pengguna maksimal 30 karakter.";
    } else if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      newErrors.username = "Nama pengguna hanya boleh huruf, angka, dan garis bawah (_).";
    }

    // 2. Email validation
    const emailResult = validateEmail(email, true);
    if (!emailResult.valid) {
      newErrors.email = emailResult.error;
    }

    // 3. WhatsApp phone validation
    const phoneResult = validatePhone(phone);
    if (!phoneResult.valid) {
      newErrors.phone = phoneResult.error;
    }

    // 4. Terms agreement
    if (!agreeTerms) {
      newErrors.agreeTerms = "Anda harus menyetujui Ketentuan Akad & Kebijakan Privasi.";
    }

    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      const firstError = Object.values(validationErrors)[0];
      toast.error(firstError);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const formattedName = username
        .replace(/[._]/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

      const newUser = {
        id: `USR-${Date.now()}`,
        username: username.trim().toLowerCase(),
        name: formattedName,
        email: email.trim().toLowerCase(),
        role: USER_ROLES.DONOR,
        title: "Donatur / Muzakki",
        phone: phone.trim(),
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        initials: username.substring(0, 2).toUpperCase(),
      };

      loginUser(newUser);
      setIsLoading(false);
      toast.success("Pendaftaran berhasil! Selamat datang di Yayasan PABE.");
      router.push(redirectUrl || getRedirectPathForRole(newUser.role));
    }, 700);
  };

  const handleGoogleSignUp = () => {
    setIsGoogleLoading(true);
    redirectToGoogleOAuth(redirectUrl || "/");
  };

  const handleFacebookSignUp = () => {
    setIsFacebookLoading(true);
    setTimeout(() => {
      const fbUser = simulateSocialAuth("facebook");
      loginUser(fbUser);
      setIsFacebookLoading(false);
      toast.success(`Berhasil mendaftar dengan Facebook: ${fbUser.name}`);
      router.push(redirectUrl || getRedirectPathForRole(fbUser.role));
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <AuthFormHeader
        title="Daftar Akun Baru"
        subtitle="Lengkapi formulir singkat di bawah ini untuk membuat akun donatur."
      />

      {/* Donation Auth Notice Banner */}
      {isDonationRedirect && (
        <AuthNoticeBanner
          title="Perlu Pendaftaran Akun"
          description="Daftar akun gratis sekarang untuk melanjutkan donasi dan mencatat e-Kwitansi resmi."
          variant="amber"
        />
      )}

      {/* Social Sign-up Options (Google & Facebook) */}
      <SocialAuthGroup
        onGoogleClick={handleGoogleSignUp}
        onFacebookClick={handleFacebookSignUp}
        isGoogleLoading={isGoogleLoading}
        isFacebookLoading={isFacebookLoading}
        disabled={isLoading}
      />

      {/* Centered Divider */}
      <AuthDivider />

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* 1. Nama Pengguna (Username) */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-800">
            Nama pengguna <span className="text-rose-500">*</span>
          </label>
          <Input
            type="text"
            placeholder="contoh: ahmad_fauzi"
            value={username}
            maxLength={30}
            onChange={(e) => {
              const clean = stripEmojis(e.target.value).replace(/[^a-zA-Z0-9_]/g, "").slice(0, 30);
              setUsername(clean);
              if (errors.username) setErrors((prev) => ({ ...prev, username: undefined }));
            }}
            autoComplete="username"
            className={cn(
              "h-11 text-sm text-slate-900 border-slate-300 rounded-lg transition-colors",
              errors.username && "border-rose-500 bg-rose-50/20 focus-visible:ring-rose-500"
            )}
          />
          {errors.username && (
            <p className="text-xs text-rose-600 font-medium mt-1">{errors.username}</p>
          )}
        </div>

        {/* 2. Email */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-800">
            Alamat email <span className="text-rose-500">*</span>
          </label>
          <Input
            type="email"
            placeholder="nama@email.com"
            value={email}
            maxLength={100}
            onChange={(e) => {
              const clean = sanitizeEmail(e.target.value).slice(0, 100);
              setEmail(clean);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            autoComplete="email"
            className={cn(
              "h-11 text-sm text-slate-900 border-slate-300 rounded-lg transition-colors",
              errors.email && "border-rose-500 bg-rose-50/20 focus-visible:ring-rose-500"
            )}
          />
          {errors.email && (
            <p className="text-xs text-rose-600 font-medium mt-1">{errors.email}</p>
          )}
        </div>

        {/* 3. Nomor WhatsApp Aktif */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-800">
            Nomor WhatsApp aktif <span className="text-rose-500">*</span>
          </label>
          <Input
            type="tel"
            inputMode="tel"
            placeholder="081234567890"
            value={phone}
            maxLength={15}
            onChange={(e) => {
              const clean = sanitizePhone(e.target.value).slice(0, 15);
              setPhone(clean);
              if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
            }}
            autoComplete="tel"
            className={cn(
              "h-11 text-sm text-slate-900 border-slate-300 rounded-lg transition-colors",
              errors.phone && "border-rose-500 bg-rose-50/20 focus-visible:ring-rose-500"
            )}
          />
          {errors.phone && (
            <p className="text-xs text-rose-600 font-medium mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Agree Terms Checkbox */}
        <div className="space-y-1 pt-1">
          <div className="flex items-start gap-2.5">
            <input
              type="checkbox"
              id="agree"
              checked={agreeTerms}
              onChange={(e) => {
                setAgreeTerms(e.target.checked);
                if (errors.agreeTerms) setErrors((prev) => ({ ...prev, agreeTerms: undefined }));
              }}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer shrink-0"
            />
            <div className="text-sm text-slate-700 leading-normal">
              <label htmlFor="agree" className="cursor-pointer select-none">
                Saya menyetujui{" "}
              </label>
              <Link
                href="/ketentuan-transaksi"
                className="text-primary hover:underline font-semibold"
              >
                Ketentuan Akad &amp; Kebijakan Privasi Yayasan
              </Link>
              <span>.</span>
            </div>
          </div>
          {errors.agreeTerms && (
            <p className="text-xs text-rose-600 font-medium mt-1 pl-6">{errors.agreeTerms}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading || isGoogleLoading}
          variant="primary3d"
          className="w-full h-11 rounded-lg text-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Mendaftarkan Akun..." : "Daftar Akun Baru"}
        </Button>
      </form>

      {/* Switch to Login */}
      <div className="pt-4 border-t border-slate-200 text-center text-sm text-slate-600">
        <span>Sudah memiliki akun? </span>
        <Link
          href={
            redirectUrl
              ? `/login?redirect=${encodeURIComponent(redirectUrl)}${
                  reasonParam ? `&reason=${encodeURIComponent(reasonParam)}` : ""
                }`
              : "/login"
          }
          className="font-semibold text-primary hover:underline"
        >
          Masuk di sini
        </Link>
      </div>
    </div>
  );
}
