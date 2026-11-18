import { useState } from "react";
import { FormattedNumberInput } from "@/components/ui/FormattedNumberInput";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import {
  DEFAULT_GOLD_PRICE_PER_GRAM,
  ZAKAT_GOLD_NISAB_GRAMS,
} from "@/lib/zakat/constants";
import { ZakatFieldGroup } from "../ZakatFieldGroup";
import { ZakatHaulCheckbox } from "../ZakatHaulCheckbox";
import { ZakatFormActions } from "../ZakatFormActions";

export function ZakatEmasForm({
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!(Number(values.jumlahGram) > 0)) {
      errs.jumlahGram = "Jumlah gram emas wajib diisi lebih dari 0";
    }
    if (!(Number(values.hargaPerGram) > 0)) {
      errs.hargaPerGram = "Harga emas per gram wajib diisi lebih dari 0";
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
          Zakat Emas
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Nisab zakat emas adalah {ZAKAT_GOLD_NISAB_GRAMS} gram dengan kadar 2,5%, ditunaikan setelah kepemilikan genap 1 tahun (haul).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ZakatFieldGroup
          id="jumlahGram"
          label="Jumlah simpanan emas yang dimiliki"
          error={errors.jumlahGram}
        >
          <FormattedNumberInput
            id="jumlahGram"
            suffix="gram"
            value={values.jumlahGram}
            onChange={(val) => handleFieldChange("jumlahGram", val)}
            placeholder="0"
            error={errors.jumlahGram}
          />
        </ZakatFieldGroup>

        <ZakatFieldGroup
          id="hargaPerGram"
          label="Harga acuan emas per gram"
          helperText="Disesuaikan dengan harga pasar saat perhitungan"
          error={errors.hargaPerGram}
        >
          <CurrencyInput
            id="hargaPerGram"
            value={values.hargaPerGram || DEFAULT_GOLD_PRICE_PER_GRAM}
            onChange={(val) => handleFieldChange("hargaPerGram", val)}
            placeholder="0"
          />
        </ZakatFieldGroup>
      </div>

      <ZakatHaulCheckbox
        id="emas-haul"
        checked={values.isHaulMet}
        onChange={(val) => onChange("isHaulMet", val)}
        label="Emas telah dimiliki selama 1 tahun penuh (haul)"
      />

      <ZakatFormActions onReset={handleReset} />
    </form>
  );
}
