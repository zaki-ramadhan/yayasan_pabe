import { describe, it, expect } from "vitest";
import {
  calculateZakatProfesi,
  calculateZakatPenghasilan,
  calculateZakatEmas,
  calculateZakatPerak,
  calculateZakatPerdagangan,
  calculateZakatPerusahaan,
  calculateZakatTabungan,
  calculateZakatMaal,
  calculateZakatPertanian,
} from "@/lib/zakat/calculations";
import {
  DEFAULT_MONTHLY_NISAB,
  DEFAULT_ANNUAL_NISAB,
  ZAKAT_RATE,
  ZAKAT_GOLD_NISAB_GRAMS,
  ZAKAT_SILVER_NISAB_GRAMS,
  ZAKAT_AGRICULTURE_NISAB_BERAS_KG,
  ZAKAT_AGRICULTURE_NISAB_GABAH_KG,
  ZAKAT_AGRICULTURE_RATE_RAIN,
  ZAKAT_AGRICULTURE_RATE_IRRIGATION,
} from "@/lib/zakat/constants";

describe("1. Zakat Profesi", () => {
  it("mengembalikan zakatAmount 0 jika penghasilan di bawah nisab bulanan (85 gr emas / 12)", () => {
    const result = calculateZakatProfesi({
      gaji: DEFAULT_MONTHLY_NISAB - 1000,
      penghasilanLain: 0,
    });

    expect(result.isNisabMet).toBe(false);
    expect(result.zakatAmount).toBe(0);
  });

  it("menghitung zakat 2.5% ditunaikan saat menerima jika penghasilan mencapai nisab", () => {
    const gaji = 20000000;
    const penghasilanLain = 5000000;
    const total = gaji + penghasilanLain;

    const result = calculateZakatProfesi({ gaji, penghasilanLain });

    expect(result.isNisabMet).toBe(true);
    expect(result.categoryKey).toBe("ZAKAT_PENGHASILAN");
    expect(result.periodLabel).toBe("Saat Menerima");
    expect(result.zakatAmount).toBe(Math.round(total * ZAKAT_RATE));
  });

  it("kompatibel dengan alias calculateZakatPenghasilan", () => {
    const result = calculateZakatPenghasilan({ gaji: 20000000 });
    expect(result.isNisabMet).toBe(true);
  });
});

describe("2. Zakat Emas", () => {
  it("menghitung zakat emas 2.5% jika gram >= 85 gr dan haul 1 tahun terpenuhi", () => {
    const result = calculateZakatEmas({
      jumlahGram: ZAKAT_GOLD_NISAB_GRAMS,
      hargaPerGram: 1000000,
      isHaulMet: true,
    });

    expect(result.isNisabMet).toBe(true);
    expect(result.categoryKey).toBe("ZAKAT_EMAS");
    expect(result.zakatGrams).toBe(Number((85 * ZAKAT_RATE).toFixed(2))); // 2.13 gram
    expect(result.zakatAmount).toBe(Math.round(85 * 1000000 * ZAKAT_RATE));
    expect(result.periodLabel).toContain("1 Tahun");
  });

  it("mengembalikan 0 jika emas belum genap 1 tahun (haul)", () => {
    const result = calculateZakatEmas({
      jumlahGram: 100,
      isHaulMet: false,
    });
    expect(result.isNisabMet).toBe(false);
    expect(result.zakatAmount).toBe(0);
  });
});

describe("3. Zakat Perak", () => {
  it("menghitung zakat perak 2.5% dengan nisab 595 gr setelah 1 tahun", () => {
    const underNisab = calculateZakatPerak({
      jumlahGram: 500,
      hargaPerGram: 15000,
      isHaulMet: true,
    });
    expect(underNisab.isNisabMet).toBe(false);

    const metNisab = calculateZakatPerak({
      jumlahGram: ZAKAT_SILVER_NISAB_GRAMS,
      hargaPerGram: 15000,
      isHaulMet: true,
    });
    expect(metNisab.isNisabMet).toBe(true);
    expect(metNisab.categoryKey).toBe("ZAKAT_PERAK");
    expect(metNisab.zakatAmount).toBe(Math.round(595 * 15000 * ZAKAT_RATE));
  });
});

