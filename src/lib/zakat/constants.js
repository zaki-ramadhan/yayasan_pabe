/**
 * Standar acuan syariat zakat nasional & nilai acuan emas/perak/pertanian
 */
export const ZAKAT_GOLD_NISAB_GRAMS = 85;
export const ZAKAT_SILVER_NISAB_GRAMS = 595;
export const ZAKAT_RATE = 0.025;

export const ZAKAT_AGRICULTURE_NISAB_BERAS_KG = 522;
export const ZAKAT_AGRICULTURE_NISAB_GABAH_KG = 653;
export const ZAKAT_AGRICULTURE_RATE_RAIN = 0.1;
export const ZAKAT_AGRICULTURE_RATE_IRRIGATION = 0.05;

export const DEFAULT_GOLD_PRICE_PER_GRAM = 2492965;
export const DEFAULT_SILVER_PRICE_PER_GRAM = 17500;
export const DEFAULT_BERAS_PRICE_PER_KG = 15000;
export const DEFAULT_GABAH_PRICE_PER_KG = 8000;

export const DEFAULT_ANNUAL_NISAB = ZAKAT_GOLD_NISAB_GRAMS * DEFAULT_GOLD_PRICE_PER_GRAM;
export const DEFAULT_MONTHLY_NISAB = Math.round(DEFAULT_ANNUAL_NISAB / 12);

export const ZAKAT_INPUT_LIMITS = Object.freeze({
  MAX_CURRENCY: 1_000_000_000_000, // 1 Triliun IDR
  MIN_GOLD_PRICE_PER_GRAM: 100_000,
  MAX_GOLD_PRICE_PER_GRAM: 50_000_000,
  MIN_SILVER_PRICE_PER_GRAM: 1_000,
  MAX_SILVER_PRICE_PER_GRAM: 1_000_000,
  MIN_COMMODITY_PRICE_PER_KG: 500,
  MAX_COMMODITY_PRICE_PER_KG: 1_000_000,
  MAX_WEIGHT_GRAMS: 1_000_000,
  MAX_HARVEST_KG: 10_000_000,
  MIN_OWNERSHIP_PERCENT: 1,
  MAX_OWNERSHIP_PERCENT: 100,
});

/**
 * Validate gold price per gram input against reasonable bounds.
 */
export function getGoldPriceError(value) {
  const num = Number(value || 0);
  if (!(num > 0)) {
    return "Harga emas per gram wajib diisi lebih dari 0";
  }
  if (num < ZAKAT_INPUT_LIMITS.MIN_GOLD_PRICE_PER_GRAM) {
    return "Harga emas minimal Rp 100.000 per gram";
  }
  if (num > ZAKAT_INPUT_LIMITS.MAX_GOLD_PRICE_PER_GRAM) {
    return "Harga emas maksimal Rp 50.000.000 per gram";
  }
  return undefined;
}
