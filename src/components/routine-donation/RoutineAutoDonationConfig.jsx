"use client";

import { PRESET_AMOUNTS } from "@/data/routineDonation";
import { PAYMENT_CHANNELS } from "@/data/paymentChannels";
import { PaymentChannelPicker } from "@/components/donation/PaymentChannelPicker";
import { FormField } from "@/components/ui/form-field";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { NominalGridPicker } from "@/components/donation/NominalGridPicker";
import { formatRupiah } from "@/lib/formatters";
import { DONATION_LIMITS } from "@/lib/security";

/**
 * Configuration panel for routine automatic donation (amount & payment channel)
 * @param {object} props
 * @param {object} props.item
 * @param {Function} props.onChange
 */
export function RoutineAutoDonationConfig({ item, onChange }) {
  return (
    <div className="space-y-4 pt-2 border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-800 block">
          Nominal donasi
        </label>
        <NominalGridPicker
          presets={PRESET_AMOUNTS}
          selectedAmount={item.amount}
          isCustomMode={Boolean(item.isCustom)}
          onSelectPreset={(amt) => {
            onChange(item.id, "amount", amt);
            onChange(item.id, "isCustom", false);
            onChange(item.id, "customAmount", "");
          }}
          onSelectCustom={() => {
            onChange(item.id, "isCustom", true);
          }}
          columns="3"
          buttonHeight="sm"
          className="gap-2 sm:gap-2.5"
        />

        {item.isCustom && (
          <div className="pt-1 animate-in fade-in slide-in-from-top-1 duration-150">
            <FormField
              label={`Nominal lainnya (min. ${formatRupiah(DONATION_LIMITS.MIN_AMOUNT)})`}
              error={item.amountError}
            >
              <CurrencyInput
                autoFocus
                placeholder="0"
                value={item.customAmount}
                max={DONATION_LIMITS.MAX_AMOUNT}
                onChange={(clamped, raw) => {
                  onChange(item.id, "customAmount", raw);
                  onChange(item.id, "amount", clamped);
                }}
                className="h-11 border-slate-300 text-base text-slate-950 placeholder:text-slate-400 focus:ring-2 focus:ring-primary"
              />
            </FormField>
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-slate-100">
        <PaymentChannelPicker
          channels={PAYMENT_CHANNELS}
          selectedChannelId={item.paymentChannelId || "qris"}
          onSelectChannel={(channelId) => onChange(item.id, "paymentChannelId", channelId)}
          containerCard={false}
          stepNumber={null}
          title="Metode pembayaran tagihan otomatis"
        />
      </div>
    </div>
  );
}
