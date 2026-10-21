"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { ShieldCheck, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SocialAuthGroup } from "@/components/auth/SocialAuthGroup";
import { AuthFormHeader } from "@/components/auth/AuthFormHeader";
import { AuthNoticeBanner } from "@/components/auth/AuthNoticeBanner";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { AuthPasswordInput } from "@/components/auth/AuthPasswordInput";
import {
  USER_ROLES,
  loginUser,
  registerWithServer,
  getRedirectPathForRole,
  simulateSocialAuth,
  redirectToGoogleOAuth,
} from "@/services/authService";
import {
  sanitizeEmail,
  sanitizePhone,
  validateEmail,
  validatePhone,
  stripEmojis,
  validateUsername,
  containsReservedKeyword,
} from "@/lib/security";
import { cn } from "@/lib/utils";

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

  // Submit button is disabled if required fields are incomplete or invalid
  const isSubmitDisabled =
    !username.trim() ||
    username.trim().length < 3 ||
    !email.trim() ||
    !phone.trim() ||
    !password ||
    password.length < 6 ||
    !agreeTerms ||
    Boolean(errors.username || errors.email || errors.phone || errors.password || errors.agreeTerms);

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

    // 1. Username validation (Format, batas karakter, & proteksi anti-impersonation)
    const usernameResult = validateUsername(username);
    if (!usernameResult.isValid) {
      newErrors.username = usernameResult.message;
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

    // 4. Password validation
    if (!password) {
      newErrors.password = "Kata sandi wajib diisi.";
    } else if (password.length < 6) {
      newErrors.password = "Kata sandi minimal 6 karakter.";
    }

    // 5. Terms agreement
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
      toast.success("Pendaftaran berhasil! Selamat datang di Yayasan PABE.");
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
              const clean = stripEmojis(e.target.value).replace(/[^a-zA-Z0-9_.]/g, "").slice(0, 30);
              setUsername(clean);

              if (clean.length >= 3) {
                const reservedCheck = containsReservedKeyword(clean);
                if (reservedCheck.isReserved) {
                  setErrors((prev) => ({
                    ...prev,
                    username: `Nama pengguna tidak boleh mengandung istilah yang dicadangkan sistem ("${reservedCheck.matchedWord}").`,
                  }));
                  return;
                }
              }
              if (errors.username) {
                setErrors((prev) => ({ ...prev, username: undefined }));
              }
            }}
            onBlur={() => {
              if (username) {
                const res = validateUsername(username);
                if (!res.isValid) {
                  setErrors((prev) => ({ ...prev, username: res.message }));
                }
              }
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
            onBlur={() => {
              if (email) {
                const res = validateEmail(email, true);
                if (!res.valid) {
                  setErrors((prev) => ({ ...prev, email: res.error }));
                }
              }
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
            onBlur={() => {
              if (phone) {
                const res = validatePhone(phone);
                if (!res.valid) {
                  setErrors((prev) => ({ ...prev, phone: res.error }));
                }
              }
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

        {/* 4. Kata Sandi (Label internal dikelola oleh AuthPasswordInput) */}
        <AuthPasswordInput
          id="password"
          label="Kata sandi"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
          }}
          onBlur={() => {
            if (password && password.length < 6) {
              setErrors((prev) => ({ ...prev, password: "Kata sandi minimal 6 karakter." }));
            }
          }}
          placeholder="Minimal 6 karakter"
          error={errors.password}
          autoComplete="new-password"
        />

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
              <button
                type="button"
                onClick={() => setIsTermsModalOpen(true)}
                className="text-primary hover:underline font-semibold cursor-pointer inline text-left"
              >
                Ketentuan Akad &amp; Kebijakan Privasi Yayasan
              </button>
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
          disabled={isLoading || isGoogleLoading || isFacebookLoading || isSubmitDisabled}
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

      {/* Modal Interaktif: Ketentuan Akad & Kebijakan Privasi */}
      <Dialog open={isTermsModalOpen} onOpenChange={setIsTermsModalOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto p-5 sm:p-6">
          <DialogHeader className="space-y-1.5 pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
              <DialogTitle className="text-base sm:text-lg font-semibold text-slate-950">
                Ketentuan Akad &amp; Kebijakan Privasi
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs sm:text-sm text-slate-500">
              Prinsip syariat, perlindungan privasi donatur, dan tata kelola amanah Yayasan PABE.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <div className="space-y-1">
              <h5 className="font-semibold text-slate-900">1. Akad Wakalah Donasi &amp; Zakat</h5>
              <p className="text-slate-600">
                Donasi yang disalurkan melalui platform ini bersifat sukarela dan ikhlas. Donatur memberikan kuasa penuh (<em>wakalah</em>) kepada Yayasan PABE untuk mengelola, mendistribusikan, dan menyalurkan dana kepada mustahik yang berhak sesuai syariat Islam.
              </p>
            </div>

            <div className="space-y-1">
              <h5 className="font-semibold text-slate-900">2. Kerahasiaan Data Pribadi (UU PDP No. 27/2022)</h5>
              <p className="text-slate-600">
                Yayasan berkomitmen penuh melindungi data pribadi Anda. Nomor kontak, riwayat transaksi, dan profil tidak akan pernah diperjualbelikan atau disalahgunakan kepada pihak ketiga manapun.
              </p>
            </div>

            <div className="space-y-1">
              <h5 className="font-semibold text-slate-900">3. Hak Donasi Anonim (Hamba Allah)</h5>
              <p className="text-slate-600">
                Anda berhak menyamarkan identitas publik pada setiap penyaluran program. Sistem tetap mencatat transaksi secara sah dan menerbitkan e-Kwitansi resmi di akun donatur Anda.
              </p>
            </div>

            <div className="space-y-1">
              <h5 className="font-semibold text-slate-900">4. Kanal Transaksi Resmi &amp; Audit Publik</h5>
              <p className="text-slate-600">
                Pembayaran donasi diproses melalui kanal resmi berlisensi Bank Indonesia (QRIS dan Virtual Account). Laporan keuangan dan penyaluran dapat ditinjau kapan saja melalui halaman Transparansi Publik.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <Link
              href="/kebijakan-privasi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
            >
              <span>Dokumen lengkap privasi</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <Button
              type="button"
              onClick={() => {
                setAgreeTerms(true);
                setIsTermsModalOpen(false);
              }}
              className="w-full sm:w-auto h-9 px-4 rounded-lg text-xs sm:text-sm font-medium bg-primary hover:bg-primary-hover text-white cursor-pointer"
            >
              Saya Mengerti &amp; Setujui
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
