"use client";

import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { cn } from "@/lib/utils";

/**
 * Sub-komponen modular: Bidang identitas dasar pelamar (Nama, Email, WhatsApp).
 * Menerapkan SRP & konsistensi token UI terstandarisasi (h-10, text-sm, font-normal).
 * Mengunci nama dan email jika disinkronkan dari akun terautentikasi (seperti form relawan).
 *
 * @param {object} props
 */
export function CareerApplicantPersonalFields({
  formData,
  onChange,
  onBlur,
  onPhoneChange,
  isNameLocked = false,
  isEmailLocked = false,
  errors = {},
}) {
  return (
    <div className="space-y-4">
      {/* 1. Nama Lengkap */}
      <FormField
        label="Nama lengkap"
        required
        error={errors.fullName}
        hint={
          isNameLocked
            ? "Nama lengkap disinkronkan dari profil akun Anda. Ubah di pengaturan profil jika ada kekeliruan."
            : undefined
        }
      >
        <Input
          type="text"
          placeholder="Nama lengkap sesuai KTP"
          value={formData.fullName}
          maxLength={60}
          readOnly={isNameLocked}
          onChange={(e) => {
            if (isNameLocked) return;
            onChange("fullName", e.target.value);
          }}
          onBlur={onBlur ? onBlur("fullName") : undefined}
          required
          autoComplete="name"
          className={cn(
            "h-10 text-sm font-normal",
            isNameLocked &&
              "bg-slate-100 text-slate-700 border-slate-200 cursor-not-allowed select-none focus:ring-0 focus:border-slate-200"
          )}
        />
      </FormField>

      {/* 2. Grid Email Aktif & WhatsApp */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Email aktif"
          required
          error={errors.email}
          hint={
            isEmailLocked
              ? "Email disinkronkan otomatis dari akun Anda."
              : "Notifikasi tahapan rekrutmen akan dikirim ke email ini."
          }
        >
          <Input
            type="email"
            inputMode="email"
            maxLength={100}
            spellCheck={false}
            placeholder="nama@email.com"
            value={formData.email}
            readOnly={isEmailLocked}
            onChange={(e) => {
              if (isEmailLocked) return;
              onChange("email", e.target.value);
            }}
            onBlur={onBlur ? onBlur("email") : undefined}
            required
            autoComplete="email"
            className={cn(
              "h-10 text-sm font-normal",
              isEmailLocked &&
                "bg-slate-100 text-slate-700 border-slate-200 cursor-not-allowed select-none focus:ring-0 focus:border-slate-200"
            )}
          />
        </FormField>

        <FormField
          label="Nomor WhatsApp aktif"
          required
          error={errors.phone}
          hint="Digunakan untuk koordinasi wawancara & tes."
        >
          <Input
            type="tel"
            inputMode="numeric"
            maxLength={15}
            placeholder="081234567890"
            value={formData.phone}
            onChange={onPhoneChange}
            onBlur={onBlur ? onBlur("phone") : undefined}
            required
            autoComplete="tel"
            className="h-10 text-sm font-normal"
          />
        </FormField>
      </div>
    </div>
  );
}
