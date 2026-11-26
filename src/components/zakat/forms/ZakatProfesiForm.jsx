import { useState } from "react";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { getGoldPriceError, ZAKAT_INPUT_LIMITS } from "@/lib/zakat/constants";
import { ZakatFieldGroup } from "../ZakatFieldGroup";
import { ZakatGoldPriceField } from "../ZakatGoldPriceField";
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
    const errs = {};
    if (!hasValidInput) {
      errs.gaji = "Masukkan nominal gaji atau penghasilan tambahan untuk menghitung";
    }
    const goldErr = getGoldPriceError(values.hargaEmasPerGram);
    if (goldErr) {
      errs.hargaEmasPerGram = goldErr;
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
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
          Nisab setara 85 gr emas per tahun (mengikuti harga emas berlaku) dengan kadar 2,5%, ditunaikan saat menerima gaji atau penghasilan.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ZakatFieldGroup
          id="gaji"
          label="Gaji atau penghasilan rutin bulanan"
          required
          error={errors.gaji}
        >
          <CurrencyInput
            id="gaji"
            value={values.gaji}
            onChange={(val) => handleFieldChange("gaji", val)}
            min={0}
            max={ZAKAT_INPUT_LIMITS.MAX_CURRENCY}
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
            min={0}
            max={ZAKAT_INPUT_LIMITS.MAX_CURRENCY}
            placeholder="0"
          />
        </ZakatFieldGroup>

        <div className="sm:col-span-2">
          <ZakatGoldPriceField
            value={values.hargaEmasPerGram}
            onChange={(val) => handleFieldChange("hargaEmasPerGram", val)}
            error={errors.hargaEmasPerGram}
          />
        </div>
      </div>

      <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-md text-xs text-emerald-900 leading-relaxed">
        <strong>Waktu Penunaian:</strong> Zakat profesi dikeluarkan pada saat menerima penghasilan atau gaji rutin setiap bulan.
      </div>

      <ZakatFormActions onReset={handleReset} />
    </form>
  );
}
