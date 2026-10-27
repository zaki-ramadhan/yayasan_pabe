import { useState } from "react";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ZakatFieldGroup } from "../ZakatFieldGroup";

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

  const isJasa = values.submode === "jasa";
  const hasValidInput = isJasa
    ? (values.pendapatanSebelumPajak || 0) > 0 || (values.aktivaLancar || 0) > 0
    : (values.aktivaLancar || 0) > 0 || (values.labaUsaha || 0) > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hasValidInput) {
      if (isJasa) {
        setErrors({
          pendapatanSebelumPajak: "Masukkan nilai pendapatan sebelum pajak atau aktiva lancar",
        });
      } else {
        setErrors({
          aktivaLancar: "Masukkan nilai aktiva lancar atau laba usaha berjalan",
        });
      }
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
          Hitung kewajiban zakat perusahaan berdasarkan model usaha dan nilai harta yang menjadi objek zakat.
        </p>
      </div>

      {/* Submode Switcher */}
      <div className="inline-flex p-1 bg-slate-100 rounded-md gap-1 border border-slate-200">
        <button
          type="button"
          onClick={() => onChange("submode", "jasa")}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer",
            isJasa
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-700 hover:text-slate-950 hover:bg-slate-200/60"
          )}
        >
          Jasa
        </button>
        <button
          type="button"
          onClick={() => onChange("submode", "dagang")}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer",
            !isJasa
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-700 hover:text-slate-950 hover:bg-slate-200/60"
          )}
        >
          Dagang / Industri
        </button>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {isJasa ? (
          <>
            <ZakatFieldGroup
              id="pendapatanSebelumPajak"
              label="Pendapatan sebelum pajak"
              error={errors.pendapatanSebelumPajak}
            >
              <CurrencyInput
                id="pendapatanSebelumPajak"
                value={values.pendapatanSebelumPajak}
                onChange={(val) => handleFieldChange("pendapatanSebelumPajak", val)}
                placeholder="0"
              />
            </ZakatFieldGroup>

            <ZakatFieldGroup id="aktivaLancar" label="Aktiva lancar">
              <CurrencyInput
                id="aktivaLancar"
                value={values.aktivaLancar}
                onChange={(val) => handleFieldChange("aktivaLancar", val)}
                placeholder="0"
              />
            </ZakatFieldGroup>

            <ZakatFieldGroup id="pasivaLancar" label="Pasiva / kewajiban lancar">
              <CurrencyInput
                id="pasivaLancar"
                value={values.pasivaLancar}
                onChange={(val) => handleFieldChange("pasivaLancar", val)}
                placeholder="0"
              />
            </ZakatFieldGroup>
          </>
        ) : (
          <>
            <ZakatFieldGroup
              id="aktivaLancar"
              label="Aktiva lancar"
              error={errors.aktivaLancar}
            >
              <CurrencyInput
                id="aktivaLancar"
                value={values.aktivaLancar}
                onChange={(val) => handleFieldChange("aktivaLancar", val)}
                placeholder="0"
              />
            </ZakatFieldGroup>

            <ZakatFieldGroup id="labaUsaha" label="Laba usaha berjalan">
              <CurrencyInput
                id="labaUsaha"
                value={values.labaUsaha}
                onChange={(val) => handleFieldChange("labaUsaha", val)}
                placeholder="0"
              />
            </ZakatFieldGroup>

            <ZakatFieldGroup id="pasivaLancar" label="Pasiva / kewajiban lancar">
              <CurrencyInput
                id="pasivaLancar"
                value={values.pasivaLancar}
                onChange={(val) => handleFieldChange("pasivaLancar", val)}
                placeholder="0"
              />
            </ZakatFieldGroup>
          </>
        )}
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
