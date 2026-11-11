"use client";

import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { ZAKAT_NOMINAL_PRESETS } from "@/constants/zakatTypes";
import { formatNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export function ZakatNominalInputSection({
  amount,
  onChangeAmount,
  error,
}) {
  return (
    <div className="space-y-3.5">
      <div className="space-y-1">
        <label htmlFor="zakat-amount-input" className="text-base font-medium text-slate-800 block">
          Nominal zakat yang ditunaikan
        </label>
        <p className="text-sm font-normal text-slate-500">
          Masukkan kewajiban zakat hasil perhitungan atau nominal yang hendak Anda bayarkan.
        </p>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 pointer-events-none select-none">
            Rp
          </span>
          <CurrencyInput
            id="zakat-amount-input"
            value={amount}
            onChange={(val) => onChangeAmount(val)}
            min={10000}
            max={500000000}
            placeholder="0"
            className="pl-11 h-12 text-base font-medium text-slate-900 border-slate-300 focus:border-primary focus:ring-primary"
            isInvalid={Boolean(error)}
          />
        </div>

        {error && (
          <p className="text-sm font-normal text-rose-600">
            {error}
          </p>
        )}
      </div>

      {/* Preset Cepat */}
      <div className="space-y-1.5">
        <span className="text-sm font-normal text-slate-600 block">
          Pilihan nominal cepat:
        </span>
        <div className="flex flex-wrap gap-2">
          {ZAKAT_NOMINAL_PRESETS.map((preset) => {
            const isSelected = amount === preset;
            return (
              <button
                key={preset}
                type="button"
                onClick={() => onChangeAmount(preset)}
                className={cn(
                  "px-3.5 py-1.5 text-sm font-medium rounded-lg border transition-all duration-150 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
                  isSelected
                    ? "bg-primary text-white border-primary shadow-2xs"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                )}
                aria-pressed={isSelected}
              >
                Rp {formatNumber(preset)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

