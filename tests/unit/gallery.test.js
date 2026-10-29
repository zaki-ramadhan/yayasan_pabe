import { describe, it, expect, vi } from "vitest";
import { GALLERY_CATEGORIES, DEFAULT_GALLERY_CATEGORY } from "@/lib/galleryConstants";
import { createGalleryBatch, deleteGalleryItem } from "@/services/adminGalleryService";
import { getPublicGalleryItems } from "@/services/galleryService";
import {
  isVideoUrl,
  isDirectVideoUrl,
  isYouTubeUrl,
  getYouTubeVideoId,
  getYouTubeThumbnail,
} from "@/lib/galleryGroupHelper";
import prisma from "@/lib/prisma";

describe("Gallery Constants", () => {
  it("memiliki daftar kategori default yang valid", () => {
    expect(GALLERY_CATEGORIES).toContain("Semua Kategori");
    expect(GALLERY_CATEGORIES).toContain("Santunan Yatim");
    expect(GALLERY_CATEGORIES).toContain("Bantuan Sosial");
    expect(DEFAULT_GALLERY_CATEGORY).toBe("Kegiatan Yayasan");
  });
});

describe("Admin Gallery Service - Validations", () => {
  it("menolak pembuatan batch foto jika array kosong atau null", async () => {
    await expect(createGalleryBatch([])).rejects.toThrow("Daftar foto tidak boleh kosong.");
    await expect(createGalleryBatch(null)).rejects.toThrow("Daftar foto tidak boleh kosong.");
  });

  it("menolak penghapusan foto jika id tidak diberikan", async () => {
    await expect(deleteGalleryItem("")).rejects.toThrow("ID dokumentasi wajib disertakan.");
    await expect(deleteGalleryItem(null)).rejects.toThrow("ID dokumentasi wajib disertakan.");
  });
});

describe("Public Gallery Service - Safe Defaults", () => {
  it("mengembalikan struktur data yang konsisten saat dipanggil", async () => {
    const result = await getPublicGalleryItems({ page: 1, limit: 12 });
    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("page");
    expect(result).toHaveProperty("limit");
    expect(result).toHaveProperty("totalPages");
    expect(result).toHaveProperty("hasMore");
    expect(result).toHaveProperty("categories");
    expect(Array.isArray(result.categories)).toBe(true);
  });
});

describe("Gallery Media Detection & SSOT Helpers", () => {
  it("mendeteksi URL video langsung (MP4, WebM, MOV) dengan benar", () => {
    expect(isDirectVideoUrl("https://r2.example.com/video.mp4")).toBe(true);
    expect(isDirectVideoUrl("https://r2.example.com/video.WEBM")).toBe(true);
    expect(isDirectVideoUrl("https://r2.example.com/video.mov?token=123")).toBe(true);
    expect(isDirectVideoUrl("https://r2.example.com/photo.jpg")).toBe(false);
    expect(isDirectVideoUrl("https://youtube.com/watch?v=dQw4w9WgXcQ")).toBe(false);
  });

  it("mendeteksi URL YouTube dengan benar", () => {
    expect(isYouTubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(true);
    expect(isYouTubeUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(true);
    expect(isYouTubeUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe(true);
    expect(isYouTubeUrl("https://r2.example.com/video.mp4")).toBe(false);
  });

  it("mengekstrak YouTube Video ID dan Thumbnail resmi", () => {
    const ytUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    expect(getYouTubeVideoId(ytUrl)).toBe("dQw4w9WgXcQ");
    expect(getYouTubeThumbnail(ytUrl)).toBe("https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg");
  });

  it("isVideoUrl mengidentifikasi video langsung maupun video YouTube", () => {
    expect(isVideoUrl("https://r2.example.com/video.mp4")).toBe(true);
    expect(isVideoUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(true);
    expect(isVideoUrl("https://r2.example.com/image.png")).toBe(false);
    expect(isVideoUrl(null)).toBe(false);
  });
});
