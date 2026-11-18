import { useState } from "react";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { ZakatFieldGroup } from "../ZakatFieldGroup";
import { ZakatHaulCheckbox } from "../ZakatHaulCheckbox";
import { ZakatFormActions } from "../ZakatFormActions";

export function ZakatTabunganForm({
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
    (values.saldoTabungan || values.uangTunaiTabungan || 0) +
    (values.bungaBagiHasil || values.deposito || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (totalAssets <= 0) {
      setErrors({
        saldoTabungan: "Masukkan nominal saldo tabungan atau simpanan",
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
          Zakat Tabungan
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Nisab zakat tabungan setara 85 gr emas dengan kadar 2,5%, ditunaikan setelah saldo tabungan mengendap genap 1 tahun (haul).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ZakatFieldGroup
          id="saldoTabungan"
          label="Saldo tabungan / simpanan uang"
          helperText="Total saldo rekening tabungan atau uang tunai yang mengendap"
          error={errors.saldoTabungan}
        >
          <CurrencyInput
            id="saldoTabungan"
            value={values.saldoTabungan ?? values.uangTunaiTabungan ?? 0}
            onChange={(val) => {
              handleFieldChange("saldoTabungan", val);
              handleFieldChange("uangTunaiTabungan", val);
            }}
            placeholder="0"
          />
        </ZakatFieldGroup>

        <ZakatFieldGroup
          id="bungaBagiHasil"
          label="Deposito / bagi hasil simpanan"
          helperText="Bagi hasil atau keuntungan simpanan yang diperoleh"
        >
          <CurrencyInput
            id="bungaBagiHasil"
            value={values.bungaBagiHasil ?? values.deposito ?? 0}
            onChange={(val) => {
              handleFieldChange("bungaBagiHasil", val);
              handleFieldChange("deposito", val);
            }}
            placeholder="0"
          />
        </ZakatFieldGroup>

        <div className="sm:col-span-2">
          <ZakatFieldGroup
            id="utangJatuhTempo"
            label="Utang jatuh tempo (pengurang)"
            helperText="Kewajiban atau utang pribadi yang jatuh tempo dalam tahun berjalan"
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
        id="tabungan-haul"
        checked={values.isHaulMet}
        onChange={(val) => onChange("isHaulMet", val)}
        label="Saldo tabungan telah mengendap selama 1 tahun (haul)"
      />

      <ZakatFormActions onReset={handleReset} />
    </form>
  );
}
