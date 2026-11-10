import { describe, it, expect, vi, beforeEach } from "vitest";

const mockArticle = {
  id: "art-test-1",
  slug: "uji-artikel-reaksi",
  title: "Uji Coba Reaksi Artikel",
  category: "Berita",
  categories: ["Berita"],
  tags: ["Uji"],
  excerpt: "Uji reaksi",
  content: "Konten uji reaksi",
  author: "Redaksi",
  likeCount: 10,
  dislikeCount: 2,
  publishedAt: new Date("2026-11-01T00:00:00Z"),
};

let currentArticleState = { ...mockArticle };

vi.mock("@/lib/prisma", () => ({
  default: {
    article: {
      findUnique: vi.fn(async ({ where }) => {
        if (where.slug === mockArticle.slug) {
          return { ...currentArticleState };
        }
        return null;
      }),
      update: vi.fn(async ({ where, data }) => {
        currentArticleState = {
          ...currentArticleState,
          likeCount: data.likeCount,
          dislikeCount: data.dislikeCount,
        };
        return { ...currentArticleState };
      }),
    },
  },
}));

import { updateArticleReaction } from "@/services/articleService";

describe("Article Reaction Service (updateArticleReaction - Atomic Transitions)", () => {
  beforeEach(() => {
    currentArticleState = { ...mockArticle, likeCount: 10, dislikeCount: 2 };
    vi.clearAllMocks();
  });

  it("berhasil memproses 'like' dengan menambah likeCount sebesar 1", async () => {
    const res = await updateArticleReaction(mockArticle.slug, "like");
    expect(res.likeCount).toBe(11);
    expect(res.dislikeCount).toBe(2);
  });

  it("berhasil memproses 'unlike' dengan mengurangi likeCount sebesar 1", async () => {
    const res = await updateArticleReaction(mockArticle.slug, "unlike");
    expect(res.likeCount).toBe(9);
    expect(res.dislikeCount).toBe(2);
  });

  it("berhasil memproses 'dislike' dengan menambah dislikeCount sebesar 1", async () => {
    const res = await updateArticleReaction(mockArticle.slug, "dislike");
    expect(res.likeCount).toBe(10);
    expect(res.dislikeCount).toBe(3);
  });

  it("berhasil memproses 'undislike' dengan mengurangi dislikeCount sebesar 1", async () => {
    const res = await updateArticleReaction(mockArticle.slug, "undislike");
    expect(res.likeCount).toBe(10);
    expect(res.dislikeCount).toBe(1);
  });

  it("berhasil memproses transisi langsung 'like_to_dislike' secara atomik tanpa drift", async () => {
    const res = await updateArticleReaction(mockArticle.slug, "like_to_dislike");
    expect(res.likeCount).toBe(9);
    expect(res.dislikeCount).toBe(3);
  });

  it("berhasil memproses transisi langsung 'dislike_to_like' secara atomik tanpa drift", async () => {
    const res = await updateArticleReaction(mockArticle.slug, "dislike_to_like");
    expect(res.likeCount).toBe(11);
    expect(res.dislikeCount).toBe(1);
  });

  it("mencegah penggelembungan angka saat like dan dislike ditukar bolak-balik berulang kali", async () => {
    // Pengguna mulai dengan Like (10 -> 11)
    let res = await updateArticleReaction(mockArticle.slug, "like");
    expect(res.likeCount).toBe(11);
    expect(res.dislikeCount).toBe(2);

    // Pengguna ganti ke Dislike di halaman detail (11 -> 10, 2 -> 3)
    res = await updateArticleReaction(mockArticle.slug, "like_to_dislike");
    expect(res.likeCount).toBe(10);
    expect(res.dislikeCount).toBe(3);

    // Pengguna kembali ke katalog dan klik Like lagi (10 -> 11, 3 -> 2)
    res = await updateArticleReaction(mockArticle.slug, "dislike_to_like");
    expect(res.likeCount).toBe(11);
    expect(res.dislikeCount).toBe(2);

    // Pengguna masuk lagi ke detail dan klik Dislike lagi (11 -> 10, 2 -> 3)
    res = await updateArticleReaction(mockArticle.slug, "like_to_dislike");
    expect(res.likeCount).toBe(10);
    expect(res.dislikeCount).toBe(3);

    // Setelah 2 kali bolak-balik, nilainya tetap konsisten dan tidak menggelembung
    expect(res.likeCount).toBe(10);
    expect(res.dislikeCount).toBe(3);
  });

  it("tidak menghasilkan angka minus jika decrement dipanggil saat count sudah 0", async () => {
    currentArticleState = { ...mockArticle, likeCount: 0, dislikeCount: 0 };
    const res = await updateArticleReaction(mockArticle.slug, "unlike");
    expect(res.likeCount).toBe(0);
    expect(res.dislikeCount).toBe(0);
  });

  it("mengembalikan null jika slug artikel tidak ditemukan", async () => {
    const res = await updateArticleReaction("slug-tidak-ditemukan", "like");
    expect(res).toBeNull();
  });
});

