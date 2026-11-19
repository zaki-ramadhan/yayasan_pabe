import { useState } from "react";
import { FormattedNumberInput } from "@/components/ui/FormattedNumberInput";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import {
  DEFAULT_BERAS_PRICE_PER_KG,
  DEFAULT_GABAH_PRICE_PER_KG,
  ZAKAT_AGRICULTURE_NISAB_BERAS_KG,
  ZAKAT_AGRICULTURE_NISAB_GABAH_KG,
} from "@/lib/zakat/constants";
import { ZakatFieldGroup } from "../ZakatFieldGroup";
import { ZakatFormActions } from "../ZakatFormActions";

export function ZakatPertanianForm({
  values,
  onChange,
  onSubmit,
  onReset,
}) {
  const [errors, setErrors] = useState({});

  const komoditas = values.komoditas || "beras";
  const jenisPengairan = values.jenisPengairan || "tadah_hujan";
  const isGabah = komoditas === "gabah";
  const isIrigasi = jenisPengairan === "irigasi";

  const nisabKg = isGabah
    ? ZAKAT_AGRICULTURE_NISAB_GABAH_KG
    : ZAKAT_AGRICULTURE_NISAB_BERAS_KG;
  const kadarPercent = isIrigasi ? "5%" : "10%";

  const handleFieldChange = (field, val) => {
    onChange(field, val);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSwitchKomoditas = (type) => {
    if (type === komoditas) return;
    onChange("komoditas", type);
    const newDefaultPrice =
      type === "gabah" ? DEFAULT_GABAH_PRICE_PER_KG : DEFAULT_BERAS_PRICE_PER_KG;
    onChange("hargaPerKg", newDefaultPrice);
    setErrors({});
  };

  const handleSwitchPengairan = (type) => {
    if (type === jenisPengairan) return;
    onChange("jenisPengairan", type);
    setErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!(Number(values.beratPanenKg) > 0)) {
      errs.beratPanenKg = "Berat hasil panen wajib diisi lebih dari 0 kg";
    }
    if (!(Number(values.hargaPerKg) > 0)) {
      errs.hargaPerKg = "Harga per kg wajib diisi lebih dari 0";
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
          Zakat Pertanian
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Nisab zakat pertanian adalah {nisabKg} kg ({isGabah ? "gabah" : "beras"}) dengan kadar {kadarPercent} sesuai metode pengairan, ditunaikan langsung saat panen.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            Jenis komoditas panen
          </label>
          <div className="grid grid-cols-2 gap-2 max-w-sm">
            <button
              type="button"
              onClick={() => handleSwitchKomoditas("beras")}
              className={cn(
                "py-2 px-3 text-sm font-medium rounded-md border text-center transition-colors cursor-pointer",
                !isGabah
                  ? "bg-primary/10 border-primary text-primary font-semibold"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              )}
            >
              Beras (522 kg)
            </button>
            <button
              type="button"
              onClick={() => handleSwitchKomoditas("gabah")}
              className={cn(
                "py-2 px-3 text-sm font-medium rounded-md border text-center transition-colors cursor-pointer",
                isGabah
                  ? "bg-primary/10 border-primary text-primary font-semibold"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              )}
            >
              Gabah (653 kg)
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            Sistem pengairan (kadar zakat)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleSwitchPengairan("tadah_hujan")}
              className={cn(
                "p-3 text-left rounded-md border transition-colors cursor-pointer",
                !isIrigasi
                  ? "bg-primary/10 border-primary"
                  : "bg-white border-slate-200 hover:bg-slate-50"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900">Tadah Hujan / Alami</span>
                <Badge variant="success">10%</Badge>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Tanpa biaya irigasi tambahan atau mengandalkan air hujan/sungai alami.
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchPengairan("irigasi")}
              className={cn(
                "p-3 text-left rounded-md border transition-colors cursor-pointer",
                isIrigasi
                  ? "bg-primary/10 border-primary"
                  : "bg-white border-slate-200 hover:bg-slate-50"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900">Irigasi / Pompa</span>
                <Badge variant="info">5%</Badge>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Menggunakan biaya pengairan mekanik, diesel pompa, atau kanal berbayar.
              </p>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ZakatFieldGroup
          id="beratPanenKg"
          label={`Total berat hasil panen (${isGabah ? "gabah" : "beras"})`}
          error={errors.beratPanenKg}
        >
          <FormattedNumberInput
            id="beratPanenKg"
            suffix="kg"
            value={values.beratPanenKg}
            onChange={(val) => handleFieldChange("beratPanenKg", val)}
            placeholder="0"
            error={errors.beratPanenKg}
          />
        </ZakatFieldGroup>

        <ZakatFieldGroup
          id="hargaPerKg"
          label={`Harga pasar per kg (${isGabah ? "gabah" : "beras"})`}
          helperText="Dibutuhkan jika zakat ditunaikan dalam bentuk uang tunai"
          error={errors.hargaPerKg}
        >
          <CurrencyInput
            id="hargaPerKg"
            value={values.hargaPerKg}
            onChange={(val) => handleFieldChange("hargaPerKg", val)}
            placeholder="0"
          />
        </ZakatFieldGroup>
      </div>

      <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-md text-xs text-amber-900 leading-relaxed">
        <strong>Waktu Penunaian:</strong> Zakat pertanian wajib dikeluarkan pada saat panen tiba, setiap kali panen berhasil dilakukan tanpa menunggu haul satu tahun.
      </div>

      <ZakatFormActions onReset={handleReset} />
    </form>
  );
}
