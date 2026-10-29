import { useState } from "react";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Button } from "@/components/ui/Button";
import { ZakatFieldGroup } from "../ZakatFieldGroup";

export function ZakatPenghasilanForm({
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
        gaji: "Masukkan nominal gaji atau penghasilan lain untuk menghitung",
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
          Zakat Penghasilan
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Hitung zakat dari penghasilan rutin maupun tambahan yang Anda terima setiap bulan.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ZakatFieldGroup
          id="gaji"
          label="Gaji per bulan"
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
          label="Penghasilan lain-lain per bulan"
          helperText="Honorarium, bonus, tunjangan, atau pendapatan halal lainnya."
        >
          <CurrencyInput
            id="penghasilanLain"
            value={values.penghasilanLain}
            onChange={(val) => handleFieldChange("penghasilanLain", val)}
            placeholder="0"
          />
        </ZakatFieldGroup>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          variant="default"
          className="rounded-md px-5 h-10 text-sm font-medium cursor-pointer"
        >
          Hitung zakat
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          className="rounded-md px-4 h-10 text-sm font-medium text-slate-700 hover:text-slate-900 border-slate-300 cursor-pointer"
        >
          Atur ulang
        </Button>
      </div>
    </form>
  );
}
