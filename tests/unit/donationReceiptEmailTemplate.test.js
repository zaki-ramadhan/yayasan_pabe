import { describe, it, expect } from "vitest";
import {
  getDonationReceiptEmailSubject,
  buildDonationReceiptEmailHtml,
} from "@/templates/emails/donationReceiptEmailTemplate";

describe("donationReceiptEmailTemplate Contextual Terminology", () => {
  const baseParams = {
    donorName: "Bpk. Rahmat Hidayat",
    amount: 1500000,
    invoiceId: "INV-20261116-001",
    actionUrl: "https://payungberkah.org/invoice/INV-20261116-001",
    paymentChannelName: "BSI Virtual Account",
    prayer: "Semoga berkah untuk keluarga",
  };

  describe("getDonationReceiptEmailSubject", () => {
    it("menghasilkan subjek zakat yang sah dan tidak menyebut donasi", () => {
      const subject = getDonationReceiptEmailSubject("Zakat Maal", "INV-ZAKAT-01", {
        donationType: "ZAKAT",
      });
      expect(subject).toBe("Bukti Pembayaran Zakat Sah: Zakat Maal [INV-ZAKAT-01]");
      expect(subject).not.toContain("Donasi");
    });

    it("menghasilkan subjek infaq yang tepat", () => {
      const subject = getDonationReceiptEmailSubject("Infaq Pembangunan TPQ", "INV-INFAQ-01", {
        donationType: "INFAQ",
      });
      expect(subject).toBe("Bukti Infaq Sah: Infaq Pembangunan TPQ [INV-INFAQ-01]");
    });

    it("menghasilkan subjek sedekah yang tepat", () => {
      const subject = getDonationReceiptEmailSubject("Sedekah Subuh Berkah", "INV-SEDEKAH-01", {
        donationType: "INFAK_SUBUH",
      });
      expect(subject).toBe("Bukti Sedekah Sah: Sedekah Subuh Berkah [INV-SEDEKAH-01]");
    });

    it("menghasilkan subjek wakaf yang tepat", () => {
      const subject = getDonationReceiptEmailSubject("Wakaf Sarana Air Bersih", "INV-WAKAF-01", {
        donationType: "WAKAF",
      });
      expect(subject).toBe("Bukti Wakaf Sah: Wakaf Sarana Air Bersih [INV-WAKAF-01]");
    });

    it("menghasilkan subjek donasi umum sebagai default fallback", () => {
      const subject = getDonationReceiptEmailSubject("Bantuan Pangan Bencana", "INV-DONASI-01", {
        donationType: "CAMPAIGN",
      });
      expect(subject).toBe("Bukti Donasi Sah: Bantuan Pangan Bencana [INV-DONASI-01]");
    });
  });

  describe("buildDonationReceiptEmailHtml Content & Terminology", () => {
    it("menghasilkan konten email zakat yang menyebut Muzakki dan doa penyuci harta", () => {
      const html = buildDonationReceiptEmailHtml({
        ...baseParams,
        programTitle: "Zakat Penghasilan Profesi",
        donationType: "ZAKAT",
      });

      expect(html).toContain("Pembayaran Zakat Berhasil");
      expect(html).toContain("Nama Muzakki");
      expect(html).toContain("Program Zakat");
      expect(html).toContain("Nominal Zakat");
      expect(html).toContain("Buka Bukti Setor Zakat");
      expect(html).toContain("arsip zakat");
      expect(html).toContain("Alhamdulillah, zakat yang Anda tunaikan telah kami terima");
      expect(html).toContain("penyuci lahir dan batin");

      expect(html).not.toContain("Nama Donatur");
      expect(html).not.toContain("Program Donasi");
      expect(html).not.toContain("Nominal Donasi");
      expect(html).not.toContain("Buka Bukti Donasi Digital");
    });

    it("menghasilkan konten email infaq dengan sebutan Munfiq", () => {
      const html = buildDonationReceiptEmailHtml({
        ...baseParams,
        programTitle: "Infaq Operasional Dakwah",
        donationType: "INFAQ",
      });

      expect(html).toContain("Pembayaran Infaq Berhasil");
      expect(html).toContain("Nama Munfiq");
      expect(html).toContain("Program Infaq");
      expect(html).toContain("Nominal Infaq");
      expect(html).toContain("Buka Bukti Infaq Digital");
      expect(html).toContain("Alhamdulillah, infaq yang Anda tunaikan telah kami terima");
    });

    it("menghasilkan konten email wakaf dengan sebutan Wakif dan amal jariyah", () => {
      const html = buildDonationReceiptEmailHtml({
        ...baseParams,
        programTitle: "Wakaf Pembebasan Lahan Pesantren",
        donationType: "WAKAF",
      });

      expect(html).toContain("Pembayaran Wakaf Berhasil");
      expect(html).toContain("Nama Wakif");
      expect(html).toContain("Program Wakaf");
      expect(html).toContain("Nominal Wakaf");
      expect(html).toContain("Buka Bukti Wakaf Digital");
      expect(html).toContain("amal jariyah");
    });

    it("menghasilkan konten donasi umum dengan sebutan Donatur", () => {
      const html = buildDonationReceiptEmailHtml({
        ...baseParams,
        programTitle: "Bantuan Nutrisi Gizi Balita",
        donationType: "CAMPAIGN",
      });

      expect(html).toContain("Pembayaran Berhasil");
      expect(html).toContain("Nama Donatur");
      expect(html).toContain("Program Donasi");
      expect(html).toContain("Nominal Donasi");
      expect(html).toContain("Buka Bukti Donasi Digital");
    });
  });
});

