import prisma from "@/lib/prisma";
import { ARTICLE_CATEGORIES, validateArticleCategories } from "@/data/articles";

export { validateArticleCategories };

function formatArticleFromDb(a) {
  if (!a) return null;
  const categoriesList = Array.isArray(a.categories) && a.categories.length > 0
    ? a.categories
    : (a.category ? [a.category] : ["Umum"]);

  return {
    ...a,
    category: categoriesList[0] || a.category || "Umum",
    categories: categoriesList.slice(0, 3),
    publishedAt: a.publishedAt instanceof Date ? a.publishedAt.toISOString() : a.publishedAt,
    tags: Array.isArray(a.tags) ? a.tags : [],
  };
}

export async function getArticles({ category = "all", search = "", limit } = {}) {
  try {
    const where = {};

    if (category && category !== "all" && category !== "Semua Kategori") {
      where.OR = [
        { category: { equals: category, mode: "insensitive" } },
        { categories: { has: category } },
      ];
    }

    if (search && search.trim().length >= 2) {
      where.OR = [
        { title: { contains: search.trim(), mode: "insensitive" } },
        { excerpt: { contains: search.trim(), mode: "insensitive" } },
        { content: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const dbArticles = await prisma.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      take: limit || undefined,
    });

    return dbArticles.map(formatArticleFromDb);
  } catch (error) {
    console.error("Prisma getArticles error:", error);
    return [];
  }
}

export async function getArticleBySlug(slug) {
  if (!slug) return null;
  try {
    const dbArticle = await prisma.article.findUnique({
      where: { slug },
    });
    if (dbArticle) {
      return formatArticleFromDb(dbArticle);
    }
  } catch (error) {
    console.error("Prisma getArticleBySlug error:", error);
  }
  return null;
}

export async function getArticleCategories() {
  try {
    const categories = await prisma.article.findMany({
      select: { category: true },
      distinct: ["category"],
    });
    if (categories && categories.length > 0) {
      return [
        { id: "all", name: "Semua Kategori" },
        ...categories.map((c) => ({ id: c.category, name: c.category })),
      ];
    }
  } catch (error) {
    console.warn("Prisma getArticleCategories fallback:", error.message);
  }
  return ARTICLE_CATEGORIES;
}

export async function updateArticleReaction(slug, type = "like") {
  try {
    const field = type === "dislike" ? "dislikeCount" : "likeCount";
    const updated = await prisma.article.update({
      where: { slug },
      data: {
        [field]: { increment: 1 },
      },
    });
    return formatArticleFromDb(updated);
  } catch (error) {
    console.warn("Prisma updateArticleReaction fallback:", error.message);
    return null;
  }
}
