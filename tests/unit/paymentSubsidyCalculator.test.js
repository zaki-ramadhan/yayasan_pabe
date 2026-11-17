import { describe, it, expect } from "vitest";
import {
  calculatePaymentSubsidy,
  calculateNetSettlement,
  getPaymentSubsidyBreakdown,
  CHANNEL_SUBSIDY_RATES,
} from "@/lib/paymentSubsidyCalculator";

describe("Payment Subsidy Calculator", () => {
  describe("calculatePaymentSubsidy", () => {
    it("menghitung beban MDR QRIS sebesar 0.7%", () => {
      expect(calculatePaymentSubsidy("qris", 100000)).toBe(700);
      expect(calculatePaymentSubsidy("qris", 50000)).toBe(350);
    });

    it("menghitung beban MDR E-Wallet (GoPay, ShopeePay) sebesar 2.0%", () => {
      expect(calculatePaymentSubsidy("gopay", 100000)).toBe(2000);
      expect(calculatePaymentSubsidy("shopeepay", 50000)).toBe(1000);
    });

    it("menghitung biaya flat Virtual Account sebesar Rp 4.000", () => {
      const vaChannels = ["bca_va", "mandiri_va", "bri_va", "bni_va", "permata_va"];
      vaChannels.forEach((channel) => {
        expect(calculatePaymentSubsidy(channel, 50000)).toBe(4000);
        expect(calculatePaymentSubsidy(channel, 500000)).toBe(4000);
      });
    });

    it("mengembalikan 0 jika nominal tidak valid atau kanal tidak terdaftar", () => {
      expect(calculatePaymentSubsidy("manual_mandiri", 100000)).toBe(0);
      expect(calculatePaymentSubsidy("qris", 0)).toBe(0);
      expect(calculatePaymentSubsidy("qris", -50000)).toBe(0);
      expect(calculatePaymentSubsidy("non_existent_channel", 100000)).toBe(0);
      expect(calculatePaymentSubsidy(null, 100000)).toBe(0);
    });
  });

  describe("calculateNetSettlement", () => {
    it("menghitung penerimaan bersih riil kas yayasan setelah dipotong subsidi", () => {
      expect(calculateNetSettlement("qris", 100000)).toBe(99300);

      expect(calculateNetSettlement("bca_va", 100000)).toBe(96000);

      expect(calculateNetSettlement("gopay", 50000)).toBe(49000);
    });

    it("tidak pernah mengembalikan angka negatif (clamped to 0)", () => {
      expect(calculateNetSettlement("bca_va", 2000)).toBe(0);
    });
  });

  describe("getPaymentSubsidyBreakdown", () => {
    it("menghasilkan struktur rincian subsidi transaksi yang lengkap", () => {
      const breakdown = getPaymentSubsidyBreakdown("qris", 100000);

      expect(breakdown).toHaveProperty("channelId", "qris");
      expect(breakdown.channelName).toContain("QRIS");
      expect(breakdown).toHaveProperty("grossAmount", 100000);
      expect(breakdown).toHaveProperty("subsidyFee", 700);
      expect(breakdown).toHaveProperty("netSettlement", 99300);
      expect(breakdown).toHaveProperty("subsidyLabel");
    });
  });

  describe("CHANNEL_SUBSIDY_RATES Configuration", () => {
    it("memiliki konfigurasi rate untuk semua kanal pembayaran aktif", () => {
      expect(CHANNEL_SUBSIDY_RATES).toHaveProperty("qris");
      expect(CHANNEL_SUBSIDY_RATES).toHaveProperty("gopay");
      expect(CHANNEL_SUBSIDY_RATES).toHaveProperty("bca_va");
      expect(CHANNEL_SUBSIDY_RATES).toHaveProperty("mandiri_va");
    });
  });
});
