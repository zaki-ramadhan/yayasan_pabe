import { useState } from "react";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Button } from "@/components/ui/button";
import { ZakatFieldGroup } from "../ZakatFieldGroup";
import { ZakatHaulCheckbox } from "../ZakatHaulCheckbox";

export function ZakatMaalForm({
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

  const totalAssets =
    (values.uangTunaiTabungan || 0) +
    (values.deposito || 0) +
    (values.investasi || 0) +
    (values.piutang || 0) +
    (values.hartaLain || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (totalAssets <= 0) {
      setErrors({
        uangTunaiTabungan: "Masukkan setidaknya salah satu nilai aset atau simpanan",
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
          Zakat Maal
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Hitung zakat atas harta yang Anda miliki setelah dikurangi kewajiban yang jatuh tempo dan telah memenuhi nisab serta haul.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ZakatFieldGroup
          id="uangTunaiTabungan"
          label="Uang tunai & tabungan"
          error={errors.uangTunaiTabungan}
        >
          <CurrencyInput
            id="uangTunaiTabungan"
            value={values.uangTunaiTabungan}
            onChange={(val) => handleFieldChange("uangTunaiTabungan", val)}
            placeholder="0"
          />
        </ZakatFieldGroup>

        <ZakatFieldGroup id="deposito" label="Deposito / simpanan">
          <CurrencyInput
            id="deposito"
            value={values.deposito}
            onChange={(val) => handleFieldChange("deposito", val)}
            placeholder="0"
          />
        </ZakatFieldGroup>

        <ZakatFieldGroup id="investasi" label="Investasi yang termasuk objek zakat">
          <CurrencyInput
            id="investasi"
            value={values.investasi}
            onChange={(val) => handleFieldChange("investasi", val)}
            placeholder="0"
          />
        </ZakatFieldGroup>

        <ZakatFieldGroup id="piutang" label="Piutang yang dapat ditagih">
          <CurrencyInput
            id="piutang"
            value={values.piutang}
            onChange={(val) => handleFieldChange("piutang", val)}
            placeholder="0"
          />
        </ZakatFieldGroup>

        <ZakatFieldGroup id="hartaLain" label="Harta zakat lainnya">
          <CurrencyInput
            id="hartaLain"
            value={values.hartaLain}
            onChange={(val) => handleFieldChange("hartaLain", val)}
            placeholder="0"
          />
        </ZakatFieldGroup>

        <ZakatFieldGroup id="utangJatuhTempo" label="Utang jatuh tempo ≤ 1 tahun">
          <CurrencyInput
            id="utangJatuhTempo"
            value={values.utangJatuhTempo}
            onChange={(val) => handleFieldChange("utangJatuhTempo", val)}
            placeholder="0"
          />
        </ZakatFieldGroup>
      </div>

      <ZakatHaulCheckbox
        id="maal-haul"
        checked={values.isHaulMet}
        onChange={(val) => onChange("isHaulMet", val)}
        label="Harta telah memenuhi haul (1 tahun)"
      />

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
