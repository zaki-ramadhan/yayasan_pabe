"use client";

import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { DonorSalutationPicker } from "@/components/zakat/DonorSalutationPicker";
import { sanitizeName, sanitizePhone, sanitizeEmail, sanitizePrayer } from "@/lib/security";

export function ZakatMuzakkiSection({
  salutation,
  setSalutation,
  isAnonymous,
  setIsAnonymous,
  muzakkiName,
  setMuzakkiName,
  muzakkiPhone,
  setMuzakkiPhone,
  muzakkiEmail,
  setMuzakkiEmail,
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
        <h3 className="text-base font-medium text-slate-800">
          Data identitas muzakki
        </h3>
        <p className="text-sm font-normal text-slate-500">
          Identitas diperlukan untuk penerbitan kuitansi dan Bukti Setor Zakat (BSZ) resmi.
        </p>
      </div>

      {/* Opsi Hamba Allah */}
      <div className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50/70">
        <Checkbox
          id="muzakki-anonymous"
          checked={isAnonymous}
          onCheckedChange={(checked) => {
            const val = Boolean(checked);
            setIsAnonymous(val);
            if (val) clearError("muzakkiName");
          }}
        />
        <label
          htmlFor="muzakki-anonymous"
          className="text-sm font-medium text-slate-700 cursor-pointer select-none"
        >
          Tunaikan sebagai Hamba Allah (nama disamarkan pada rekap publik)
        </label>
      </div>

      {/* Sapaan */}
      {!isAnonymous && (
        <DonorSalutationPicker
          selectedSalutation={salutation}
          onSelect={setSalutation}
        />
      )}

      {/* Nama Lengkap */}
      {!isAnonymous && (
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
      )}

      {/* No HP & Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <FormField
          label="Nomor WhatsApp"
          required
          error={errors.muzakkiPhone}
          caption="Bukti setor dan invoice akan dikirim ke nomor ini."
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

        <FormField
          label="Alamat email"
          error={errors.muzakkiEmail}
          caption="Opsional, untuk salinan kuitansi digital."
        >
          <Input
            type="email"
            value={muzakkiEmail}
            onChange={(e) => {
              setMuzakkiEmail(sanitizeEmail(e.target.value));
              clearError("muzakkiEmail");
            }}
            placeholder="nama@email.com"
            className="h-11 text-sm font-normal"
          />
        </FormField>
      </div>

      {/* NPWP / NIK untuk BSZ Pengurang Pajak */}
      <FormField
        label="Nomor Pokok Wajib Pajak (NPWP / NIK)"
        caption="Opsional. Diperlukan jika Anda memerlukan Bukti Setor Zakat (BSZ) untuk pengurang Penghasilan Kena Pajak (PKP) pada SPT tahunan."
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
        caption="Doa Anda akan diamini oleh pengurus yayasan dan para mustahik binaan."
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

