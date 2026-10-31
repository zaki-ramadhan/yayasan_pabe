import { describe, it, expect } from "vitest";
import {
  INDONESIA_REGIONS,
  PROVINCES,
  getCitiesByProvince,
  findProvinceByCity,
} from "@/data/indonesiaRegions";

describe("indonesiaRegions - Master Data & Region Resolvers", () => {
  describe("Dataset Integrity (SSOT 38 Provinsi & 514 Kota/Kabupaten)", () => {
    it("memiliki tepat 38 provinsi resmi Indonesia", () => {
      expect(INDONESIA_REGIONS).toHaveLength(38);
      expect(PROVINCES).toHaveLength(38);
      expect(new Set(PROVINCES).size).toBe(38);
    });

    it("memiliki total 514 kota dan kabupaten resmi di seluruh nusantara", () => {
      const totalCities = INDONESIA_REGIONS.reduce(
        (sum, item) => sum + item.cities.length,
        0
      );
      expect(totalCities).toBe(514);
    });

    it("seluruh kota/kabupaten memiliki prefiks administratif resmi 'Kab.' atau 'Kota'", () => {
      for (const item of INDONESIA_REGIONS) {
        expect(typeof item.province).toBe("string");
        expect(item.province.length).toBeGreaterThan(0);
        expect(Array.isArray(item.cities)).toBe(true);
        expect(item.cities.length).toBeGreaterThan(0);

        for (const city of item.cities) {
          const isValidPrefix = city.startsWith("Kab. ") || city.startsWith("Kota ");
          expect(isValidPrefix).toBe(true);
        }
      }
    });
  });

  describe("getCitiesByProvince", () => {
    it("mengembalikan daftar kota/kabupaten untuk provinsi valid", () => {
      const jatimCities = getCitiesByProvince("Jawa Timur");
      expect(jatimCities.length).toBeGreaterThan(0);
      expect(jatimCities).toContain("Kota Surabaya");
      expect(jatimCities).toContain("Kab. Sidoarjo");
      expect(jatimCities).toContain("Kota Malang");
    });

    it("bersifat case-insensitive dan menangani whitespace", () => {
      const dkiCities = getCitiesByProvince("  dki jakarta  ");
      expect(dkiCities).toContain("Kota Jakarta Selatan");
      expect(dkiCities).toContain("Kab. Kepulauan Seribu");
    });

    it("mengembalikan array kosong untuk input tidak valid atau kosong", () => {
      expect(getCitiesByProvince("")).toEqual([]);
      expect(getCitiesByProvince(null)).toEqual([]);
      expect(getCitiesByProvince(undefined)).toEqual([]);
      expect(getCitiesByProvince("Provinsi Fiktif")).toEqual([]);
    });
  });

  describe("findProvinceByCity", () => {
    it("mendeteksi provinsi dari nama kota lengkap dengan prefiks", () => {
      expect(findProvinceByCity("Kota Surabaya")).toBe("Jawa Timur");
      expect(findProvinceByCity("Kab. Sidoarjo")).toBe("Jawa Timur");
      expect(findProvinceByCity("Kota Bandung")).toBe("Jawa Barat");
      expect(findProvinceByCity("Kota Medan")).toBe("Sumatera Utara");
    });

    it("mendeteksi provinsi dari nama kota tanpa prefiks (fuzzy strip)", () => {
      expect(findProvinceByCity("Surabaya")).toBe("Jawa Timur");
      expect(findProvinceByCity("Sidoarjo")).toBe("Jawa Timur");
      expect(findProvinceByCity("Bandung")).toBe("Jawa Barat");
      expect(findProvinceByCity("Jakarta Selatan")).toBe("DKI Jakarta");
    });

    it("menangani case-insensitive dan spasi berlebih", () => {
      expect(findProvinceByCity("  kota surabaya  ")).toBe("Jawa Timur");
      expect(findProvinceByCity("surabaya")).toBe("Jawa Timur");
      expect(findProvinceByCity("KAB. SLEMAN")).toBe("DI Yogyakarta");
    });

    it("mengembalikan null untuk nama kota yang tidak ditemukan atau kosong", () => {
      expect(findProvinceByCity("")).toBeNull();
      expect(findProvinceByCity(null)).toBeNull();
      expect(findProvinceByCity("Kota Antah Berantah")).toBeNull();
    });
  });
});
