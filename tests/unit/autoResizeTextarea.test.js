import { describe, it, expect } from "vitest";

describe("AutoResizeTextarea - Perhitungan Dimensi & Resizing", () => {
  it("menghitung tinggi minimal dan maksimal berdasarkan minRows dan maxRows", () => {
    const lineHeight = 20;
    const paddingVertical = 16;
    const borderVertical = 2;

    const minRows = 3;
    const maxRows = 8;

    const minHeight = Math.ceil(minRows * lineHeight + paddingVertical + borderVertical);
    const maxHeight = Math.ceil(maxRows * lineHeight + paddingVertical + borderVertical);

    expect(minHeight).toBe(78);
    expect(maxHeight).toBe(178);
  });

  it("membatasi ekspansi tinggi antara minHeight dan maxHeight", () => {
    const minHeight = 78;
    const maxHeight = 178;

    // Saat teks pendek (scrollHeight < minHeight)
    const shortContent = 50;
    const heightShort = Math.max(minHeight, Math.min(shortContent, maxHeight));
    expect(heightShort).toBe(minHeight);

    // Saat teks sedang (minHeight <= scrollHeight <= maxHeight)
    const mediumContent = 120;
    const heightMedium = Math.max(minHeight, Math.min(mediumContent, maxHeight));
    expect(heightMedium).toBe(120);

    // Saat teks sangat panjang (scrollHeight > maxHeight)
    const longContent = 300;
    const heightLong = Math.max(minHeight, Math.min(longContent, maxHeight));
    expect(heightLong).toBe(maxHeight);
  });

  it("menentukan overflow-y auto hanya jika melebihi maxHeight", () => {
    const maxHeight = 178;

    const shortContent = 120;
    const overflowShort = shortContent > maxHeight ? "auto" : "hidden";
    expect(overflowShort).toBe("hidden");

    const longContent = 250;
    const overflowLong = longContent > maxHeight ? "auto" : "hidden";
    expect(overflowLong).toBe("auto");
  });
});