describe("4. Zakat Perdagangan", () => {
  it("menghitung zakat perdagangan 2.5% dengan nisab 85 gr emas setelah 1 tahun", () => {
    const result = calculateZakatPerdagangan({
      asetLancar: DEFAULT_ANNUAL_NISAB + 10000000,
      laba: 5000000,
      utangJatuhTempo: 2000000,
      isHaulMet: true,
    });

    expect(result.isNisabMet).toBe(true);
    expect(result.categoryKey).toBe("ZAKAT_PERDAGANGAN");
    expect(result.zakatAmount).toBe(Math.round((DEFAULT_ANNUAL_NISAB + 10000000 + 5000000 - 2000000) * ZAKAT_RATE));
  });
});

describe("5. Zakat Perusahaan", () => {
  it("menghitung zakat perusahaan 2.5% dengan nisab 85 gr emas setelah 1 tahun", () => {
    const result = calculateZakatPerusahaan({
      aktivaLancar: DEFAULT_ANNUAL_NISAB * 2,
      labaUsaha: 50000000,
      pasivaLancar: 10000000,
      persenKepemilikan: 100,
    });

    expect(result.isNisabMet).toBe(true);
    expect(result.categoryKey).toBe("ZAKAT_PERUSAHAAN");
    expect(result.zakatAmount).toBeGreaterThan(0);
  });
});

describe("6. Zakat Tabungan", () => {
  it("menghitung zakat tabungan 2.5% dengan nisab 85 gr emas setelah mengendap 1 tahun", () => {
    const result = calculateZakatTabungan({
      saldoTabungan: DEFAULT_ANNUAL_NISAB + 20000000,
      bungaBagiHasil: 1000000,
      utangJatuhTempo: 5000000,
      isHaulMet: true,
    });

    expect(result.isNisabMet).toBe(true);
    expect(result.categoryKey).toBe("ZAKAT_MAAL");
    expect(result.zakatAmount).toBe(Math.round((DEFAULT_ANNUAL_NISAB + 20000000 + 1000000 - 5000000) * ZAKAT_RATE));
  });

  it("kompatibel dengan alias calculateZakatMaal", () => {
    const result = calculateZakatMaal({
      uangTunaiTabungan: DEFAULT_ANNUAL_NISAB * 2,
      isHaulMet: true,
    });
    expect(result.isNisabMet).toBe(true);
  });
});

describe("7. Zakat Pertanian", () => {
  it("menghitung zakat 10% tadah hujan untuk panen beras (nisab 522 kg)", () => {
    const result = calculateZakatPertanian({
      beratPanenKg: 1000,
      komoditas: "beras",
      jenisPengairan: "tadah_hujan",
      hargaPerKg: 15000,
    });

    expect(result.isNisabMet).toBe(true);
    expect(result.zakatKg).toBe(100); // 1000 * 10%
    expect(result.zakatAmount).toBe(100 * 15000);
    expect(result.periodLabel).toBe("Saat Panen");
    expect(result.categoryKey).toBe("ZAKAT_PERTANIAN");
  });

  it("menghitung zakat 5% irigasi untuk panen gabah (nisab 653 kg)", () => {
    const result = calculateZakatPertanian({
      beratPanenKg: 1000,
      komoditas: "gabah",
      jenisPengairan: "irigasi",
      hargaPerKg: 8000,
    });

    expect(result.isNisabMet).toBe(true);
    expect(result.zakatKg).toBe(50); // 1000 * 5%
    expect(result.zakatAmount).toBe(50 * 8000);
    expect(result.periodLabel).toBe("Saat Panen");
  });

  it("mengembalikan 0 jika di bawah nisab", () => {
    const result = calculateZakatPertanian({
      beratPanenKg: ZAKAT_AGRICULTURE_NISAB_BERAS_KG - 1,
      komoditas: "beras",
    });
    expect(result.isNisabMet).toBe(false);
    expect(result.zakatAmount).toBe(0);
  });
});
