import {
  ZAKAT_GOLD_NISAB_GRAMS,
  ZAKAT_SILVER_NISAB_GRAMS,
  ZAKAT_RATE,
  DEFAULT_ANNUAL_NISAB,
  DEFAULT_MONTHLY_NISAB,
  DEFAULT_GOLD_PRICE_PER_GRAM,
  DEFAULT_SILVER_PRICE_PER_GRAM,
  ZAKAT_AGRICULTURE_NISAB_BERAS_KG,
  ZAKAT_AGRICULTURE_NISAB_GABAH_KG,
  ZAKAT_AGRICULTURE_RATE_RAIN,
  ZAKAT_AGRICULTURE_RATE_IRRIGATION,
  DEFAULT_BERAS_PRICE_PER_KG,
  DEFAULT_GABAH_PRICE_PER_KG,
} from "./constants";

/**
 * 1. Kalkulasi Zakat Profesi
 */
export function calculateZakatProfesi({
  gaji = 0,
  penghasilanLain = 0,
  nisabBulanan = DEFAULT_MONTHLY_NISAB,
}) {
  const netIncome = Math.max(0, Number(gaji || 0) + Number(penghasilanLain || 0));
  const isNisabMet = netIncome >= nisabBulanan;
  const zakatAmount = isNisabMet ? Math.round(netIncome * ZAKAT_RATE) : 0;

  const breakdown = [
    { label: "Gaji Pokok / Penghasilan Rutin", value: Number(gaji || 0), type: "asset" },
    { label: "Penghasilan Tambahan / Bonus", value: Number(penghasilanLain || 0), type: "asset" },
    { label: "Total Penghasilan Bersih", value: netIncome, type: "total" },
  ];

  return {
    netAmount: netIncome,
    nisabThreshold: nisabBulanan,
    isNisabMet,
    zakatAmount,
    periodLabel: "Saat Menerima",
    categoryKey: "ZAKAT_PENGHASILAN",
    breakdown,
  };
}
export const calculateZakatPenghasilan = calculateZakatProfesi;

/**
 * 2. Kalkulasi Zakat Emas
 */
export function calculateZakatEmas({
  jumlahGram = 0,
  hargaPerGram = DEFAULT_GOLD_PRICE_PER_GRAM,
  isHaulMet = true,
}) {
  const gramNumber = Math.max(0, Number(jumlahGram || 0));
  const priceNumber = Math.max(0, Number(hargaPerGram || DEFAULT_GOLD_PRICE_PER_GRAM));
  const totalValue = gramNumber * priceNumber;

  const isNisabMet = gramNumber >= ZAKAT_GOLD_NISAB_GRAMS && Boolean(isHaulMet);
  const zakatAmount = isNisabMet ? Math.round(totalValue * ZAKAT_RATE) : 0;
  const zakatGrams = isNisabMet ? Number((gramNumber * ZAKAT_RATE).toFixed(2)) : 0;
  const nisabNominal = ZAKAT_GOLD_NISAB_GRAMS * priceNumber;

  const breakdown = [
    { label: "Total Simpanan Emas", value: `${gramNumber} gram`, isRawText: true },
    { label: "Harga Emas per Gram", value: priceNumber, type: "asset" },
    { label: "Batas Nishab", value: `${ZAKAT_GOLD_NISAB_GRAMS} gram`, isRawText: true },
    { label: "Total Nilai Konversi Emas", value: totalValue, type: "total" },
  ];

  return {
    netAmount: totalValue,
    nisabThreshold: nisabNominal,
    isNisabMet,
    zakatAmount,
    zakatGrams,
    periodLabel: "Setelah 1 Tahun",
    categoryKey: "ZAKAT_EMAS",
    breakdown,
  };
}

/**
 * 3. Kalkulasi Zakat Perak
 */
export function calculateZakatPerak({
  jumlahGram = 0,
  hargaPerGram = DEFAULT_SILVER_PRICE_PER_GRAM,
  isHaulMet = true,
}) {
  const gramNumber = Math.max(0, Number(jumlahGram || 0));
  const priceNumber = Math.max(0, Number(hargaPerGram || DEFAULT_SILVER_PRICE_PER_GRAM));
  const totalValue = gramNumber * priceNumber;

  const isNisabMet = gramNumber >= ZAKAT_SILVER_NISAB_GRAMS && Boolean(isHaulMet);
  const zakatAmount = isNisabMet ? Math.round(totalValue * ZAKAT_RATE) : 0;
  const zakatGrams = isNisabMet ? Number((gramNumber * ZAKAT_RATE).toFixed(2)) : 0;
  const nisabNominal = ZAKAT_SILVER_NISAB_GRAMS * priceNumber;

  const breakdown = [
    { label: "Total Simpanan Perak", value: `${gramNumber} gram`, isRawText: true },
    { label: "Harga Perak per Gram", value: priceNumber, type: "asset" },
    { label: "Batas Nishab", value: `${ZAKAT_SILVER_NISAB_GRAMS} gram`, isRawText: true },
    { label: "Total Nilai Konversi Perak", value: totalValue, type: "total" },
  ];

  return {
    netAmount: totalValue,
    nisabThreshold: nisabNominal,
    isNisabMet,
    zakatAmount,
    zakatGrams,
    periodLabel: "Setelah 1 Tahun",
    categoryKey: "ZAKAT_PERAK",
    breakdown,
  };
}

