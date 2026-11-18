import { useState } from "react";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { ZakatFieldGroup } from "../ZakatFieldGroup";
import { ZakatHaulCheckbox } from "../ZakatHaulCheckbox";
import { ZakatFormActions } from "../ZakatFormActions";

export function ZakatPerdaganganForm({
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

  const hasValidInput = (values.asetLancar || 0) > 0 || (values.laba || 0) > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hasValidInput) {
      setErrors({
        asetLancar: "Masukkan nominal stok barang dagangan atau laba untuk menghitung",
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
          Zakat Perdagangan
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Nisab zakat perdagangan setara 85 gr emas dengan kadar 2,5%, ditunaikan setelah perputaran usaha genap 1 tahun (haul).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ZakatFieldGroup
          id="asetLancar"
          label="Nilai stok barang dagangan &amp; kas lancar"
          error={errors.asetLancar}
        >
          <CurrencyInput
            id="asetLancar"
            value={values.asetLancar}
            onChange={(val) => handleFieldChange("asetLancar", val)}
            placeholder="0"
          />
        </ZakatFieldGroup>

        <ZakatFieldGroup
          id="laba"
          label="Laba usaha / piutang lancar dagang"
          helperText="Keuntungan atau piutang lancar yang diharapkan tertagih"
        >
          <CurrencyInput
            id="laba"
            value={values.laba}
            onChange={(val) => handleFieldChange("laba", val)}
            placeholder="0"
          />
        </ZakatFieldGroup>

        <div className="sm:col-span-2">
          <ZakatFieldGroup
            id="utangJatuhTempo"
            label="Utang dagang jatuh tempo (pengurang)"
            helperText="Kewajiban pembayaran dagang yang jatuh tempo dalam periode berjalan"
          >
            <CurrencyInput
              id="utangJatuhTempo"
              value={values.utangJatuhTempo || 0}
              onChange={(val) => handleFieldChange("utangJatuhTempo", val)}
              placeholder="0"
            />
          </ZakatFieldGroup>
        </div>
      </div>

      <ZakatHaulCheckbox
        id="perdagangan-haul"
        checked={values.isHaulMet}
        onChange={(val) => onChange("isHaulMet", val)}
        label="Perputaran usaha dagang telah genap 1 tahun (haul)"
      />

      <ZakatFormActions onReset={handleReset} />
    </form>
  );
}
