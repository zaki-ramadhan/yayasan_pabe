import { describe, it, expect } from "vitest";
import { formatVideoDuration, extractVideoMetadata } from "@/lib/videoHelper";

describe("Video Helper: formatVideoDuration", () => {
  it("mengembalikan null untuk nilai 0, negatif, atau NaN (mencegah bug '0:00')", () => {
    expect(formatVideoDuration(0)).toBeNull();
    expect(formatVideoDuration(-5)).toBeNull();
    expect(formatVideoDuration(NaN)).toBeNull();
    expect(formatVideoDuration(Infinity)).toBeNull();
    expect(formatVideoDuration(null)).toBeNull();
    expect(formatVideoDuration(undefined)).toBeNull();
    expect(formatVideoDuration("60")).toBeNull();
  });

  it("memformat durasi valid menjadi string 'm:ss' yang rapi", () => {
    expect(formatVideoDuration(45)).toBe("0:45");
    expect(formatVideoDuration(60)).toBe("1:00");
    expect(formatVideoDuration(65)).toBe("1:05");
    expect(formatVideoDuration(125.8)).toBe("2:05");
    expect(formatVideoDuration(599)).toBe("9:59");
  });
});

describe("Video Helper: extractVideoMetadata Safe Guard", () => {
  it("mengembalikan fallback aman jika berkas null atau di luar lingkungan peramban", async () => {
    const res = await extractVideoMetadata(null);
    expect(res).toEqual({
      duration: 0,
      durationFormatted: null,
      thumbnailUrl: null,
      isSupported: false,
    });
  });
});
