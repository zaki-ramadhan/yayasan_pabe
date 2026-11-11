"use client";

import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
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

      {/* Opsi Hamba Allah */}
      <div className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-300 bg-slate-50">
        <Checkbox
          id="muzakki-anonymous"
          checked={isAnonymous}
          onCheckedChange={(checked) => {
            setIsAnonymous(Boolean(checked));
          }}
          className="mt-0.5"
        />
        <div className="space-y-0.5">
          <label
            htmlFor="muzakki-anonymous"
            className="text-sm font-medium text-slate-800 cursor-pointer select-none block"
          >
            Tunaikan sebagai Hamba Allah
          </label>
          <p className="text-xs text-slate-500">
            Nama disamarkan pada rekap publik, nama asli tetap tercatat di kuitansi resmi.
          </p>
        </div>
      </div>

      {/* Nama Lengkap (Selalu diisi untuk kuitansi resmi) */}
      <FormField
        label="Nama lengkap muzakki"
        required
        error={errors.muzakkiName}
        hint={
          isAnonymous
            ? "Nama disamarkan pada rekap publik."
            : "Nama lengkap sesuai KTP untuk penerbitan kuitansi zakat resmi."
        }
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

      {/* Email & Kontak Telepon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <FormField
          label="Alamat email aktif"
          required
          error={errors.muzakkiEmail}
          hint={
            isEmailLocked
              ? "Email terkunci sesuai akun login Anda. Kuitansi zakat & invoice dikirim ke sini."
              : "Kuitansi zakat resmi dan invoice akan dikirim ke email ini."
          }
        >
          <div className={isEmailLocked ? "cursor-not-allowed" : ""}>
            <Input
              type="email"
              readOnly={isEmailLocked}
              tabIndex={isEmailLocked ? -1 : undefined}
              value={muzakkiEmail}
              onChange={(e) => {
                if (!isEmailLocked) {
                  setMuzakkiEmail(sanitizeEmail(e.target.value));
                  clearError("muzakkiEmail");
                }
              }}
              placeholder="nama@email.com"
              className={cn(
                "h-11 text-sm font-normal",
                isEmailLocked && "bg-slate-100 text-slate-500 border-slate-300 focus:border-slate-300 focus:ring-0 hover:border-slate-300 pointer-events-none select-none shadow-none"
              )}
            />
          </div>
        </FormField>

        <FormField
          label="Nomor telepon / kontak (opsional)"
          error={errors.muzakkiPhone}
          hint="Opsional, untuk koordinasi & konfirmasi darurat jika diperlukan."
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

      {/* NPWP / NIK untuk Pengurang Pajak */}
      <FormField
        label="Nomor Pokok Wajib Pajak (NPWP / NIK)"
        hint="Opsional. Diperlukan jika Anda memerlukan kuitansi zakat untuk pengurang pajak penghasilan pada SPT tahunan."
      >
        <Input
          value={muzakkiNpwp}
          onChange={(e) => setMuzakkiNpwp(e.target.value.replace(/[^0-9.-]/g, "").slice(0, 20))}
          placeholder="Contoh: 01.234.567.8-901.000 atau NIK 16 digit"
          className="h-11 text-sm font-normal"
        />
      </FormField>

      {/* Doa / Catatan Khusus */}
      <FormField
        label="Doa atau hajat kebaikan"
        hint="Doa Anda akan diamini oleh pengurus yayasan dan para mustahik binaan."
      >
        <Textarea
          value={prayer}
          onChange={(e) => setPrayer(sanitizePrayer(e.target.value))}
          placeholder="Tuliskan doa atau permohonan kebaikan (opsional)..."
          rows={3}
          className="text-sm font-normal resize-none"
        />
      </FormField>
    </div>
  );
}

