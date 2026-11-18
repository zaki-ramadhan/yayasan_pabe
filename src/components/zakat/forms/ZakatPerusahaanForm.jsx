import { useState } from "react";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { FormattedNumberInput } from "@/components/ui/FormattedNumberInput";
import { ZakatFieldGroup } from "../ZakatFieldGroup";
import { ZakatFormActions } from "../ZakatFormActions";

export function ZakatPerusahaanForm({
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

  const hasValidInput = (values.aktivaLancar || 0) > 0 || (values.labaUsaha || 0) > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hasValidInput) {
      setErrors({
        aktivaLancar: "Masukkan nilai aktiva lancar atau laba usaha berjalan",
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
          Zakat Perusahaan
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Nisab zakat perusahaan setara 85 gr emas dengan kadar 2,5%, ditunaikan setelah penutupan buku tahunan perusahaan (1 tahun).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ZakatFieldGroup
          id="aktivaLancar"
          label="Aktiva lancar perusahaan"
          helperText="Kas, rekening bank, piutang lancar, dan persediaan"
          error={errors.aktivaLancar}
        >
          <CurrencyInput
            id="aktivaLancar"
            value={values.aktivaLancar}
            onChange={(val) => handleFieldChange("aktivaLancar", val)}
            placeholder="0"
          />
        </ZakatFieldGroup>

        <ZakatFieldGroup
          id="labaUsaha"
          label="Laba usaha berjalan"
          helperText="Laba bersih perusahaan sebelum dividen/pajak"
        >
          <CurrencyInput
            id="labaUsaha"
            value={values.labaUsaha}
            onChange={(val) => handleFieldChange("labaUsaha", val)}
            placeholder="0"
          />
        </ZakatFieldGroup>

        <ZakatFieldGroup
          id="pasivaLancar"
          label="Pasiva / kewajiban lancar (pengurang)"
          helperText="Utang jangka pendek yang jatuh tempo tahun ini"
        >
          <CurrencyInput
            id="pasivaLancar"
            value={values.pasivaLancar}
            onChange={(val) => handleFieldChange("pasivaLancar", val)}
            placeholder="0"
          />
        </ZakatFieldGroup>

        <ZakatFieldGroup
          id="persenKepemilikan"
          label="Persentase kepemilikan saham (%)"
          helperText="Default 100% jika pemilik tunggal / zakat entitas penuh"
        >
          <FormattedNumberInput
            id="persenKepemilikan"
            suffix="%"
            min={1}
            max={100}
            value={values.persenKepemilikan ?? 100}
            onChange={(val) => handleFieldChange("persenKepemilikan", val)}
            placeholder="100"
          />
        </ZakatFieldGroup>
      </div>

      <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-md text-xs text-blue-900 leading-relaxed">
        <strong>Ketentuan Syariat:</strong> Perhitungan zakat perusahaan merujuk pada ketentuan Muktamar Internasional I tentang Zakat (Kuwait, 1404 H) dengan nisab setara 85 gr emas dan kadar 2,5% per tahun.
      </div>

      <ZakatFormActions onReset={handleReset} />
    </form>
  );
}
