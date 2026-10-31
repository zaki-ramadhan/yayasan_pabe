import { describe, it, expect } from "vitest";
import { getRelatedArticles } from "@/lib/articleRecommendation";

describe("Article Recommendation Algorithm (Relevance Waterfall)", () => {
  const current = {
    id: "art-1",
    slug: "laporan-keuangan-q3-2026",
    title: "Laporan Keuangan Q3 2026 Yayasan",
    category: "Transparansi",
    tags: ["keuangan", "akuntabilitas"],
    publishedAt: "2026-10-01T10:00:00.000Z",
  };

  const pool = [
    current,
    {
      id: "art-2",
      slug: "laporan-akuntabilitas-penyaluran-2026",
      title: "Laporan Akuntabilitas Penyaluran Dana 2026",
      category: "Transparansi",
      tags: ["keuangan", "akuntabilitas"],
      publishedAt: "2026-09-20T10:00:00.000Z",
    },
    {
      id: "art-3",
      slug: "pelatihan-kewirausahaan-santri",
      title: "Pelatihan Wirausaha Santri Mandiri",
      category: "Program",
      tags: ["santri", "ekonomi"],
      publishedAt: "2026-10-15T10:00:00.000Z",
    },
    {
      id: "art-4",
      slug: "santunan-dhuafa-bulanan",
      title: "Santunan Bulanan 100 Dhuafa",
      category: "Program",
      tags: ["akuntabilitas", "dhuafa"],
      publishedAt: "2026-09-10T10:00:00.000Z",
    },
  ];

  it("merekomendasikan artikel dengan kategori sama dan tag overlap pada prioritas tertinggi", () => {
    const result = getRelatedArticles(current, pool, 2);

    expect(result.articles).toHaveLength(2);
    expect(result.articles[0].id).toBe("art-2"); // Kategori sama + tag "keuangan"
    expect(result.type).toBe("related");
    expect(result.label).toBe("Artikel Terkait");
    expect(result.hasCategoryMatch).toBe(true);
  });

  it("melakukan fallback ke artikel terbaru jika dalam kategori hanya ada 1 artikel dan tidak ada tag sama", () => {
    const soloCategoryArticle = {
      id: "art-solo",
      slug: "artikel-kategori-tunggal",
      title: "Artikel Kategori Langka",
      category: "Kategori Baru",
      tags: ["tag-unik-1", "tag-unik-2"],
      publishedAt: "2026-10-25T10:00:00.000Z",
    };

    const result = getRelatedArticles(soloCategoryArticle, pool, 2);

    expect(result.articles).toHaveLength(2);
    expect(result.type).toBe("recent");
    expect(result.label).toBe("Artikel Terbaru Lainnya");
    expect(result.hasCategoryMatch).toBe(false);
    expect(result.hasTagMatch).toBe(false);
    // Diurutkan berdasarkan tanggal rilis terbaru
    expect(result.articles[0].publishedAt >= result.articles[1].publishedAt).toBe(true);
  });

  it("menangani cross-category topic match dengan label 'Topik Terkait Lainnya'", () => {
    const crossCategoryArticle = {
      id: "art-cross",
      slug: "transparansi-dana-santunan",
      title: "Transparansi Dana Santunan",
      category: "Edukasi",
      tags: ["akuntabilitas"],
      publishedAt: "2026-08-01T10:00:00.000Z",
    };

    const result = getRelatedArticles(crossCategoryArticle, pool, 1);

    expect(result.articles).toHaveLength(1);
    expect(result.type).toBe("topic");
    expect(result.label).toBe("Topik Terkait Lainnya");
    expect(result.hasCategoryMatch).toBe(false);
    expect(result.hasTagMatch).toBe(true);
  });

  it("menangani edge case null atau array kosong secara graceful tanpa throw error", () => {
    const emptyResult = getRelatedArticles(null, []);
    expect(emptyResult.articles).toEqual([]);
    expect(emptyResult.type).toBe("none");

    const singlePoolResult = getRelatedArticles(current, [current]);
    expect(singlePoolResult.articles).toEqual([]);
    expect(singlePoolResult.type).toBe("none");
  });
});
