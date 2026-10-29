"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";
import { RegisterTermsDialog } from "@/components/auth/RegisterTermsDialog";
import { RegisterInputFields } from "@/components/auth/RegisterInputFields";
import { SocialAuthGroup } from "@/components/auth/SocialAuthGroup";
import { AuthFormHeader } from "@/components/auth/AuthFormHeader";
import { AuthNoticeBanner } from "@/components/auth/AuthNoticeBanner";
import { AuthDivider } from "@/components/auth/AuthDivider";
import {
  loginUser,
  registerWithServer,
  getRedirectPathForRole,
  simulateSocialAuth,
  redirectToGoogleOAuth,
  redirectToFacebookOAuth,
} from "@/services/authService";
import {
  validateEmail,
  validatePhone,
  validateUsername,
} from "@/lib/security";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const handledErrorRef = useRef(false);

  const isSubmitDisabled =
    !username.trim() ||
    username.trim().length < 3 ||
    !email.trim() ||
    !phone.trim() ||
    !password ||
    password.length < 6 ||
    !agreeTerms ||
    Boolean(errors.username || errors.email || errors.phone || errors.password || errors.agreeTerms);

  const rawRedirect = searchParams.get("redirect") || searchParams.get("callbackUrl");
  const redirectUrl = rawRedirect?.startsWith("/dashboard")
    ? rawRedirect.replace(/^\/dashboard/, "/admin")
    : rawRedirect;
  const reasonParam = searchParams.get("reason");
  const isDonationRedirect = reasonParam === "donation_requires_login" || reasonParam === "auth_required";

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
        no_email_provided: "Akun Google tidak menyediakan alamat email.",
        internal_oauth_error: "Terjadi kesalahan internal pada server autentikasi.",
        fb_missing_app_id: "NEXT_PUBLIC_FACEBOOK_APP_ID belum diatur di file .env.",
        fb_cancelled: "Persetujuan akun Facebook dibatalkan.",
        fb_error: "Autentikasi Facebook mengalami kendala atau ditolak.",
        fb_state_mismatch: "Sesi validasi keamanan Facebook kedaluwarsa. Silakan coba lagi.",
        fb_token_failed: "Gagal memverifikasi token Facebook. Pastikan App Secret di Meta valid.",
        fb_profile_failed: "Gagal mengambil profil akun dari Facebook.",
        fb_internal_error: "Terjadi kesalahan sistem saat memproses pendaftaran Facebook.",
      };
      toast.error(errorMessages[errorParam] || `Gagal registrasi: ${errorParam}`);
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors = {};

    const usernameResult = validateUsername(username);
    if (!usernameResult.isValid) {
      newErrors.username = usernameResult.message;
    }

    const emailResult = validateEmail(email, true);
    if (!emailResult.valid) {
      newErrors.email = emailResult.error;
    }

    const phoneResult = validatePhone(phone);
    if (!phoneResult.valid) {
      newErrors.phone = phoneResult.error;
    }

    if (!password) {
      newErrors.password = "Kata sandi wajib diisi.";
    } else if (password.length < 6) {
      newErrors.password = "Kata sandi minimal 6 karakter.";
    }

    if (!agreeTerms) {
      newErrors.agreeTerms = "Anda harus menyetujui Ketentuan Akad & Kebijakan Privasi.";
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
      const formattedName = username
        .replace(/[._]/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

      const user = await registerWithServer({
        username: username.trim().toLowerCase(),
        name: formattedName,
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
      });

      setIsLoading(false);
      toast.success("Pendaftaran berhasil! Selamat bergabung.");
      router.push(redirectUrl || getRedirectPathForRole(user.role));
    } catch (err) {
      setIsLoading(false);
      toast.error(err.message || "Gagal mendaftarkan akun. Silakan coba lagi.");
    }
  };

  const handleGoogleSignUp = () => {
    setIsGoogleLoading(true);
    redirectToGoogleOAuth(redirectUrl || "/");
  };

  const handleFacebookSignUp = () => {
    setIsFacebookLoading(true);
    redirectToFacebookOAuth(redirectUrl || "/", "register");
  };

  return (
    <div className="space-y-6">
      <AuthFormHeader
        title="Daftar Akun Baru"
        subtitle="Lengkapi formulir singkat di bawah ini untuk membuat akun donatur."
      />

      {isDonationRedirect && (
        <AuthNoticeBanner
          title="Perlu Pendaftaran Akun"
          description="Daftar akun gratis sekarang untuk melanjutkan donasi dan mencatat e-Kwitansi resmi."
          variant="amber"
        />
      )}

      <SocialAuthGroup
        onGoogleClick={handleGoogleSignUp}
        onFacebookClick={handleFacebookSignUp}
        isGoogleLoading={isGoogleLoading}
        isFacebookLoading={isFacebookLoading}
        disabled={isLoading}
      />

      <AuthDivider />

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <RegisterInputFields
          username={username}
          setUsername={setUsername}
          email={email}
          setEmail={setEmail}
          phone={phone}
          setPhone={setPhone}
          password={password}
          setPassword={setPassword}
          agreeTerms={agreeTerms}
          setAgreeTerms={setAgreeTerms}
          errors={errors}
          setErrors={setErrors}
          onOpenTerms={() => setIsTermsModalOpen(true)}
        />

        <Button
          type="submit"
          isLoading={isLoading}
          disabled={isLoading || isGoogleLoading || isFacebookLoading || isSubmitDisabled}
          variant="primary3d"
          className="w-full h-11 rounded-lg text-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Mendaftarkan Akun..." : "Daftar Akun Baru"}
        </Button>
      </form>

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

      <RegisterTermsDialog
        isOpen={isTermsModalOpen}
        onOpenChange={setIsTermsModalOpen}
        onAccept={() => {
          setAgreeTerms(true);
          setIsTermsModalOpen(false);
        }}
      />
    </div>
  );
}
