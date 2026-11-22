"use client";

import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import {
  sanitizeName,
  sanitizeEmail,
  sanitizePhone,
  sanitizeStandardText,
} from "@/lib/sanitizer";
import { AdminUserGenderSelect } from "./AdminUserGenderSelect";
import { AdminUserTitleCombobox } from "./AdminUserTitleCombobox";
import { FIELD_LIMITS } from "@/constants/fieldValidationLimits";

export function AdminUserProfileFields({
  formData,
  setFormData,
  errors,
  setErrors,
  isEdit,
}) {
  return (
    <div className="space-y-3.5">
      <FormField label="Nama lengkap" required error={errors.name}>
        <Input
          type="text"
          required
          autoComplete="name"
          minLength={FIELD_LIMITS.NAME.min}
          maxLength={FIELD_LIMITS.NAME.max}
          value={formData.name}
          onChange={(e) => {
            setFormData((prev) => ({
              ...prev,
              name: sanitizeName(e.target.value),
            }));
            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          onBlur={() =>
            setFormData((prev) => ({ ...prev, name: prev.name.trim() }))
          }
          placeholder="Contoh: Drs. H. M. Fauzan, M.Pd"
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
        <AdminUserTitleCombobox
          value={formData.title}
          onChange={(val) => {
            setFormData((prev) => ({
              ...prev,
              title: sanitizeStandardText(val, 60),
            }));
            if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
          }}
          error={errors.title}
        />

        <FormField
          label={
            formData.hasLoginAccess
              ? "Alamat email login"
              : "Alamat email (opsional)"
          }
          required={formData.hasLoginAccess}
          error={errors.email}
        >
          <Input
            type="email"
            inputMode="email"
            autoComplete="email"
            minLength={FIELD_LIMITS.EMAIL.min}
            maxLength={FIELD_LIMITS.EMAIL.max}
            spellCheck={false}
            required={formData.hasLoginAccess}
            disabled={isEdit && !formData.hasLoginAccess}
            value={formData.email}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                email: sanitizeEmail(e.target.value),
              }));
              if (errors.email)
                setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            onBlur={() =>
              setFormData((prev) => ({ ...prev, email: prev.email.trim() }))
            }
            placeholder={
              formData.hasLoginAccess ? "nama@pabe.or.id" : "nama@email.com"
            }
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
        <AdminUserGenderSelect
          value={formData.gender}
          onChange={(val) => setFormData((prev) => ({ ...prev, gender: val }))}
          error={errors.gender}
        />

        <FormField label="Nomor WhatsApp (opsional)" error={errors.phone}>
          <Input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            minLength={FIELD_LIMITS.PHONE.min}
            maxLength={FIELD_LIMITS.PHONE.max}
            value={formData.phone}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                phone: sanitizePhone(e.target.value),
              }));
            }}
            onBlur={() =>
              setFormData((prev) => ({ ...prev, phone: prev.phone.trim() }))
            }
            placeholder="081234567890"
          />
        </FormField>
      </div>
    </div>
  );
}

