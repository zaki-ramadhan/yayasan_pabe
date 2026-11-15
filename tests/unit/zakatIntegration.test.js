import { describe, it, expect } from "vitest";
import { ZAKAT_TYPES } from "@/constants/zakatTypes";
import { resolveZakatCheckoutFlow } from "@/lib/zakat/calculations";
import { NOMINAL_PRESETS } from "@/components/donation/useNominalSelection";

describe("Zakat System Integration & Contract Verification", () => {
  it("memiliki definisi tipe zakat dan naskah akad niat syariat yang lengkap", () => {
    expect(ZAKAT_TYPES.length).toBeGreaterThanOrEqual(5);

    ZAKAT_TYPES.forEach((type) => {
      expect(type.id).toBeDefined();
      expect(type.label).toBeDefined();
      expect(type.niat.arab).toBeDefined();
      expect(type.niat.latin).toBeDefined();
      expect(type.niat.arti).toBeDefined();
    });
  });

  it("memiliki kategori kunci yang sesuai dengan kalkulator zakat", () => {
    const typeIds = ZAKAT_TYPES.map((t) => t.id);
    expect(typeIds).toContain("ZAKAT_PENGHASILAN");
    expect(typeIds).toContain("ZAKAT_MAAL");
    expect(typeIds).toContain("ZAKAT_EMAS");
    expect(typeIds).toContain("ZAKAT_PERUSAHAAN");
    expect(typeIds).toContain("ZAKAT_PERDAGANGAN");
  });

  it("mendeteksi Flow 1 (Kalkulator Zakat) dan membawa nilai zakat hasil hitung tanpa input nominal", () => {
    const calcFlowExplicit = resolveZakatCheckoutFlow({
      amount: "625000",
      type: "ZAKAT_PENGHASILAN",
      source: "calculator",
    });

    expect(calcFlowExplicit.isFromCalculator).toBe(true);
    expect(calcFlowExplicit.initialAmount).toBe(625000);
    expect(calcFlowExplicit.initialType).toBe("ZAKAT_PENGHASILAN");

    const calcFlowLegacyUrl = resolveZakatCheckoutFlow({
      amount: "2500000",
      type: "ZAKAT_MAAL",
    });

    expect(calcFlowLegacyUrl.isFromCalculator).toBe(true);
    expect(calcFlowLegacyUrl.initialAmount).toBe(2500000);
    expect(calcFlowLegacyUrl.initialType).toBe("ZAKAT_MAAL");
  });

  it("mendeteksi Flow 2 (Card Program ZIS) dengan section pilihan nominal preset yang konsisten dengan halaman donasi", () => {
    expect(NOMINAL_PRESETS).toEqual([25000, 50000, 100000, 250000, 500000]);

    const zisCardFlow = resolveZakatCheckoutFlow({
      campaign: "zakat",
    });

    expect(zisCardFlow.isFromCalculator).toBe(false);
    expect(zisCardFlow.initialAmount).toBe(50000);
    expect(zisCardFlow.initialType).toBe("ZAKAT_PENGHASILAN");
    expect(zisCardFlow.campaignSlug).toBe("zakat");

    const directFlow = resolveZakatCheckoutFlow({});
    expect(directFlow.isFromCalculator).toBe(false);
    expect(directFlow.initialAmount).toBe(50000);

    const retryFlowWithAmountOnly = resolveZakatCheckoutFlow({
      amount: "100000",
    });
    expect(retryFlowWithAmountOnly.isFromCalculator).toBe(false);
    expect(retryFlowWithAmountOnly.initialAmount).toBe(100000);
  });
});
