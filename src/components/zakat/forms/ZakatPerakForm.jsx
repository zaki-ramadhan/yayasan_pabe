import { useState } from "react";
import { FormattedNumberInput } from "@/components/ui/FormattedNumberInput";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import {
  ZAKAT_INPUT_LIMITS,
  ZAKAT_SILVER_NISAB_GRAMS,
} from "@/lib/zakat/constants";
import { ZakatFieldGroup } from "../ZakatFieldGroup";
import { ZakatHaulCheckbox } from "../ZakatHaulCheckbox";
import { ZakatFormActions } from "../ZakatFormActions";

export function ZakatPerakForm({
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
      errs.jumlahGram = "Jumlah gram perak wajib diisi lebih dari 0";
    }
    const silverPrice = Number(values.hargaPerGram || 0);
    if (!(silverPrice > 0)) {
      errs.hargaPerGram = "Harga perak per gram wajib diisi lebih dari 0";
    } else if (silverPrice < ZAKAT_INPUT_LIMITS.MIN_SILVER_PRICE_PER_GRAM) {
      errs.hargaPerGram = "Harga perak minimal Rp 1.000 per gram";
    } else if (silverPrice > ZAKAT_INPUT_LIMITS.MAX_SILVER_PRICE_PER_GRAM) {
      errs.hargaPerGram = "Harga perak maksimal Rp 1.000.000 per gram";
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
          Zakat Perak
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Nisab zakat perak adalah {ZAKAT_SILVER_NISAB_GRAMS} gram dengan kadar 2,5%, ditunaikan setelah kepemilikan genap 1 tahun (haul).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ZakatFieldGroup
          id="jumlahGramPerak"
          label="Jumlah simpanan perak yang dimiliki"
          required
          error={errors.jumlahGram}
        >
          <FormattedNumberInput
            id="jumlahGramPerak"
            suffix="gram"
            value={values.jumlahGram}
            onChange={(val) => handleFieldChange("jumlahGram", val)}
            min={0}
            max={ZAKAT_INPUT_LIMITS.MAX_WEIGHT_GRAMS}
            placeholder="0"
            error={errors.jumlahGram}
          />
        </ZakatFieldGroup>

        <ZakatFieldGroup
          id="hargaPerGramPerak"
          label="Harga acuan perak per gram"
          required
          helperText={
            <>
              Disesuaikan dengan harga pasar saat ini. Cek referensi di{" "}
              <a
                href="https://www.logammulia.com/id"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-medium hover:underline"
              >
                Logam Mulia Antam
              </a>
              .
            </>
          }
          error={errors.hargaPerGram}
        >
          <CurrencyInput
            id="hargaPerGramPerak"
            value={values.hargaPerGram ?? 0}
            onChange={(val) => handleFieldChange("hargaPerGram", val)}
            min={0}
            max={ZAKAT_INPUT_LIMITS.MAX_SILVER_PRICE_PER_GRAM}
            placeholder="Contoh: 20.000"
          />
        </ZakatFieldGroup>
      </div>

      <ZakatHaulCheckbox
        id="perak-haul"
        checked={values.isHaulMet}
        onChange={(val) => onChange("isHaulMet", val)}
        label="Perak telah dimiliki selama 1 tahun penuh (haul)"
      />

      <ZakatFormActions onReset={handleReset} />
    </form>
  );
}
