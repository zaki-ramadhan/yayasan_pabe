import {
  ZAKAT_GOLD_NISAB_GRAMS,
  ZAKAT_RATE,
  DEFAULT_ANNUAL_NISAB,
  DEFAULT_MONTHLY_NISAB,
  DEFAULT_GOLD_PRICE_PER_GRAM,
} from "./constants";

/**
 * 1. Kalkulasi Zakat Penghasilan / Profesi
 */
export function calculateZakatPenghasilan({
  gaji = 0,
  penghasilanLain = 0,
  nisabBulanan = DEFAULT_MONTHLY_NISAB,
}) {
  const netIncome = Math.max(0, Number(gaji || 0) + Number(penghasilanLain || 0));
  const isNisabMet = netIncome >= nisabBulanan;
  const zakatAmount = isNisabMet ? Math.round(netIncome * ZAKAT_RATE) : 0;

  const breakdown = [
    { label: "Gaji Pokok Bulanan", value: Number(gaji || 0), type: "asset" },
    { label: "Penghasilan Lain-lain", value: Number(penghasilanLain || 0), type: "asset" },
    { label: "Total Penghasilan Bersih", value: netIncome, type: "total" },
  ];

  return {
    netAmount: netIncome,
    nisabThreshold: nisabBulanan,
    isNisabMet,
    zakatAmount,
    periodLabel: "Per Bulan",
    categoryKey: "ZAKAT_PENGHASILAN",
    breakdown,
  };
}

/**
 * 2. Kalkulasi Zakat Maal (Tabungan & Harta)
 */
export function calculateZakatMaal({
  uangTunaiTabungan = 0,
  deposito = 0,
  investasi = 0,
  piutang = 0,
  hartaLain = 0,
  utangJatuhTempo = 0,
  isHaulMet = true,
  nisabTahunan = DEFAULT_ANNUAL_NISAB,
}) {
  const totalBruto =
    Number(uangTunaiTabungan || 0) +
    Number(deposito || 0) +
    Number(investasi || 0) +
    Number(piutang || 0) +
    Number(hartaLain || 0);

  const netMaal = Math.max(0, totalBruto - Number(utangJatuhTempo || 0));
  const isNisabMet = netMaal >= nisabTahunan && Boolean(isHaulMet);
  const zakatAmount = isNisabMet ? Math.round(netMaal * ZAKAT_RATE) : 0;

  const breakdown = [
    { label: "Uang Tunai & Tabungan", value: Number(uangTunaiTabungan || 0), type: "asset" },
    { label: "Deposito / Simpanan", value: Number(deposito || 0), type: "asset" },
    { label: "Investasi Objek Zakat", value: Number(investasi || 0), type: "asset" },
    { label: "Piutang Tertagih", value: Number(piutang || 0), type: "asset" },
    { label: "Harta Zakat Lainnya", value: Number(hartaLain || 0), type: "asset" },
    { label: "Utang Jatuh Tempo (≤ 1 Tahun)", value: Number(utangJatuhTempo || 0), type: "liability" },
    { label: "Total Harta Bersih Terhitung", value: netMaal, type: "total" },
  ];

  return {
    netAmount: netMaal,
    nisabThreshold: nisabTahunan,
    isNisabMet,
    zakatAmount,
    periodLabel: "Per Tahun",
    categoryKey: "ZAKAT_MAAL",
    breakdown,
  };
}

/**
 * 3. Kalkulasi Zakat Perusahaan
 */
export function calculateZakatPerusahaan({
  submode = "jasa",
  pendapatanSebelumPajak = 0,
  aktivaLancar = 0,
  pasivaLancar = 0,
  labaUsaha = 0,
  nisabTahunan = DEFAULT_ANNUAL_NISAB,
}) {
  let netBase = 0;
  const breakdown = [];

  if (submode === "jasa") {
    const totalAset = Number(pendapatanSebelumPajak || 0) + Number(aktivaLancar || 0);
    netBase = Math.max(0, totalAset - Number(pasivaLancar || 0));
    breakdown.push(
      { label: "Pendapatan Sebelum Pajak", value: Number(pendapatanSebelumPajak || 0), type: "asset" },
      { label: "Aktiva Lancar", value: Number(aktivaLancar || 0), type: "asset" },
      { label: "Pasiva / Kewajiban Lancar", value: Number(pasivaLancar || 0), type: "liability" },
      { label: "Nilai Objek Zakat Jasa", value: netBase, type: "total" }
    );
  } else {
    const totalAset = Number(aktivaLancar || 0) + Number(labaUsaha || 0);
    netBase = Math.max(0, totalAset - Number(pasivaLancar || 0));
    breakdown.push(
      { label: "Aktiva Lancar", value: Number(aktivaLancar || 0), type: "asset" },
      { label: "Laba Usaha Berjalan", value: Number(labaUsaha || 0), type: "asset" },
      { label: "Pasiva / Kewajiban Lancar", value: Number(pasivaLancar || 0), type: "liability" },
      { label: "Nilai Objek Zakat Dagang/Industri", value: netBase, type: "total" }
    );
  }

  const isNisabMet = netBase >= nisabTahunan;
  const zakatAmount = isNisabMet ? Math.round(netBase * ZAKAT_RATE) : 0;

  return {
    netAmount: netBase,
    nisabThreshold: nisabTahunan,
    isNisabMet,
    zakatAmount,
    periodLabel: "Per Tahun",
    categoryKey: "ZAKAT_PERUSAHAAN",
    breakdown,
  };
}

/**
 * 4. Kalkulasi Zakat Perdagangan
 */
export function calculateZakatPerdagangan({
  asetLancar = 0,
  laba = 0,
  isHaulMet = true,
  nisabTahunan = DEFAULT_ANNUAL_NISAB,
}) {
  const totalBase = Math.max(0, Number(asetLancar || 0) + Number(laba || 0));
  const isNisabMet = totalBase >= nisabTahunan && Boolean(isHaulMet);
  const zakatAmount = isNisabMet ? Math.round(totalBase * ZAKAT_RATE) : 0;

  const breakdown = [
    { label: "Aset Lancar Perdagangan", value: Number(asetLancar || 0), type: "asset" },
    { label: "Laba Usaha", value: Number(laba || 0), type: "asset" },
    { label: "Total Objek Zakat Perdagangan", value: totalBase, type: "total" },
  ];

  return {
    netAmount: totalBase,
    nisabThreshold: nisabTahunan,
    isNisabMet,
    zakatAmount,
    periodLabel: "Per Tahun",
    categoryKey: "ZAKAT_PERDAGANGAN",
    breakdown,
  };
}

/**
 * 5. Kalkulasi Zakat Emas
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
    { label: "Total Nilai Konversi Emas", value: totalValue, type: "total" },
  ];

  return {
    netAmount: totalValue,
    nisabThreshold: nisabNominal,
    isNisabMet,
    zakatAmount,
    zakatGrams,
    periodLabel: "Per Tahun",
    categoryKey: "ZAKAT_EMAS",
    breakdown,
  };
}

/**
 * 6. Resolver Flow Checkout Zakat (Server & Client Safe)
 * Menentukan apakah halaman pembayaran zakat diakses dari kalkulator zakat
 * (tanpa section pilih nominal) atau dari card program ZIS / akses langsung
 * (dengan section pilih nominal preset & custom).
 *
 * @param {Record<string, string | string[] | undefined>} sParams
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
