import { describe, it, expect, vi, beforeEach } from "vitest";
import { uploadFileToServer, uploadImageUrlToServer } from "@/services/uploadService";
import { STORAGE_CONTEXTS } from "@/lib/storageConstants";
import * as safeFetchModule from "@/lib/safeFetch";

describe("uploadService & storageConstants Unit Tests", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("uploadFileToServer", () => {
    it("menolak berkas jika file tidak disertakan", async () => {
      await expect(
        uploadFileToServer({ file: null, context: "GALLERY" })
      ).rejects.toThrow("Berkas tidak boleh kosong.");
    });

    it("menolak jika context tidak disertakan", async () => {
      const dummyFile = new File(["dummy content"], "test.png", { type: "image/png" });
      await expect(
        uploadFileToServer({ file: dummyFile, context: "" })
      ).rejects.toThrow("Konteks pengunggahan (context) wajib disertakan.");
    });

    it("menggunakan timeout 60 detik untuk gambar biasa di bawah 5MB", async () => {
      const mockSafeFetch = vi.spyOn(safeFetchModule, "safeFetch").mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: { url: "https://r2.example.com/test.webp" },
        }),
      });

      const smallImage = new File(["small"], "test.jpg", { type: "image/jpeg" });
      const result = await uploadFileToServer({ file: smallImage, context: "ARTICLE_BANNER" });

      expect(mockSafeFetch).toHaveBeenCalledTimes(1);
      expect(mockSafeFetch).toHaveBeenCalledWith(
        "/api/upload",
        expect.anything(),
        60000
      );
      expect(result.url).toBe("https://r2.example.com/test.webp");
    });

    it("menggunakan timeout adaptif 180 detik untuk berkas video atau berkas di atas 5MB", async () => {
      const mockSafeFetch = vi.spyOn(safeFetchModule, "safeFetch").mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: { url: "https://r2.example.com/video.mp4" },
        }),
      });

      const videoFile = new File(["video-bytes"], "video.mp4", { type: "video/mp4" });
      const result = await uploadFileToServer({ file: videoFile, context: "GALLERY_VIDEO" });

      expect(mockSafeFetch).toHaveBeenCalledTimes(1);
      expect(mockSafeFetch).toHaveBeenCalledWith(
        "/api/upload",
        expect.anything(),
        180000
      );
      expect(result.url).toBe("https://r2.example.com/video.mp4");
    });
  });

  describe("uploadImageUrlToServer", () => {
    it("menolak jika imageUrl tidak valid", async () => {
      await expect(
        uploadImageUrlToServer({ imageUrl: "", context: "GALLERY" })
      ).rejects.toThrow("Tautan gambar tidak boleh kosong.");
    });

    it("menolak jika context tidak disertakan", async () => {
      await expect(
        uploadImageUrlToServer({ imageUrl: "https://example.com/img.jpg", context: "" })
      ).rejects.toThrow("Konteks pengunggahan (context) wajib disertakan.");
    });
  });

  describe("storageConstants Max Size Configuration", () => {
    it("memastikan batas foto modern kamera disetel ke 10MB", () => {
      const tenMb = 10 * 1024 * 1024;
      expect(STORAGE_CONTEXTS.ARTICLE_BANNER.maxBytes).toBe(tenMb);
      expect(STORAGE_CONTEXTS.CAMPAIGN_BANNER.maxBytes).toBe(tenMb);
      expect(STORAGE_CONTEXTS.GALLERY.maxBytes).toBe(tenMb);
      expect(STORAGE_CONTEXTS.INSTAGRAM.maxBytes).toBe(tenMb);
    });

    it("memastikan batas video sorotan disetel ke 25MB", () => {
      const twentyFiveMb = 25 * 1024 * 1024;
      expect(STORAGE_CONTEXTS.GALLERY_VIDEO.maxBytes).toBe(twentyFiveMb);
    });

    it("memastikan batas berkas resume pelamar disetel ke 5MB khusus PDF dan terbuka untuk umum", () => {
      const fiveMb = 5 * 1024 * 1024;
      expect(STORAGE_CONTEXTS.CAREER_RESUME.maxBytes).toBe(fiveMb);
      expect(STORAGE_CONTEXTS.CAREER_RESUME.allowedTypes).toEqual(["application/pdf"]);
      expect(STORAGE_CONTEXTS.CAREER_RESUME.allowedRoles).toBeNull();
    });
  });
});
