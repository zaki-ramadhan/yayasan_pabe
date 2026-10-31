import { describe, it, expect } from "vitest";
import { generateVolunteerCardFront, generateVolunteerCardBack } from "@/lib/volunteerCardTexture";
import { formatVolunteerId, formatVolunteerBadgeName } from "@/lib/volunteerUtils";

describe("volunteerCardTexture - SSOT Texture Generation", () => {
  it("mengembalikan string kosong secara aman jika data relawan tidak ada atau di lingkungan non-DOM", () => {
    expect(generateVolunteerCardFront({ volunteer: null })).toBe("");
    expect(generateVolunteerCardFront({ volunteer: undefined })).toBe("");
  });

  it("generateVolunteerCardBack mengembalikan string tanpa melempar exception", () => {
    expect(() => generateVolunteerCardBack()).not.toThrow();
  });
});

describe("formatVolunteerBadgeName - Smart Name Abbreviation for 1:1 Badge Box", () => {
  it("menangani nama 2 kata pendek dengan membaginya ke 2 baris terpisah", () => {
    const result = formatVolunteerBadgeName("Alexander Betonov");
    expect(result.line1).toBe("Alexander");
    expect(result.line2).toBe("Betonov");
  });

  it("menyingkat awalan Muhammad menjadi M. dan menempatkan nama sisa di 2 baris proporsional", () => {
    const result = formatVolunteerBadgeName("Muhammad Rizky Pratama");
    expect(result.line1).toBe("M. Rizky");
    expect(result.line2).toBe("Pratama");
  });

  it("menyingkat kata tengah menjadi inisial jika 3 kata melebihi batas per baris", () => {
    const result = formatVolunteerBadgeName("Alexander Betonov Pratama");
    expect(result.line1).toBe("Alexander B.");
    expect(result.line2).toBe("Pratama");
  });

  it("menyingkat nama 4 kata atau lebih panjang secara cerdas", () => {
    const result = formatVolunteerBadgeName("Siti Nurhaliza Rahmawati Putri");
    expect(result.line1).toBe("Siti N. R.");
    expect(result.line2).toBe("Putri");
  });

  it("menangani input kosong atau 1 kata secara aman", () => {
    expect(formatVolunteerBadgeName("").displayName).toBe("Relawan Kebaikan");
    expect(formatVolunteerBadgeName("Budi").line1).toBe("Budi");
    expect(formatVolunteerBadgeName("Budi").line2).toBe("");
  });
});

describe("formatVolunteerId - Strictly Numeric Badge ID", () => {
  it("selalu menghasilkan angka numerik murni tanpa huruf acak CUID", () => {
    const id = formatVolunteerId("cm7tvulabc123", "2026-05-10");
    expect(id).toMatch(/^\d{6}$/); // 6 digit angka murni, misal "260142"
    expect(id.startsWith("26")).toBe(true);
    expect(/[a-zA-Z]/.test(id)).toBe(false); // tidak boleh mengandung huruf sama sekali
  });

  it("menghasilkan nomor deterministik konsisten untuk ID yang sama", () => {
    const id1 = formatVolunteerId("cuid-test-volunteer", "2026-01-01");
    const id2 = formatVolunteerId("cuid-test-volunteer", "2026-01-01");
    expect(id1).toBe(id2);
  });
});

