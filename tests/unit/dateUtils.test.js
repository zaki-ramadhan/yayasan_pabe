import { describe, it, expect } from "vitest";
import { getDateKey, getDateBadgeLabel, formatClockTime } from "@/lib/dateUtils";

describe("dateUtils - getDateKey", () => {
  it("mengembalikan key YYYY-MM-DD dalam zona waktu WIB", () => {
    // 2026-10-19T03:00:00Z -> WIB (+7) is 2026-10-19 10:00:00
    expect(getDateKey("2026-10-19T03:00:00.000Z")).toBe("2026-10-19");
  });

  it("mengembalikan 'unknown' jika input tidak valid", () => {
    expect(getDateKey(null)).toBe("unknown");
    expect(getDateKey("")).toBe("unknown");
    expect(getDateKey("invalid-date")).toBe("unknown");
  });
});

describe("dateUtils - getDateBadgeLabel (Aturan WhatsApp 7 Hari)", () => {
  it("mengembalikan 'Hari Ini' untuk tanggal hari ini", () => {
    const today = new Date();
    expect(getDateBadgeLabel(today)).toBe("Hari Ini");
  });

  it("mengembalikan 'Kemarin' untuk tanggal kemarin (1 hari lalu)", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(getDateBadgeLabel(yesterday)).toBe("Kemarin");
  });

  it("mengembalikan nama hari saja untuk rentang 2-6 hari yang lalu", () => {
    const ID_DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    for (let daysAgo = 2; daysAgo <= 6; daysAgo++) {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - daysAgo);

      // Konversi ke WIB untuk memeriksa nama hari
      const wib = new Date(pastDate.getTime() + (7 * 60 + pastDate.getTimezoneOffset()) * 60000);
      const expectedDayName = ID_DAYS[wib.getDay()];

      expect(getDateBadgeLabel(pastDate)).toBe(expectedDayName);
    }
  });

  it("mengembalikan hanya tanggal dengan singkatan nama bulan untuk 7 hari atau lebih lampau", () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const label7Days = getDateBadgeLabel(sevenDaysAgo);

    // Memastikan format tanggal: tidak diawali dengan "Hari, ...", dan menggunakan singkatan bulan
    expect(label7Days).not.toMatch(/^(Senin|Selasa|Rabu|Kamis|Jumat|Sabtu|Minggu),/);
    expect(label7Days).toMatch(/\d{1,2}\s+(Jan|Feb|Mar|Apr|Mei|Jun|Jul|Agu|Sep|Okt|Nov|Des)\s+\d{4}/);
  });

  it("mengembalikan 'Lainnya' jika input tanggal invalid", () => {
    expect(getDateBadgeLabel(null)).toBe("Lainnya");
    expect(getDateBadgeLabel("invalid")).toBe("Lainnya");
  });
});

describe("dateUtils - formatClockTime", () => {
  it("memformat jam dan menit ke format HH:mm dalam WIB", () => {
    // 2026-10-19T07:30:00Z -> WIB (+7) is 14:30
    const time = formatClockTime("2026-10-19T07:30:00.000Z");
    expect(time).toBe("14:30");
  });

  it("memformat jam, menit, dan detik ke format HH:mm:ss dalam WIB jika withSeconds: true", () => {
    // 2026-10-19T07:30:45Z -> WIB (+7) is 14:30:45
    const time = formatClockTime("2026-10-19T07:30:45.000Z", { withSeconds: true });
    expect(time).toBe("14:30:45");
  });

  it("mengembalikan '--:--' atau '--:--:--' untuk input invalid", () => {
    expect(formatClockTime(null)).toBe("--:--");
    expect(formatClockTime(null, { withSeconds: true })).toBe("--:--:--");
    expect(formatClockTime("invalid")).toBe("--:--");
  });
});
