import { useState } from "react";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { ZakatFieldGroup } from "../ZakatFieldGroup";
import { ZakatFormActions } from "../ZakatFormActions";

export function ZakatProfesiForm({
  values,
  onChange,
  onSubmit,
  onReset,
}) {
  const [errors, setErrors] = useState({});

  const handleFieldChange = (field, val) => {
    onChange(field, val);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const hasValidInput = (values.gaji || 0) > 0 || (values.penghasilanLain || 0) > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hasValidInput) {
      setErrors({
        gaji: "Masukkan nominal gaji atau penghasilan tambahan untuk menghitung",
      });
      return;
    }
    setErrors({});
    onSubmit();
  };

  const handleReset = () => {
    setErrors({});
    onReset();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-medium text-slate-950">
          Zakat Profesi
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Nisab setara 85 gr emas per tahun (± Rp 17.658.502/bulan) dengan kadar 2,5%, ditunaikan saat menerima gaji atau penghasilan.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ZakatFieldGroup
          id="gaji"
          label="Gaji atau penghasilan rutin bulanan"
          error={errors.gaji}
        >
          <CurrencyInput
            id="gaji"
            value={values.gaji}
            onChange={(val) => handleFieldChange("gaji", val)}
            placeholder="0"
          />
        </ZakatFieldGroup>

        <ZakatFieldGroup
          id="penghasilanLain"
          label="Penghasilan tambahan per bulan"
          helperText="Honorarium, bonus, komisi, tunjangan, atau pendapatan halal lainnya."
        >
          <CurrencyInput
            id="penghasilanLain"
            value={values.penghasilanLain}
            onChange={(val) => handleFieldChange("penghasilanLain", val)}
            placeholder="0"
          />
        </ZakatFieldGroup>
      </div>

      <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-md text-xs text-emerald-900 leading-relaxed">
        <strong>Waktu Penunaian:</strong> Zakat profesi dikeluarkan pada saat menerima penghasilan atau gaji rutin setiap bulan.
      </div>

      <ZakatFormActions onReset={handleReset} />
    </form>
  );
}