/**
 * 4. Kalkulasi Zakat Perdagangan
 */
export function calculateZakatPerdagangan({
  asetLancar = 0,
  laba = 0,
  utangJatuhTempo = 0,
  isHaulMet = true,
  nisabTahunan = DEFAULT_ANNUAL_NISAB,
}) {
  const totalBruto = Number(asetLancar || 0) + Number(laba || 0);
  const totalBase = Math.max(0, totalBruto - Number(utangJatuhTempo || 0));
  const isNisabMet = totalBase >= nisabTahunan && Boolean(isHaulMet);
  const zakatAmount = isNisabMet ? Math.round(totalBase * ZAKAT_RATE) : 0;

  const breakdown = [
    { label: "Aset Lancar / Stok Barang", value: Number(asetLancar || 0), type: "asset" },
    { label: "Laba Usaha / Piutang Lancar", value: Number(laba || 0), type: "asset" },
    ...(utangJatuhTempo > 0
      ? [{ label: "Utang Dagang Jatuh Tempo", value: Number(utangJatuhTempo || 0), type: "liability" }]
      : []),
    { label: "Total Objek Zakat Perdagangan", value: totalBase, type: "total" },
  ];

  return {
    netAmount: totalBase,
    nisabThreshold: nisabTahunan,
    isNisabMet,
    zakatAmount,
    periodLabel: "Setelah 1 Tahun",
    categoryKey: "ZAKAT_PERDAGANGAN",
    breakdown,
  };
}

/**
 * 5. Kalkulasi Zakat Perusahaan
 */
export function calculateZakatPerusahaan({
  aktivaLancar = 0,
  labaUsaha = 0,
  pasivaLancar = 0,
  persenKepemilikan = 100,
  nisabTahunan = DEFAULT_ANNUAL_NISAB,
}) {
  const totalAset = Number(aktivaLancar || 0) + Number(labaUsaha || 0);
  const netCorporate = Math.max(0, totalAset - Number(pasivaLancar || 0));
  const ownershipFactor = Math.min(100, Math.max(1, Number(persenKepemilikan || 100))) / 100;
  const netBase = Math.round(netCorporate * ownershipFactor);

  const isNisabMet = netBase >= nisabTahunan;
  const zakatAmount = isNisabMet ? Math.round(netBase * ZAKAT_RATE) : 0;

  const breakdown = [
    { label: "Aktiva Lancar Perusahaan", value: Number(aktivaLancar || 0), type: "asset" },
    { label: "Laba Usaha Berjalan", value: Number(labaUsaha || 0), type: "asset" },
    { label: "Kewajiban Lancar (Pasiva)", value: Number(pasivaLancar || 0), type: "liability" },
    ...(ownershipFactor < 1
      ? [{ label: `Porsi Kepemilikan (${persenKepemilikan}%)`, value: netBase, type: "total" }]
      : [{ label: "Nilai Objek Zakat Perusahaan", value: netBase, type: "total" }]),
  ];

  return {
    netAmount: netBase,
    nisabThreshold: nisabTahunan,
    isNisabMet,
    zakatAmount,
    periodLabel: "Setelah 1 Tahun",
    categoryKey: "ZAKAT_PERUSAHAAN",
    breakdown,
  };
}

/**
 * 6. Kalkulasi Zakat Tabungan
 */
export function calculateZakatTabungan({
  saldoTabungan = 0,
  bungaBagiHasil = 0,
  utangJatuhTempo = 0,
  isHaulMet = true,
  nisabTahunan = DEFAULT_ANNUAL_NISAB,
}) {
  const totalBruto = Number(saldoTabungan || 0) + Number(bungaBagiHasil || 0);
  const netTabungan = Math.max(0, totalBruto - Number(utangJatuhTempo || 0));
  const isNisabMet = netTabungan >= nisabTahunan && Boolean(isHaulMet);
  const zakatAmount = isNisabMet ? Math.round(netTabungan * ZAKAT_RATE) : 0;

  const breakdown = [
    { label: "Saldo Tabungan / Simpanan", value: Number(saldoTabungan || 0), type: "asset" },
    ...(bungaBagiHasil > 0
      ? [{ label: "Bagi Hasil / Pendapatan Simpanan", value: Number(bungaBagiHasil || 0), type: "asset" }]
      : []),
    ...(utangJatuhTempo > 0
      ? [{ label: "Utang Jatuh Tempo (Pengurang)", value: Number(utangJatuhTempo || 0), type: "liability" }]
      : []),
    { label: "Total Saldo Bersih Terhitung", value: netTabungan, type: "total" },
  ];

  return {
    netAmount: netTabungan,
    nisabThreshold: nisabTahunan,
    isNisabMet,
    zakatAmount,
    periodLabel: "Setelah 1 Tahun",
    categoryKey: "ZAKAT_MAAL",
    breakdown,
  };
}
export function calculateZakatMaal(params = {}) {
  return calculateZakatTabungan({
    saldoTabungan: Number(params.uangTunaiTabungan || 0) + Number(params.deposito || 0) + Number(params.investasi || 0),
    bungaBagiHasil: Number(params.piutang || 0) + Number(params.hartaLain || 0),
    utangJatuhTempo: params.utangJatuhTempo,
    isHaulMet: params.isHaulMet,
    nisabTahunan: params.nisabTahunan,
  });
}

