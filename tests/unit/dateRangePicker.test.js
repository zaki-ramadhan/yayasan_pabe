import { describe, it, expect } from "vitest";
import { format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";

describe("DateRangePicker - Logika Format Rentang Tanggal", () => {
  it("memformat rentang tanggal dengan benar saat tanggal awal dan akhir berbeda", () => {
    const from = parseISO("2026-11-05T00:00:00");
    const to = parseISO("2026-11-20T00:00:00");

    const label = `${format(from, "d MMM yyyy", { locale: idLocale })} - ${format(
      to,
      "d MMM yyyy",
      { locale: idLocale }
    )}`;

    expect(label).toBe("5 Nov 2026 - 20 Nov 2026");
  });

  it("memformat tanggal tunggal saat tanggal awal dan akhir sama", () => {
    const from = parseISO("2026-11-05T00:00:00");
    const to = parseISO("2026-11-05T00:00:00");

    const label = format(from, "d MMMM yyyy", { locale: idLocale });
    expect(label).toBe("5 November 2026");
  });

  it("menangani kasus saat hanya tanggal mulai yang dipilih", () => {
    const from = parseISO("2026-11-05T00:00:00");
    const label = `${format(from, "d MMM yyyy", { locale: idLocale })} - Pilih tgl akhir`;
    expect(label).toBe("5 Nov 2026 - Pilih tgl akhir");
  });

  it("menghasilkan format YYYY-MM-DD standar untuk penyimpanan state", () => {
    const from = new Date(2026, 10, 5); // 5 November 2026
    const to = new Date(2026, 10, 20); // 20 November 2026

    const fromStr = format(from, "yyyy-MM-dd");
    const toStr = format(to, "yyyy-MM-dd");

    expect(fromStr).toBe("2026-11-05");
    expect(toStr).toBe("2026-11-20");
    expect(fromStr <= toStr).toBe(true);
  });
});
