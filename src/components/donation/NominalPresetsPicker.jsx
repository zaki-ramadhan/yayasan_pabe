import { formatRupiah } from "@/lib/formatters";
import { DONATION_LIMITS } from "@/lib/security";
import { FormField } from "@/components/ui/FormField";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { NominalGridPicker } from "@/components/donation/NominalGridPicker";
import { CheckoutStepHeader } from "@/components/donation/CheckoutStepHeader";

export function NominalPresetsPicker({
  presets,
  amount,
  isCustomMode,
  customAmountInput,
  onPresetClick,
  onCustomModeClick,
  onCustomInputChange,
  error,
}) {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 space-y-4 shadow-xs">
      <CheckoutStepHeader step={1} title="Pilih nominal donasi" />

      {/* Presets Grid */}
      <NominalGridPicker
        presets={presets}
        selectedAmount={amount}
        isCustomMode={isCustomMode}
        onSelectPreset={onPresetClick}
        onSelectCustom={onCustomModeClick}
        columns="2-to-3"
        buttonHeight="default"
        customLabel="Nominal lainnya"
      />

      {/* Custom Input: Only rendered when isCustomMode is active */}
      {isCustomMode && (
        <div className="pt-1 animate-in fade-in slide-in-from-top-1 duration-150">
          <FormField
            label={`Nominal lainnya (min. ${formatRupiah(DONATION_LIMITS.MIN_AMOUNT)})`}
            error={error}
          >
            <CurrencyInput
              autoFocus
              value={customAmountInput}
              max={DONATION_LIMITS.MAX_AMOUNT}
              onChange={(clamped, raw) => {
                if (typeof onCustomInputChange === "function") {
                  onCustomInputChange({ target: { value: raw } });
                }
              }}
            />
          </FormField>
        </div>
      )}
    </div>
  );
}