/**
 * 7. Kalkulasi Zakat Pertanian
 */
export function calculateZakatPertanian({
  beratPanenKg = 0,
  komoditas = "beras",
  jenisPengairan = "tadah_hujan",
  hargaPerKg = null,
}) {
  const isGabah = komoditas === "gabah";
  const nisabKg = isGabah ? ZAKAT_AGRICULTURE_NISAB_GABAH_KG : ZAKAT_AGRICULTURE_NISAB_BERAS_KG;
  const rate = jenisPengairan === "irigasi" ? ZAKAT_AGRICULTURE_RATE_IRRIGATION : ZAKAT_AGRICULTURE_RATE_RAIN;
  const ratePercentText = jenisPengairan === "irigasi" ? "5%" : "10%";

  const defaultPrice = isGabah ? DEFAULT_GABAH_PRICE_PER_KG : DEFAULT_BERAS_PRICE_PER_KG;
  const weightNumber = Math.max(0, Number(beratPanenKg || 0));
  const priceNumber = Math.max(0, Number(hargaPerKg || defaultPrice));
  const totalValue = weightNumber * priceNumber;

  const isNisabMet = weightNumber >= nisabKg;
  const zakatKg = isNisabMet ? Number((weightNumber * rate).toFixed(2)) : 0;
  const zakatAmount = isNisabMet ? Math.round(zakatKg * priceNumber) : 0;
  const nisabNominal = nisabKg * priceNumber;

  const labelKomoditas = isGabah ? "Gabah" : "Beras";
  const labelPengairan = jenisPengairan === "irigasi" ? "Irigasi / Berbayar (5%)" : "Tadah Hujan / Alami (10%)";

  const breakdown = [
    { label: `Hasil Panen (${labelKomoditas})`, value: `${weightNumber} kg`, isRawText: true },
    { label: "Metode Pengairan", value: labelPengairan, isRawText: true },
    { label: `Harga per Kg (${labelKomoditas})`, value: priceNumber, type: "asset" },
    { label: "Batas Nishab", value: `${nisabKg} kg`, isRawText: true },
    { label: "Kadar Zakat", value: ratePercentText, isRawText: true },
    { label: "Kewajiban Zakat (Bahan Panen)", value: `${zakatKg} kg`, isRawText: true },
    { label: "Estimasi Nilai Zakat (Rupiah)", value: zakatAmount, type: "total" },
  ];

  return {
    netAmount: totalValue,
    nisabThreshold: nisabNominal,
    isNisabMet,
    zakatAmount,
    zakatKg,
    periodLabel: "Saat Panen",
    categoryKey: "ZAKAT_PERTANIAN",
    breakdown,
  };
}

/**
 * Resolver Flow Checkout Zakat
 */
export function resolveZakatCheckoutFlow(sParams = {}) {
  const sourceParam =
    typeof sParams?.source === "string" ? sParams.source.toLowerCase() : "";
  const hasExplicitAmount = Boolean(
    sParams?.amount && String(sParams.amount).replace(/\D/g, "").length > 0
  );
  const hasExplicitType = Boolean(
    typeof sParams?.type === "string" && sParams.type.trim().length > 0
  );

  const isFromCalculator =
    sourceParam === "calculator" ||
    (hasExplicitAmount && hasExplicitType && sourceParam !== "zis");

  const defaultAmount = 50000;
  const rawSanitized = hasExplicitAmount
    ? Number(String(sParams.amount).replace(/\D/g, ""))
    : NaN;
  const initialAmount =
    !isNaN(rawSanitized) && rawSanitized >= 10000 ? rawSanitized : defaultAmount;

  const initialType = hasExplicitType
    ? sParams.type.trim()
    : "ZAKAT_PENGHASILAN";
  const campaignSlug =
    typeof sParams?.campaign === "string" && sParams.campaign.trim().length > 0
      ? sParams.campaign.trim()
      : null;

  return {
    isFromCalculator,
    initialAmount,
    initialType,
    campaignSlug,
  };
}
