import { useState } from "react";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { FormattedNumberInput } from "@/components/ui/FormattedNumberInput";
import { getGoldPriceError, ZAKAT_INPUT_LIMITS } from "@/lib/zakat/constants";
import { ZakatFieldGroup } from "../ZakatFieldGroup";
import { ZakatGoldPriceField } from "../ZakatGoldPriceField";
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
    const errs = {};
    if (!hasValidInput) {
      errs.aktivaLancar = "Masukkan nilai aktiva lancar atau laba usaha berjalan";
    }
    const pct = Number(values.persenKepemilikan ?? 100);
    if (pct < ZAKAT_INPUT_LIMITS.MIN_OWNERSHIP_PERCENT || pct > ZAKAT_INPUT_LIMITS.MAX_OWNERSHIP_PERCENT) {
      errs.persenKepemilikan = "Persentase kepemilikan harus antara 1% sampai 100%";
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
          required
          helperText="Kas, rekening bank, piutang lancar, dan persediaan"
          error={errors.aktivaLancar}
        >
          <CurrencyInput
            id="aktivaLancar"
            value={values.aktivaLancar}
            onChange={(val) => handleFieldChange("aktivaLancar", val)}
            min={0}
            max={ZAKAT_INPUT_LIMITS.MAX_CURRENCY}
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
            min={0}
            max={ZAKAT_INPUT_LIMITS.MAX_CURRENCY}
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
            min={0}
            max={ZAKAT_INPUT_LIMITS.MAX_CURRENCY}
            placeholder="0"
          />
        </ZakatFieldGroup>

        <ZakatFieldGroup
          id="persenKepemilikan"
          label="Persentase kepemilikan saham (%)"
          helperText="Default 100% jika pemilik tunggal / zakat entitas penuh"
          error={errors.persenKepemilikan}
        >
          <FormattedNumberInput
            id="persenKepemilikan"
            suffix="%"
            min={ZAKAT_INPUT_LIMITS.MIN_OWNERSHIP_PERCENT}
            max={ZAKAT_INPUT_LIMITS.MAX_OWNERSHIP_PERCENT}
            value={values.persenKepemilikan ?? 100}
            onChange={(val) => handleFieldChange("persenKepemilikan", val)}
            placeholder="100"
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

      <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-md text-xs text-blue-900 leading-relaxed">
        <strong>Ketentuan Syariat:</strong> Perhitungan zakat perusahaan merujuk pada ketentuan Muktamar Internasional I tentang Zakat (Kuwait, 1404 H) dengan nisab setara 85 gr emas dan kadar 2,5% per tahun.
      </div>

      <ZakatFormActions onReset={handleReset} />
    </form>
  );
}
