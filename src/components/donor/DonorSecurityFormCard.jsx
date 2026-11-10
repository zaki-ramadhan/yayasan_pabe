"use client";

import { useState, useCallback } from "react";
import { Loader2, ShieldCheck, CheckCircle2, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { toast } from "@/hooks/useToast";
import { useSanitizedForm } from "@/hooks/useSanitizedForm";
import { cn } from "@/lib/utils";
import { validatePasswordInput } from "@/lib/security";
import { FIELD_LIMITS } from "@/constants/fieldValidationLimits";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { logoutUser } from "@/services/authService";
import { safeFetch } from "@/lib/safeFetch";

const SECURITY_INITIAL_VALUES = {
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const EMPTY_SANITIZERS = {};

export function DonorSecurityFormCard({
  profile,
  onUpdatePassword,
  id = "section-security",
  borderless = false,
}) {
  const provider = profile?.provider || "CREDENTIALS";
  const hasPassword = profile?.hasPassword !== false;
  const isLinkedOAuth = provider !== "CREDENTIALS";
  const isGoogle = provider === "GOOGLE";
  const isPureOAuth = isLinkedOAuth && !hasPassword;

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validator = useCallback((vals) => {
    if (!vals.oldPassword) return false;
    if (!validatePasswordInput(vals.newPassword).isValid) return false;
    if (vals.newPassword === vals.oldPassword) return false;
    if (vals.newPassword !== vals.confirmPassword) return false;
    return true;
  }, []);

  const { bind, getCleanValues, setValues, isDirty, isValid } = useSanitizedForm(
    SECURITY_INITIAL_VALUES,
    EMPTY_SANITIZERS,
    validator
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const passwordData = getCleanValues();

    const newErrors = {};
    if (!passwordData.oldPassword) {
      newErrors.oldPassword = "Kata sandi saat ini wajib diisi untuk verifikasi keamanan.";
    }

    const newPassValidation = validatePasswordInput(
      passwordData.newPassword,
      "Kata sandi baru"
    );
    if (!newPassValidation.isValid) {
      newErrors.newPassword = newPassValidation.message;
    } else if (passwordData.newPassword === passwordData.oldPassword) {
      newErrors.newPassword = "Kata sandi baru harus berbeda dari kata sandi saat ini.";
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi kata sandi baru tidak cocok. Periksa kembali pengetikan Anda.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      toast({
        title: "Perhatian",
        description: firstError,
        variant: "destructive",
      });
      return;
    }
    setErrors({});

    setIsSaving(true);
    try {
      await onUpdatePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      toast({
        title: "Berhasil",
        description: "Kata sandi akun Anda berhasil diperbarui.",
        variant: "success",
      });
      setValues({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast({
        title: "Gagal Memperbarui",
        description: err.message || "Terjadi kesalahan saat memperbarui kata sandi.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section
      id={id}
      className={cn(
        "transition-all",
        borderless
          ? "bg-transparent p-0"
          : "rounded-md border border-slate-200/90 bg-sidebar p-5 sm:p-6 shadow-2xs"
      )}
    >
      <div className="pb-4 mb-5 border-b border-slate-200/80">
        <h2 className="text-base font-medium text-slate-950 leading-snug">
          Keamanan Akun
        </h2>
        <p className="text-sm font-normal text-slate-500 mt-0.5">
          {isPureOAuth
            ? "Informasi autentikasi dan status keamanan akun Anda."
            : "Ganti kata sandi untuk menjaga keamanan akun."}
        </p>
      </div>

      {isPureOAuth ? (
        <div className="max-w-xl space-y-4">
          <div className="rounded-lg border border-slate-200/90 bg-slate-50/70 p-5 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                {isGoogle ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                ) : (
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-slate-900">
                    {isGoogle ? "Akun Terhubung via Google" : `Akun Terhubung via ${provider}`}
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Terverifikasi
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Akun Anda diamankan menggunakan autentikasi Single Sign-On (SSO). Seluruh pengelolaan kata sandi, verifikasi 2 langkah, dan pemulihan akun dikelola langsung oleh pihak {isGoogle ? "Google" : provider} demi perlindungan data maksimal.
                </p>
              </div>
            </div>

            <div className="pt-3.5 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm">
              <div>
                <span className="text-slate-500 block font-normal text-xs sm:text-sm">Email Akun:</span>
                <span className="text-slate-900 font-medium text-sm break-all">{profile?.email || "-"}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-normal text-xs sm:text-sm">Metode Autentikasi:</span>
                <span className="text-slate-900 font-medium text-sm">SSO OAuth 2.0 ({isGoogle ? "Google" : provider})</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-500 leading-relaxed">
            Untuk memperbarui kata sandi atau setelan privasi, silakan kunjungi pengaturan akun {isGoogle ? "Google" : provider} Anda secara langsung.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          {isLinkedOAuth && (
            <div className="p-3.5 rounded-md border border-slate-200/90 bg-slate-50/80 flex items-start gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                {isGoogle ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <div className="space-y-0.5 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">Tertaut dengan {isGoogle ? "Google SSO" : provider}</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Aktif
                  </span>
                </div>
                <p className="text-slate-500 font-normal leading-relaxed text-sm">
                  Akun Anda dapat diakses menggunakan Google maupun kata sandi manual. Anda tetap dapat memperbarui kata sandi manual Anda di bawah ini.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <FormField label="Kata sandi saat ini" required error={errors.oldPassword}>
              <Input
                id="input-old-password"
                name="oldPassword"
                type="password"
                autoComplete="current-password"
                {...bind("oldPassword")}
                onChange={(e) => {
                  bind("oldPassword").onChange(e);
                  if (errors.oldPassword) setErrors((prev) => ({ ...prev, oldPassword: undefined }));
                }}
                placeholder="Masukkan sandi saat ini"
                minLength={FIELD_LIMITS.PASSWORD_SIMPLE.min}
                maxLength={FIELD_LIMITS.PASSWORD.max}
                className="h-9.5 text-sm sm:text-sm rounded-md bg-white font-normal"
                required
              />
            </FormField>

            <FormField label="Kata sandi baru" required error={errors.newPassword}>
              <Input
                id="input-new-password"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                {...bind("newPassword")}
                onChange={(e) => {
                  bind("newPassword").onChange(e);
                  if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: undefined }));
                }}
                placeholder="Minimal 6 karakter"
                minLength={FIELD_LIMITS.PASSWORD_SIMPLE.min}
                maxLength={FIELD_LIMITS.PASSWORD.max}
                className="h-9.5 text-sm sm:text-sm rounded-md bg-white font-normal"
                required
              />
            </FormField>

            <FormField label="Ulangi sandi baru" required error={errors.confirmPassword}>
              <Input
                id="input-confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...bind("confirmPassword")}
                onChange={(e) => {
                  bind("confirmPassword").onChange(e);
                  if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
                placeholder="Ulangi kata sandi baru"
                minLength={FIELD_LIMITS.PASSWORD_SIMPLE.min}
                maxLength={FIELD_LIMITS.PASSWORD.max}
                className="h-9.5 text-sm sm:text-sm rounded-md bg-white font-normal"
                required
              />
            </FormField>
          </div>

          <div className="pt-2 flex justify-start">
            <Button
              type="submit"
              disabled={!isDirty || !isValid || isSaving}
              variant="outline"
              className="h-9 px-4 rounded-md text-sm font-medium border-slate-300 bg-white text-slate-800 hover:bg-slate-50 gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
              <span>{isSaving ? "Menyimpan..." : "Simpan"}</span>
            </Button>
          </div>
        </form>
      )}


      {/* 2. Zona Penghapusan Akun & Privasi (UU PDP No. 27/2022) */}
      <div className="pt-6 border-t border-slate-200 mt-8 space-y-3">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-red-600">
            Hak Privasi & Penghapusan Akun
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl">
            Sesuai ketentuan UU Perlindungan Data Pribadi (UU PDP No. 27/2022), Anda berhak mengajukan penghapusan akun. Seluruh komitmen donasi rutin akan dibatalkan, foto profil di R2 dihapus, dan data transaksi disamarkan menjadi Hamba Allah demi integritas laporan audit keuangan yayasan.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => setIsDeleteDialogOpen(true)}
          className="h-9 px-3.5 text-xs sm:text-sm font-medium text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 cursor-pointer"
        >
          Hapus dan anonimkan akun saya
        </Button>
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Hapus dan anonimkan akun Anda?"
        description="Tindakan ini permanen sesuai UU PDP No. 27/2022. Komitmen donasi rutin Anda akan dibatalkan, data pribadi Anda akan dihapus, dan seluruh riwayat donasi akan dianonimkan menjadi Hamba Allah. Apakah Anda yakin?"
        confirmLabel="Ya, hapus akun"
        confirmVariant="destructive"
        isLoading={isDeletingAccount}
      />
    </section>
  );
}
