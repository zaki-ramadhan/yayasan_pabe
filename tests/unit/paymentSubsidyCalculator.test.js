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
      // 0.7% dari Rp 100.000 = Rp 700
      expect(calculatePaymentSubsidy("qris", 100000)).toBe(700);
      // 0.7% dari Rp 50.000 = Rp 350
      expect(calculatePaymentSubsidy("qris", 50000)).toBe(350);
    });

    it("menghitung beban MDR E-Wallet (GoPay, ShopeePay) sebesar 2.0%", () => {
      // 2.0% dari Rp 100.000 = Rp 2.000
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

    it("menghitung biaya flat Gerai Retail Minimarket sebesar Rp 5.000", () => {
      expect(calculatePaymentSubsidy("indomaret", 50000)).toBe(5000);
      expect(calculatePaymentSubsidy("alfamart", 100000)).toBe(5000);
    });

    it("menghitung beban Rp 0 untuk transfer bank manual rekening yayasan", () => {
      expect(calculatePaymentSubsidy("manual_mandiri", 100000)).toBe(0);
      expect(calculatePaymentSubsidy("manual_bri", 250000)).toBe(0);
    });

    it("mengembalikan 0 jika nominal tidak valid atau kanal tidak terdaftar", () => {
      expect(calculatePaymentSubsidy("qris", 0)).toBe(0);
      expect(calculatePaymentSubsidy("qris", -50000)).toBe(0);
      expect(calculatePaymentSubsidy("non_existent_channel", 100000)).toBe(0);
      expect(calculatePaymentSubsidy(null, 100000)).toBe(0);
    });
  });

  describe("calculateNetSettlement", () => {
    it("menghitung penerimaan bersih riil kas yayasan setelah dipotong subsidi", () => {
      // Donasi Rp 100.000 via QRIS (beban Rp 700) -> Diterima Rp 99.300
      expect(calculateNetSettlement("qris", 100000)).toBe(99300);

      // Donasi Rp 100.000 via BCA VA (beban Rp 4.000) -> Diterima Rp 96.000
      expect(calculateNetSettlement("bca_va", 100000)).toBe(96000);

      // Donasi Rp 50.000 via GoPay (beban Rp 1.000) -> Diterima Rp 49.000
      expect(calculateNetSettlement("gopay", 50000)).toBe(49000);

      // Donasi Rp 200.000 via Transfer Mandiri Manual (beban Rp 0) -> Diterima Rp 200.000
      expect(calculateNetSettlement("manual_mandiri", 200000)).toBe(200000);
    });

    it("tidak pernah mengembalikan angka negatif (clamped to 0)", () => {
      // Donasi Rp 2.000 via VA (beban Rp 4.000) -> Net minimal 0
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
      expect(CHANNEL_SUBSIDY_RATES).toHaveProperty("manual_mandiri");
    });
  });
});
