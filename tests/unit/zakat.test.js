import { describe, it, expect } from "vitest";
import {
  calculateZakatPenghasilan,
  calculateZakatMaal,
} from "@/lib/zakat/calculations";
import { DEFAULT_MONTHLY_NISAB, DEFAULT_ANNUAL_NISAB, ZAKAT_RATE } from "@/lib/zakat/constants";

describe("zakat - calculateZakatPenghasilan", () => {
  it("mengembalikan zakatAmount 0 jika penghasilan di bawah nisab bulanan", () => {
    const result = calculateZakatPenghasilan({
      gaji: DEFAULT_MONTHLY_NISAB - 1000,
      penghasilanLain: 0,
    });

    expect(result.isNisabMet).toBe(false);
    expect(result.zakatAmount).toBe(0);
  });

  it("menghitung zakat 2.5% jika penghasilan mencapai atau melebihi nisab bulanan", () => {
    const gaji = 20000000;
    const penghasilanLain = 5000000;
    const total = gaji + penghasilanLain;

    const result = calculateZakatPenghasilan({
      gaji,
      penghasilanLain,
    });

    expect(result.isNisabMet).toBe(true);
    expect(result.netAmount).toBe(total);
    expect(result.zakatAmount).toBe(Math.round(total * ZAKAT_RATE));
  });
});

describe("zakat - calculateZakatMaal", () => {
  it("menghitung zakat maal jika aset dikurangi utang mencapai nisab tahunan dan haul terpenuhi", () => {
    const totalAset = DEFAULT_ANNUAL_NISAB + 50000000;
    const utang = 10000000;
    const net = totalAset - utang;

    const result = calculateZakatMaal({
      uangTunaiTabungan: totalAset,
      utangJatuhTempo: utang,
      isHaulMet: true,
    });

    expect(result.isNisabMet).toBe(true);
    expect(result.netAmount).toBe(net);
    expect(result.zakatAmount).toBe(Math.round(net * ZAKAT_RATE));
  });

  it("mengembalikan zakatAmount 0 jika haul belum terpenuhi", () => {
    const result = calculateZakatMaal({
      uangTunaiTabungan: DEFAULT_ANNUAL_NISAB * 2,
      utangJatuhTempo: 0,
      isHaulMet: false,
    });

    expect(result.isNisabMet).toBe(false);
    expect(result.zakatAmount).toBe(0);
  });
});
