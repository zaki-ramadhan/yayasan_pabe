import { describe, it, expect } from "vitest";
import { PAYMENT_CHANNELS, PAYMENT_CATEGORIES } from "@/data/paymentChannels";

describe("PAYMENT_CHANNELS Configuration", () => {
  it("memiliki saluran pembayaran lintas sektor lengkap", () => {
    const ids = PAYMENT_CHANNELS.map((c) => c.id);
    // E-Wallet & QRIS
    expect(ids).toContain("qris");
    expect(ids).toContain("gopay");
    expect(ids).toContain("shopeepay");
    // Virtual Account
    expect(ids).toContain("bca_va");
    expect(ids).toContain("mandiri_va");
    expect(ids).toContain("bri_va");
    expect(ids).toContain("bni_va");
    expect(ids).toContain("permata_va");
    // Retail
    expect(ids).toContain("indomaret");
    expect(ids).toContain("alfamart");
    expect(ids).toHaveLength(10);
  });

  it("memiliki penamaan kanal bank yang ramah donatur sesuai aplikasi mobile banking", () => {
    const channelMap = Object.fromEntries(PAYMENT_CHANNELS.map((c) => [c.id, c.name]));
    expect(channelMap.bca_va).toContain("BCA mobile / myBCA");
    expect(channelMap.mandiri_va).toContain("Livin' by Mandiri");
    expect(channelMap.bri_va).toContain("BRImo / BRIVA");
    expect(channelMap.bni_va).toContain("BNI Mobile / wondr");
    expect(channelMap.permata_va).toContain("PermataMobile X");
  });

  it("memastikan setiap saluran terpetakan ke kategori resmi yang valid", () => {
    const validCategoryIds = PAYMENT_CATEGORIES.map((c) => c.id);
    PAYMENT_CHANNELS.forEach((channel) => {
      expect(validCategoryIds).toContain(channel.category);
    });
  });

  it("memastikan seluruh saluran bebas biaya admin bagi donatur (disubsidi yayasan)", () => {
    PAYMENT_CHANNELS.forEach((channel) => {
      expect(channel.fee).toBe(0);
    });
  });

  it("memastikan setiap saluran memiliki path logo resmi yang valid", () => {
    PAYMENT_CHANNELS.forEach((channel) => {
      expect(typeof channel.logo).toBe("string");
      expect(channel.logo).toMatch(/^\/img\/branding\/payments\/.+\.webp$/);
    });
  });

  it("memiliki panduan instruksi pembayaran yang jelas untuk setiap kanal", () => {
    PAYMENT_CHANNELS.forEach((channel) => {
      expect(Array.isArray(channel.instructions)).toBe(true);
      expect(channel.instructions.length).toBeGreaterThan(0);
    });
  });
});
