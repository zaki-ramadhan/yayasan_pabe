/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { FIELD_LIMITS } from "@/constants/fieldValidationLimits";
import { SocialAuthGroup } from "@/components/auth/SocialAuthGroup";
import { AuthFormHeader } from "@/components/auth/AuthFormHeader";
import { AuthNoticeBanner } from "@/components/auth/AuthNoticeBanner";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { AuthPasswordInput } from "@/components/auth/AuthPasswordInput";
import { ForgotPasswordDialog } from "@/components/auth/ForgotPasswordDialog";
import { AccountNotActivatedAlert } from "@/components/auth/AccountNotActivatedAlert";
import { TurnstileWidget } from "@/components/shared/TurnstileWidget";
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

export function LoginForm({ siteKey }) {
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
  const [unactivatedEmail, setUnactivatedEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef(null);
  const handledErrorRef = useRef(false);
  const handledNoticeRef = useRef(false);
  const handledVerifiedRef = useRef(false);

  // Safely restore remembered identifier on client mount without hydration mismatch
  useEffect(() => {
    const remembered = getRememberedIdentifier();
    if (remembered) {
      setIdentifier(remembered);
      setRememberMe(true);
    }
  }, []);

  // Submit button is disabled if required fields are incomplete, invalid, or turnstile pending
  const isSubmitDisabled =
    !identifier.trim() ||
    identifier.trim().length < 3 ||
    !password.trim() ||
    password.length < 6 ||
    Boolean(errors.identifier || errors.password) ||
    !turnstileToken;

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
    if (handledVerifiedRef.current) return;
    const verifiedParam = searchParams.get("verified");
    const activationErr = searchParams.get("activationError");

    if (verifiedParam === "true") {
      handledVerifiedRef.current = true;
      toast.success("Email Anda berhasil diverifikasi! Akun telah aktif, silakan masuk.");
    } else if (activationErr) {
      handledVerifiedRef.current = true;
      toast.error(activationErr);
    }
  }, [searchParams]);

  useEffect(() => {
    if (handledErrorRef.current) return;
    const errorParam = searchParams.get("error");
    if (errorParam) {
      handledErrorRef.current = true;
      const errorMessages = {
        access_denied: "Persetujuan akun dibatalkan.",
        no_code_provided: "Kode autentikasi tidak ditemukan.",
        oauth_credentials_missing: "Layanan masuk akun pihak ketiga sedang tidak tersedia.",
        token_exchange_failed: "Gagal menghubungkan akun. Silakan coba lagi.",
        userinfo_fetch_failed: "Gagal mengambil data profil akun.",
        no_email_provided: "Akun tidak menyediakan alamat email.",
        internal_oauth_error: "Terjadi gangguan sistem saat menghubungkan akun.",
        fb_missing_app_id: "Layanan masuk Facebook sedang tidak tersedia.",
        fb_cancelled: "Persetujuan akun Facebook dibatalkan.",
        fb_error: "Autentikasi Facebook mengalami kendala atau ditolak.",
        fb_state_mismatch: "Sesi validasi keamanan kedaluwarsa. Silakan coba lagi.",
        fb_token_failed: "Gagal memverifikasi akun Facebook. Silakan coba lagi.",
        fb_profile_failed: "Gagal mengambil profil akun dari Facebook.",
        fb_internal_error: "Terjadi gangguan sistem saat memproses login Facebook.",
      };
      toast.error(errorMessages[errorParam] || `Gagal login: ${errorParam}`);
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors = {};
    const cleanId = stripEmojis(identifier).trim();
    if (!cleanId) {
      newErrors.identifier = "Email atau nama pengguna wajib diisi.";
    } else if (cleanId.length < 3) {
      newErrors.identifier = "Email atau nama pengguna minimal 3 karakter.";
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
        turnstileToken,
      });

      setIsLoading(false);
      setUnactivatedEmail("");
      const isStaff = Boolean(user?.role && user.role !== USER_ROLES.DONOR);

      let finalTarget = "/donatur/dashboard";
      if (isStaff) {
        // Akun staf/admin: Selalu arahkan ke admin panel.
        // Jika ada tujuan spesifik ke sub-halaman admin (misal /admin/transaksi), hormati rute tersebut.
        const isAdminSubpath = redirectUrl && (redirectUrl === "/admin" || redirectUrl.startsWith("/admin/"));
        finalTarget = isAdminSubpath ? redirectUrl : "/admin";
      } else {
        // Akun donatur: Jika query redirect menuju rute admin, arahkan ke dasbor donatur
        const isAdminPath = redirectUrl && (redirectUrl === "/admin" || redirectUrl.startsWith("/admin/"));
        finalTarget = (isAdminPath || !redirectUrl) ? "/donatur/dashboard" : redirectUrl;
      }

      router.push(finalTarget);
    } catch (err) {
      setIsLoading(false);
      turnstileRef.current?.reset();
      setTurnstileToken("");
      if (err.code === "ACCOUNT_NOT_ACTIVATED") {
        setUnactivatedEmail(err.email || identifier.trim());
        toast.error(err.message || "Akun Anda belum aktif. Silakan lakukan aktivasi email.");
        return;
      }
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
        subtitle="Masuk untuk melanjutkan ke akun Anda."
      />

      {/* Unactivated Account Warning Alert */}
      {unactivatedEmail && (
        <AccountNotActivatedAlert
          email={unactivatedEmail}
          onClear={() => setUnactivatedEmail("")}
        />
      )}

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
          label="Email atau nama pengguna"
          htmlFor="identifier"
          required
          error={errors.identifier}
        >
          <Input
            id="identifier"
            type="text"
            placeholder="nama@email.com atau nama pengguna"
            value={identifier}
            minLength={FIELD_LIMITS.NAME.min}
            maxLength={FIELD_LIMITS.EMAIL.max}
            onChange={(e) => {
              const clean = stripEmojis(e.target.value).slice(0, FIELD_LIMITS.EMAIL.max);
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

        {/* Cloudflare Turnstile Anti-Bot Verification */}
        <FormField label="Verifikasi keamanan" htmlFor="cf-turnstile-login">
          <TurnstileWidget
            id="cf-turnstile-login"
            ref={turnstileRef}
            siteKey={siteKey}
            action="login"
            size="flexible"
            className="w-full"
            onSuccess={(token) => setTurnstileToken(token)}
            onError={() => setTurnstileToken("")}
            onExpire={() => setTurnstileToken("")}
          />
        </FormField>

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
      <div className="pt-2 text-center text-sm text-slate-600">
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
