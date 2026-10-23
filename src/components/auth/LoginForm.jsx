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
import { AuthPasswordInput } from "@/components/auth/AuthPasswordInput";
import { ForgotPasswordDialog } from "@/components/auth/ForgotPasswordDialog";
import {
  USER_ROLES,
  loginUser,
  loginWithServer,
  getRedirectPathForRole,
  findUserByIdentifier,
  getRememberedIdentifier,
  setRememberedIdentifier,
  simulateSocialAuth,
  redirectToGoogleOAuth,
} from "@/services/authService";
import { stripEmojis } from "@/lib/security";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const handledErrorRef = useRef(false);
  const handledNoticeRef = useRef(false);

  // Safely restore remembered identifier on client mount without hydration mismatch
  useEffect(() => {
    const remembered = getRememberedIdentifier();
    if (remembered) {
      setIdentifier(remembered);
      setRememberMe(true);
    }
  }, []);

  // Submit button is disabled if required fields are incomplete or invalid
  const isSubmitDisabled =
    !identifier.trim() ||
    identifier.trim().length < 3 ||
    !password.trim() ||
    password.length < 6 ||
    Boolean(errors.identifier || errors.password);

  const rawRedirect = searchParams.get("redirect") || searchParams.get("callbackUrl");
  const redirectUrl = rawRedirect?.startsWith("/dashboard")
    ? rawRedirect.replace(/^\/dashboard/, "/admin")
    : rawRedirect;
  const reasonParam = searchParams.get("reason");
  const isDonationRedirect = reasonParam === "donation_requires_login" || reasonParam === "auth_required";

  useEffect(() => {
    if (isDonationRedirect && !handledNoticeRef.current) {
      handledNoticeRef.current = true;
      toast.info("Silakan masuk ke akun terlebih dahulu untuk melanjutkan donasi.");
    }
  }, [isDonationRedirect]);

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
      toast.error(errorMessages[errorParam] || `Gagal login: ${errorParam}`);
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors = {};
    const cleanId = stripEmojis(identifier).trim();
    if (!cleanId) {
      newErrors.identifier = "Nama pengguna atau email wajib diisi.";
    } else if (cleanId.length < 3) {
      newErrors.identifier = "Nama pengguna atau email minimal 3 karakter.";
    } else if (cleanId.length > 100) {
      newErrors.identifier = "Input melebihi batas 100 karakter.";
    }
    if (!password.trim()) {
      newErrors.password = "Kata sandi wajib diisi.";
    } else if (password.length < 6) {
      newErrors.password = "Kata sandi minimal 6 karakter.";
    }
    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      const firstError = Object.values(validationErrors)[0];
      toast.error(firstError);
      return;
    }

    setIsLoading(true);
    try {
      if (rememberMe) {
        setRememberedIdentifier(identifier.trim());
      } else {
        setRememberedIdentifier("");
      }

      const user = await loginWithServer({
        identifier: identifier.trim(),
        password,
        rememberMe,
      });

      setIsLoading(false);
      router.push(redirectUrl || getRedirectPathForRole(user.role));
    } catch (err) {
      setIsLoading(false);
      toast.error(err.message || "Gagal masuk ke akun. Silakan periksa kembali kredensial Anda.");
    }
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    redirectToGoogleOAuth(redirectUrl || "/");
  };

  const handleFacebookLogin = () => {
    setIsFacebookLoading(true);
    setTimeout(() => {
      const fbUser = simulateSocialAuth("facebook");
      loginUser(fbUser);
      setIsFacebookLoading(false);
      router.push(redirectUrl || getRedirectPathForRole(fbUser.role));
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <AuthFormHeader
        title="Masuk ke Akun"
        subtitle="Masukkan nama pengguna/email dan kata sandi Anda untuk melanjutkan."
      />

      {/* Donation Auth Notice Banner */}
      {isDonationRedirect && (
        <AuthNoticeBanner
          title="Perlu Masuk Akun Terlebih Dahulu"
          description="Silakan masuk atau daftar akun untuk melanjutkan proses donasi dan pencatatan e-Kwitansi resmi atas nama Anda."
          variant="amber"
        />
      )}

      {/* Social Login Options (Google & Facebook) */}
      <SocialAuthGroup
        onGoogleClick={handleGoogleLogin}
        onFacebookClick={handleFacebookLogin}
        isGoogleLoading={isGoogleLoading}
        isFacebookLoading={isFacebookLoading}
        disabled={isLoading}
      />

      {/* Centered Divider */}
      <AuthDivider />

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Username or Email Input */}
        <div className="space-y-1.5">
          <label htmlFor="identifier" className="block text-sm font-semibold text-slate-800">
            Nama pengguna atau email <span className="text-rose-500">*</span>
          </label>
          <Input
            id="identifier"
            type="text"
            placeholder="nama atau email Anda"
            value={identifier}
            maxLength={100}
            onChange={(e) => {
              const clean = stripEmojis(e.target.value).slice(0, 100);
              setIdentifier(clean);
              if (errors.identifier) setErrors((prev) => ({ ...prev, identifier: undefined }));
            }}
            autoComplete="username"
            className={cn(
              "h-11 text-sm text-slate-900 border-slate-300 rounded-lg transition-colors",
              errors.identifier && "border-rose-500 bg-rose-50/20 focus-visible:ring-rose-500"
            )}
          />
          {errors.identifier && (
            <p className="text-xs text-rose-600 font-medium mt-1">{errors.identifier}</p>
          )}
        </div>

        {/* Password Input with Visibility Toggle */}
        <AuthPasswordInput
          id="password"
          label="Kata sandi"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
          }}
          placeholder="Masukkan kata sandi"
          helperText="Gunakan minimal 6 karakter."
          error={errors.password}
          autoComplete="current-password"
          extraAction={
            <button
              type="button"
              onClick={() => setIsForgotModalOpen(true)}
              className="text-sm text-primary hover:underline font-medium cursor-pointer"
            >
              Lupa kata sandi?
            </button>
          }
        />

        {/* Remember Me Checkbox */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
            />
            <span>Ingat saya</span>
          </label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading || isGoogleLoading || isSubmitDisabled}
          variant="primary3d"
          className="w-full h-11 rounded-lg text-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Memverifikasi Kredensial..." : "Masuk ke Akun"}
        </Button>
      </form>

      {/* Switch to Register */}
      <div className="pt-4 border-t border-slate-200 text-center text-sm text-slate-600">
        <span>Belum memiliki akun? </span>
        <Link
          href={
            redirectUrl
              ? `/register?redirect=${encodeURIComponent(redirectUrl)}${
                  reasonParam ? `&reason=${encodeURIComponent(reasonParam)}` : ""
                }`
              : "/register"
          }
          className="font-semibold text-primary hover:underline"
        >
          Daftar akun baru
        </Link>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordDialog
        isOpen={isForgotModalOpen}
        onOpenChange={setIsForgotModalOpen}
        initialIdentifier={identifier}
      />
    </div>
  );
}
