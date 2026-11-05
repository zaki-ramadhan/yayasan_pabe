import { describe, it, expect } from "vitest";
import {
  formatRupiah,
  formatCompactRupiah,
  formatNumber,
  calculateProgress,
  isCampaignClosed,
  formatDateRange,
} from "@/lib/formatters";

describe("formatters - formatRupiah", () => {
  it("mengembalikan 'Rp 0' jika nilai bukan number atau NaN", () => {
    expect(formatRupiah(null)).toBe("Rp 0");
    expect(formatRupiah(undefined)).toBe("Rp 0");
    expect(formatRupiah(NaN)).toBe("Rp 0");
    expect(formatRupiah("10000")).toBe("Rp 0");
  });

  it("memformat angka valid menjadi format mata uang IDR", () => {
    // Memastikan pemisah ribuan titik khas id-ID
    const formatted = formatRupiah(50000);
    expect(formatted).toMatch(/^Rp\s50\.000$/);
  });
});

describe("formatters - formatCompactRupiah", () => {
  it("memformat jutaan, miliaran, dan ribuan dengan unit bahasa Indonesia", () => {
    expect(formatCompactRupiah(1500000)).toMatch(/1[,.]?5\sJuta/);
    expect(formatCompactRupiah(2000000000)).toMatch(/2\sMiliar/);
    expect(formatCompactRupiah(500000)).toMatch(/500\sRibu/);
  });
});

describe("formatters - formatNumber", () => {
  it("memformat angka dengan pemisah ribuan id-ID", () => {
    expect(formatNumber(1250000)).toBe("1.250.000");
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber("abc")).toBe("0");
  });
});

describe("formatters - calculateProgress", () => {
  it("menghitung persentase progres donasi dengan benar", () => {
    expect(calculateProgress(50000, 100000)).toBe(50);
    expect(calculateProgress(25000, 100000)).toBe(25);
    expect(calculateProgress(0, 100000)).toBe(0);
  });

  it("mengembalikan 0 jika targetAmount 0 atau tidak valid", () => {
    expect(calculateProgress(50000, 0)).toBe(0);
    expect(calculateProgress(50000, null)).toBe(0);
  });
});

describe("formatters - isCampaignClosed", () => {
  it("mengembalikan true jika status CLOSED atau COMPLETED", () => {
    expect(isCampaignClosed({ status: "CLOSED" })).toBe(true);
    expect(isCampaignClosed({ status: "COMPLETED" })).toBe(true);
  });

  it("mengembalikan false jika campaign null atau status ACTIVE", () => {
    expect(isCampaignClosed(null)).toBe(false);
    expect(isCampaignClosed({ status: "ACTIVE" })).toBe(false);
  });
});

describe("formatters - formatDateRange", () => {
  it("memformat rentang tanggal dalam bulan dan tahun yang sama secara ringkas", () => {
    expect(formatDateRange("2026-11-05", "2026-11-20")).toBe("5 - 20 Nov 2026");
  });

  it("memformat rentang tanggal dengan bulan berbeda tetapi tahun sama", () => {
    expect(formatDateRange("2026-11-05", "2026-12-15")).toBe("5 Nov - 15 Des 2026");
  });

  it("memformat rentang tanggal dengan tahun berbeda", () => {
    expect(formatDateRange("2026-11-05", "2027-01-10")).toBe("5 Nov 2026 - 10 Jan 2027");
  });

  it("memformat tanggal tunggal saat tanggal mulai dan akhir sama", () => {
    expect(formatDateRange("2026-11-05", "2026-11-05")).toBe("5 Nov 2026");
  });

  it("memformat secara humanis saat hanya tanggal mulai yang ditentukan", () => {
    expect(formatDateRange("2026-11-05", null)).toBe("Mulai 5 Nov 2026");
    expect(formatDateRange("2026-11-05", "")).toBe("Mulai 5 Nov 2026");
  });

  it("mengembalikan '-' jika kedua tanggal kosong atau invalid", () => {
    expect(formatDateRange(null, null)).toBe("-");
    expect(formatDateRange("", "")).toBe("-");
    expect(formatDateRange("invalid", "invalid")).toBe("-");
  });
});
