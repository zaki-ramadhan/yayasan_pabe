import { useState } from "react";
import { FormattedNumberInput } from "@/components/ui/FormattedNumberInput";
import { getGoldPriceError, ZAKAT_GOLD_NISAB_GRAMS, ZAKAT_INPUT_LIMITS } from "@/lib/zakat/constants";
import { ZakatFieldGroup } from "../ZakatFieldGroup";
import { ZakatGoldPriceField } from "../ZakatGoldPriceField";
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
    const goldErr = getGoldPriceError(values.hargaPerGram);
    if (goldErr) {
      errs.hargaPerGram = goldErr;
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
          required
          error={errors.jumlahGram}
        >
          <FormattedNumberInput
            id="jumlahGram"
            suffix="gram"
            value={values.jumlahGram}
            onChange={(val) => handleFieldChange("jumlahGram", val)}
            min={0}
            max={ZAKAT_INPUT_LIMITS.MAX_WEIGHT_GRAMS}
            placeholder="0"
            error={errors.jumlahGram}
          />
        </ZakatFieldGroup>

        <ZakatGoldPriceField
          id="hargaPerGram"
          value={values.hargaPerGram}
          onChange={(val) => handleFieldChange("hargaPerGram", val)}
          error={errors.hargaPerGram}
        />
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
