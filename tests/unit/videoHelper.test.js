import { describe, it, expect } from "vitest";
import { formatVideoDuration, extractVideoMetadata, dataUrlToBlob } from "@/lib/videoHelper";
import { getVideoPosterUrl } from "@/lib/galleryGroupHelper";

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

describe("Video Helper: dataUrlToBlob", () => {
  it("mengembalikan null untuk input kosong atau bukan DataURL", () => {
    expect(dataUrlToBlob("")).toBeNull();
    expect(dataUrlToBlob(null)).toBeNull();
    expect(dataUrlToBlob("https://example.com/image.webp")).toBeNull();
    expect(dataUrlToBlob("data:image/webp;base64")).toBeNull();
  });

  it("mengonversi DataURL base64 valid menjadi Blob bertipe sesuai header", () => {
    const sampleDataUrl = "data:image/webp;base64,SGVsbG8=";
    const blob = dataUrlToBlob(sampleDataUrl);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("image/webp");
    expect(blob.size).toBe(5);
  });
});

describe("Gallery Helper: getVideoPosterUrl", () => {
  it("mengembalikan null untuk URL kosong atau non-video", () => {
    expect(getVideoPosterUrl("")).toBeNull();
    expect(getVideoPosterUrl(null)).toBeNull();
    expect(getVideoPosterUrl("/api/media/gallery/foto.webp")).toBeNull();
  });

  it("menghasilkan thumbnail YouTube untuk tautan YouTube", () => {
    expect(getVideoPosterUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
    );
  });

  it("menghasilkan URL .poster.webp untuk video langsung dan membersihkan suffix /stream", () => {
    expect(getVideoPosterUrl("/api/media/gallery/173-kegiatan.mp4")).toBe(
      "/api/media/gallery/173-kegiatan.mp4.poster.webp"
    );
    expect(getVideoPosterUrl("/api/media/gallery/173-kegiatan.mp4/stream?v=1")).toBe(
      "/api/media/gallery/173-kegiatan.mp4.poster.webp"
    );
    expect(getVideoPosterUrl("https://cdn.example.com/gallery/clip.webm")).toBe(
      "https://cdn.example.com/gallery/clip.webm.poster.webp"
    );
  });
});
