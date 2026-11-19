"use client";

import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { cn } from "@/lib/utils";
import { FIELD_LIMITS } from "@/constants/fieldValidationLimits";

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
      <FormField label="Nama lengkap" required error={errors.fullName}>
        <Input
          type="text"
          placeholder="Nama lengkap sesuai KTP"
          value={formData.fullName}
          minLength={FIELD_LIMITS.NAME.min}
          maxLength={FIELD_LIMITS.NAME.max}
          isLocked={isNameLocked}
          lockedNotice="Nama terisi otomatis dari akun Anda. Silakan sesuaikan lewat profil."
          onChange={(e) => {
            if (isNameLocked) return;
            onChange("fullName", e.target.value);
          }}
          onBlur={onBlur ? onBlur("fullName") : undefined}
          required
          autoComplete="name"
          className="h-10 text-sm font-normal"
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Email aktif"
          required
          error={errors.email}
        >
          <Input
            type="email"
            inputMode="email"
            minLength={FIELD_LIMITS.EMAIL.min}
            maxLength={FIELD_LIMITS.EMAIL.max}
            spellCheck={false}
            placeholder="nama@email.com"
            value={formData.email}
            isLocked={isEmailLocked}
            lockedNotice="Email terisi otomatis dari akun Anda. Silakan sesuaikan lewat profil."
            onChange={(e) => {
              if (isEmailLocked) return;
              onChange("email", e.target.value);
            }}
            onBlur={onBlur ? onBlur("email") : undefined}
            required
            autoComplete="email"
            className="h-10 text-sm font-normal"
          />
        </FormField>

        <FormField
          label="Nomor WhatsApp"
          required
          error={errors.phone}
        >
          <Input
            type="tel"
            inputMode="tel"
            minLength={FIELD_LIMITS.PHONE.min}
            maxLength={FIELD_LIMITS.PHONE.max}
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
