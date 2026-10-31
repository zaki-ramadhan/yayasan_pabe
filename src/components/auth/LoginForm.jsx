/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
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
  redirectToFacebookOAuth,
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
        access_denied: "Persetujuan akun dibatalkan.",
        no_code_provided: "Kode autentikasi tidak ditemukan.",
        oauth_credentials_missing: "Kredensial OAuth belum lengkap di .env.",
        token_exchange_failed: "Gagal menukar token dengan Google. Pastikan Client Secret valid.",
        userinfo_fetch_failed: "Gagal mengambil data profil dari Google.",
        no_email_provided: "Akun tidak menyediakan alamat email.",
        internal_oauth_error: "Terjadi kesalahan internal pada server autentikasi.",
        fb_missing_app_id: "NEXT_PUBLIC_FACEBOOK_APP_ID belum diatur di file .env.",
        fb_cancelled: "Persetujuan akun Facebook dibatalkan.",
        fb_error: "Autentikasi Facebook mengalami kendala atau ditolak.",
        fb_state_mismatch: "Sesi validasi keamanan Facebook kedaluwarsa. Silakan coba lagi.",
        fb_token_failed: "Gagal memverifikasi token Facebook. Pastikan App Secret di Meta valid.",
        fb_profile_failed: "Gagal mengambil profil akun dari Facebook.",
        fb_internal_error: "Terjadi kesalahan sistem saat memproses login Facebook.",
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
      const isStaff = user?.role && user.role !== USER_ROLES.DONOR;
      let finalTarget = redirectUrl;
      if (redirectUrl) {
        const isAdminPath = redirectUrl === "/admin" || redirectUrl.startsWith("/admin/");
        if (isAdminPath && !isStaff) {
          finalTarget = "/donatur/dashboard";
        }
      }
      router.push(finalTarget || getRedirectPathForRole(user.role));
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
    redirectToFacebookOAuth(redirectUrl || "/");
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
        <FormField
          label="Nama pengguna atau email"
          htmlFor="identifier"
          required
          error={errors.identifier}
        >
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
            className="h-11 text-sm font-normal"
          />
        </FormField>

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
          isLoading={isLoading}
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
