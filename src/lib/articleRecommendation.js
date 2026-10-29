/**
 * @typedef {object} ArticleRecommendationResult
 * @property {Array<object>} articles - Daftar artikel rekomendasi yang dipilih
 * @property {'related' | 'topic' | 'recent' | 'none'} type - Tipe rekomendasi
 * @property {string} label - Judul seksi rekomendasi yang ramah pengguna
 * @property {string} description - Keterangan konteks rekomendasi
 * @property {boolean} hasCategoryMatch - Apakah ada artikel dengan kategori yang sama
 * @property {boolean} hasTagMatch - Apakah ada artikel dengan tag/topik yang sama
 * @property {boolean} hasAnyRelevance - Apakah ada artikel yang relevan secara korelasi
 */

/**
 * Normalisasi string untuk perbandingan aman, case-insensitive & trimmed
 * @param {unknown} val
 * @returns {string}
 */
function normalizeString(val) {
  if (typeof val !== "string") return "";
  return val.trim().toLowerCase();
}

/**
 * Algoritma Rekomendasi Artikel (Relevance Waterfall)
 *
 * Menerapkan 4-tier waterfall:
 * 1. Tier 1: Kategori sama + Tag overlap (Skor tertinggi: +3.0 + 1.5/tag)
 * 2. Tier 2: Kategori sama (Skor: +3.0)
 * 3. Tier 3: Lintas kategori dengan Tag overlap (Skor: 1.5/tag)
 * 4. Tier 4: Fallback artikel terbaru (Skor: 0, disortir berdasarkan tanggal rilis)
 *
 * Mengantisipasi kasus edge-case:
 * - Kategori hanya memiliki 1 artikel (artikel aktif itu sendiri)
 * - Array artikel kosong atau bernilai null
 * - Artikel tidak memiliki tag atau tanggal rilis tidak valid
 *
 * @param {object} currentArticle - Artikel acuan saat ini
 * @param {Array<object>} allArticles - Pool seluruh artikel yang tersedia
 * @param {number} [limit=2] - Maksimal jumlah rekomendasi
 * @returns {ArticleRecommendationResult}
 */
export function getRelatedArticles(currentArticle, allArticles = [], limit = 2) {
  if (!currentArticle || !Array.isArray(allArticles) || allArticles.length === 0) {
    return {
      articles: [],
      type: "none",
      label: "Artikel Terkait",
      description: "",
      hasCategoryMatch: false,
      hasTagMatch: false,
      hasAnyRelevance: false,
    };
  }

  const currentId = currentArticle.id ? String(currentArticle.id) : "";
  const currentSlug = currentArticle.slug ? String(currentArticle.slug) : "";

  // Normalisasi kategori artikel aktif (mendukung single string 'category' dan array 'categories')
  const rawCurrentCategories = Array.isArray(currentArticle.categories) && currentArticle.categories.length > 0
    ? currentArticle.categories
    : [currentArticle.category];
  const currentCategories = new Set(
    rawCurrentCategories.map(normalizeString).filter(Boolean)
  );

  // Normalisasi tags artikel aktif
  const currentTags = new Set(
    (Array.isArray(currentArticle.tags) ? currentArticle.tags : [])
      .map(normalizeString)
      .filter(Boolean)
  );

  // Filter eksklusif artikel saat ini (berdasarkan id atau slug)
  const candidates = allArticles.filter((art) => {
    if (!art || typeof art !== "object") return false;
    const isSameId = currentId && String(art.id) === currentId;
    const isSameSlug = currentSlug && String(art.slug) === currentSlug;
    return !isSameId && !isSameSlug;
  });

  if (candidates.length === 0) {
    return {
      articles: [],
      type: "none",
      label: "Artikel Terkait",
      description: "",
      hasCategoryMatch: false,
      hasTagMatch: false,
      hasAnyRelevance: false,
    };
  }

  // Hitung skor & tier relevansi untuk setiap kandidat
  const scored = candidates.map((art) => {
    let score = 0;
    let categoryMatch = false;

    // 1. Cek kecocokan kategori
    const artCategories = (
      Array.isArray(art.categories) && art.categories.length > 0
        ? art.categories
        : [art.category]
    ).map(normalizeString).filter(Boolean);

    for (const cat of artCategories) {
      if (currentCategories.has(cat)) {
        categoryMatch = true;
        score += 3.0; // Bobot kategori utama
        break;
      }
    }

    // 2. Cek kecocokan tags (topik)
    const artTags = (Array.isArray(art.tags) ? art.tags : [])
      .map(normalizeString)
      .filter(Boolean);

    let matchingTagsCount = 0;
    for (const tag of artTags) {
      if (currentTags.has(tag)) {
        matchingTagsCount++;
      }
    }
    score += matchingTagsCount * 1.5;

    // Validasi timestamp publikasi untuk secondary sorting (terbaru)
    const publishedTime = art.publishedAt ? new Date(art.publishedAt).getTime() : 0;
    const safePublishedTime = Number.isNaN(publishedTime) ? 0 : publishedTime;

    return {
      article: art,
      score,
      categoryMatch,
      hasMatchingTags: matchingTagsCount > 0,
      publishedTime: safePublishedTime,
    };
  });

  // Urutkan: Skor tertinggi dahulu -> Tanggal publikasi terbaru
  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return b.publishedTime - a.publishedTime;
  });

  const targetLimit = Math.max(1, Number(limit) || 2);
  const selectedEntries = scored.slice(0, targetLimit);
  const selectedArticles = selectedEntries.map((e) => e.article);

  // Analisis kontekstual untuk UX penamaan heading
  const hasCategoryMatch = selectedEntries.some((e) => e.categoryMatch);
  const hasTagMatch = selectedEntries.some((e) => e.hasMatchingTags);
  const hasAnyRelevance = selectedEntries.some((e) => e.score > 0);

  let type = "recent";
  let label = "Artikel Terbaru Lainnya";
  let description = "Informasi dan kabar terhangat seputar program Yayasan.";

  if (hasCategoryMatch) {
    type = "related";
    label = "Artikel Terkait";
    description = currentArticle.category
      ? `Rekomendasi topik seputar ${currentArticle.category}.`
      : "Rekomendasi artikel dalam tema serupa.";
  } else if (hasTagMatch) {
    type = "topic";
    label = "Topik Terkait Lainnya";
    description = "Artikel dengan topik pembahasan serupa.";
  }

  return {
    articles: selectedArticles,
    type,
    label,
    description,
    hasCategoryMatch,
    hasTagMatch,
    hasAnyRelevance,
  };
}
