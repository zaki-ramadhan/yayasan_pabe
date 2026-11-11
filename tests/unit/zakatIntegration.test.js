import { describe, it, expect, vi, beforeEach } from "vitest";
import { ZAKAT_TYPES } from "@/constants/zakatTypes";

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
});

