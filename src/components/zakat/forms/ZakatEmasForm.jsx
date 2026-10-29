import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Button } from "@/components/ui/Button";
import { ZakatFieldGroup } from "../ZakatFieldGroup";
import { ZakatHaulCheckbox } from "../ZakatHaulCheckbox";

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
          Nisab zakat emas adalah 85 gram dengan kadar zakat 2.5%. Harga emas dapat disesuaikan sesuai harga yang berlaku saat perhitungan.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ZakatFieldGroup
          id="jumlahGram"
          label="Jumlah emas yang dimiliki"
          error={errors.jumlahGram}
        >
          <div className="relative w-full">
            <Input
              id="jumlahGram"
              type="number"
              min="0"
              step="any"
              value={values.jumlahGram || ""}
              onKeyDown={(e) => {
                if (e.key === "-" || e.key === "e" || e.key === "E") {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const raw = parseFloat(e.target.value);
                handleFieldChange("jumlahGram", isNaN(raw) || raw < 0 ? 0 : raw);
              }}
              placeholder="0"
              className="h-11 pr-14 text-sm font-normal text-slate-950 placeholder:text-slate-400 bg-white"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-normal text-slate-600 pointer-events-none select-none">
              gram
            </span>
          </div>
        </ZakatFieldGroup>

        <ZakatFieldGroup
          id="hargaPerGram"
          label="Harga emas per gram"
          helperText="Harga acuan dapat disesuaikan dengan harga pasaran saat ini"
          error={errors.hargaPerGram}
        >
          <CurrencyInput
            id="hargaPerGram"
            value={values.hargaPerGram}
            onChange={(val) => handleFieldChange("hargaPerGram", val)}
            placeholder="0"
          />
        </ZakatFieldGroup>
      </div>

      <ZakatHaulCheckbox
        id="emas-haul"
        checked={values.isHaulMet}
        onChange={(val) => onChange("isHaulMet", val)}
        label="Emas telah dimiliki selama 1 tahun (haul)"
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
