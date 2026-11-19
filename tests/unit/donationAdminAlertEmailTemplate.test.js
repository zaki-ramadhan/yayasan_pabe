import { describe, it, expect } from "vitest";
import { buildDonationAdminAlertEmailHtml } from "@/templates/emails/donationAdminAlertEmailTemplate";

describe("buildDonationAdminAlertEmailHtml", () => {
  it("menghasilkan markup email alert admin yang valid dan menyertakan rincian penting", () => {
    const html = buildDonationAdminAlertEmailHtml({
      invoiceId: "INV-20261118-001",
      donorName: "Budi Santoso",
      programTitle: "Sedekah Pangan Yatim",
      amount: 250000,
      paymentChannel: "QRIS",
      paidAt: new Date("2026-11-18T10:00:00Z"),
      donationType: "CAMPAIGN",
      adminDashboardUrl: "http://localhost:3000/admin/transaksi?invoice=INV-20261118-001",
    });

    expect(html).toContain("INV-20261118-001");
    expect(html).toContain("Budi Santoso");
    expect(html).toContain("Sedekah Pangan Yatim");
    expect(html).toContain("250.000");
    expect(html).toContain("QRIS");
    expect(html).toContain("Buka Mutasi Transaksi di Panel Admin");
  });

  it("menangani zakat dan zakatType dengan label yang tepat", () => {
    const html = buildDonationAdminAlertEmailHtml({
      invoiceId: "INV-ZAKAT-002",
      donorName: "Ahmad",
      programTitle: "Zakat Mal",
      amount: 1000000,
      paymentChannel: "BCA_VA",
      paidAt: new Date("2026-11-18T12:00:00Z"),
      donationType: "ZAKAT",
      zakatType: "ZAKAT_MAAL",
    });

    expect(html).toContain("INV-ZAKAT-002");
    expect(html).toContain("Zakat");
    expect(html).toContain("ZAKAT MAAL");
    expect(html).toContain("1.000.000");
  });
});

