"use client";

import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { Textarea } from "@/components/ui/Textarea";
import { AnonymousCheckbox } from "@/components/donation/AnonymousCheckbox";
import { cn } from "@/lib/utils";
import { sanitizeName, sanitizePhone, sanitizeEmail, sanitizePrayer } from "@/lib/security";

export function ZakatMuzakkiSection({
  isAnonymous,
  setIsAnonymous,
  muzakkiName,
  setMuzakkiName,
  muzakkiPhone,
  setMuzakkiPhone,
  muzakkiEmail,
  setMuzakkiEmail,
  isEmailLocked = false,
  muzakkiNpwp,
  setMuzakkiNpwp,
  prayer,
  setPrayer,
  errors = {},
  setErrors,
}) {
  const clearError = (field) => {
    if (setErrors && errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-slate-900">
          Data identitas muzakki
        </h3>
        <p className="text-sm font-normal text-slate-600">
          Identitas diperlukan untuk penerbitan kuitansi zakat resmi yayasan.
        </p>
      </div>

      <AnonymousCheckbox
        id="muzakki-anonymous"
        checked={isAnonymous}
        onChange={setIsAnonymous}
      />

      <FormField
        label="Nama lengkap muzakki"
        required
        error={errors.muzakkiName}
      >
        <Input
          value={muzakkiName}
          onChange={(e) => {
            setMuzakkiName(sanitizeName(e.target.value));
            clearError("muzakkiName");
          }}
          placeholder="Masukkan nama lengkap sesuai KTP"
          className="h-11 text-sm font-normal"
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <FormField
          label="Alamat email aktif"
          required
          error={errors.muzakkiEmail}
        >
          <Input
            type="email"
            isLocked={isEmailLocked}
            lockedNotice="Email terisi otomatis dari akun Anda. Silakan sesuaikan lewat profil."
            tabIndex={isEmailLocked ? -1 : undefined}
            value={muzakkiEmail}
            onChange={(e) => {
              if (!isEmailLocked) {
                setMuzakkiEmail(sanitizeEmail(e.target.value));
                clearError("muzakkiEmail");
              }
            }}
            placeholder="nama@email.com"
            className="h-11 text-sm font-normal"
          />
        </FormField>

        <FormField
          label="Nomor telepon / WhatsApp (opsional)"
          error={errors.muzakkiPhone}
        >
          <Input
            type="tel"
            inputMode="tel"
            value={muzakkiPhone}
            onChange={(e) => {
              setMuzakkiPhone(sanitizePhone(e.target.value));
              clearError("muzakkiPhone");
            }}
            placeholder="081234567890"
            className="h-11 text-sm font-normal"
          />
        </FormField>
      </div>

      <FormField
        label="NPWP / NIK (opsional)"
        hint="Untuk bukti pengurang pajak penghasilan SPT tahunan."
      >
        <Input
          value={muzakkiNpwp}
          onChange={(e) => setMuzakkiNpwp(e.target.value.replace(/[^0-9.-]/g, "").slice(0, 20))}
          placeholder="Contoh: 01.234.567.8-901.000 atau NIK 16 digit"
          className="h-11 text-sm font-normal"
        />
      </FormField>

      <FormField label="Doa atau pesan kebaikan (opsional)">
        <Textarea
          value={prayer}
          onChange={(e) => setPrayer(sanitizePrayer(e.target.value))}
          placeholder="Tuliskan doa atau permohonan kebaikan Anda..."
          rows={3}
          className="text-sm font-normal resize-none"
        />
      </FormField>
    </div>
  );
}
