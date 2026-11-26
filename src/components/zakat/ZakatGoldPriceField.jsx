import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { ZAKAT_GOLD_NISAB_GRAMS, ZAKAT_INPUT_LIMITS } from "@/lib/zakat/constants";
import { ZakatFieldGroup } from "./ZakatFieldGroup";

/**
 * Reusable gold price per gram input with a reference link to official Antam pricing.
 */
export function ZakatGoldPriceField({
  id = "hargaEmasPerGram",
  label = "Harga acuan emas per gram",
  required = true,
  value,
  onChange,
  error,
}) {
  return (
    <ZakatFieldGroup
      id={id}
      label={label}
      required={required}
      error={error}
      helperText={
        <>
          Acuan nishab {ZAKAT_GOLD_NISAB_GRAMS} gr emas. Cek harga resmi di{" "}
          <a
            href="https://www.logammulia.com/id/harga-emas-hari-ini"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-medium hover:underline"
          >
            Logam Mulia Antam
          </a>
          .
        </>
      }
    >
      <CurrencyInput
        id={id}
        value={value ?? 0}
        onChange={onChange}
        min={0}
        max={ZAKAT_INPUT_LIMITS.MAX_GOLD_PRICE_PER_GRAM}
        placeholder="Contoh: 2.100.000"
      />
    </ZakatFieldGroup>
  );
}
