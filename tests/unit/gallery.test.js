import { describe, it, expect, vi } from "vitest";
import { GALLERY_CATEGORIES, DEFAULT_GALLERY_CATEGORY } from "@/lib/galleryConstants";
import { createGalleryBatch, deleteGalleryItem } from "@/services/adminGalleryService";
import { getPublicGalleryItems } from "@/services/galleryService";
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
