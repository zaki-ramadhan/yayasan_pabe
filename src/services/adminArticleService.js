import prisma from "@/lib/prisma";
import { ARTICLE_CATEGORIES } from "@/data/articles";
import { sanitizeInput } from "@/lib/security";
import { deleteFromR2 } from "@/lib/r2Storage";

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

/**
 * Mengambil daftar artikel untuk tabel admin dengan filter dan pagination.
 */
export async function getAdminArticles({ search = "", category = "ALL", page = 1, limit = 10 } = {}) {
  const skip = (Math.max(1, page) - 1) * limit;

  try {
    const where = {};
    if (category && category !== "ALL") {
      where.OR = [
        { category: { equals: category, mode: "insensitive" } },
        { categories: { has: category } },
      ];
    }
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { author: { contains: q, mode: "insensitive" } },
        { excerpt: { contains: q, mode: "insensitive" } },
      ];
    }

    const [total, items, categoriesDb] = await Promise.all([
      prisma.article.count({ where }),
      prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: "desc" },
      }),
      prisma.article.findMany({
        select: { category: true },
        distinct: ["category"],
      }),
    ]);

    const categories = [
      "Semua Kategori",
      ...new Set([
        ...ARTICLE_CATEGORIES.filter((c) => c.name !== "Semua Kategori").map((c) => c.name),
        ...categoriesDb.map((c) => c.category),
      ]),
    ];

    return {
      items: items.map((a) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        category: a.category || "Umum",
        categories: a.categories || [a.category || "Umum"],
        tags: a.tags || [],
        author: a.author || "Redaksi Yayasan PABE",
        excerpt: a.excerpt || "",
        content: a.content || "",
        bannerUrl: a.bannerUrl || null,
        likeCount: a.likeCount || 0,
        dislikeCount: a.dislikeCount || 0,
        publishedAt: a.publishedAt ? a.publishedAt.toISOString() : new Date().toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      categories,
    };
  } catch (error) {
    console.error("Prisma getAdminArticles error:", error);
    return {
      items: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 1,
      },
      categories: ["Semua Kategori", ...ARTICLE_CATEGORIES.map((c) => c.name)],
    };
  }
}

/**
 * Membuat artikel berita baru ke database.
 */
export async function createAdminArticle(payload) {
  const title = sanitizeInput(payload.title || "").trim();
  const author = sanitizeInput(payload.author || "Redaksi Yayasan PABE").trim();
  const category = sanitizeInput(payload.category || "Berita").trim();
  const excerpt = sanitizeInput(payload.excerpt || "").trim();
  const content = sanitizeInput(payload.content || "").trim();
  const bannerUrl = payload.bannerUrl ? sanitizeInput(payload.bannerUrl).trim() : null;

  if (!title || !content) {
    throw new Error("Judul dan isi konten artikel wajib diisi.");
  }

  const baseSlug = slugify(title);
  const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

  return prisma.article.create({
    data: {
      title,
      slug,
      category,
      categories: [category],
      tags: payload.tags || [category],
      author,
      excerpt: excerpt || content.slice(0, 160),
      content,
      bannerUrl,
      publishedAt: payload.publishedAt ? new Date(payload.publishedAt) : new Date(),
    },
  });
}

/**
 * Memperbarui artikel yang sudah ada.
 */
export async function updateAdminArticle(id, payload) {
  const existing = await prisma.article.findUnique({
    where: { id },
    select: { bannerUrl: true },
  });

  const updateData = {};
  if (payload.title !== undefined) updateData.title = sanitizeInput(payload.title).trim();
  if (payload.author !== undefined) updateData.author = sanitizeInput(payload.author).trim();
  if (payload.category !== undefined) {
    const cat = sanitizeInput(payload.category).trim();
    updateData.category = cat;
    updateData.categories = [cat];
  }
  if (payload.excerpt !== undefined) updateData.excerpt = sanitizeInput(payload.excerpt).trim();
  if (payload.content !== undefined) updateData.content = sanitizeInput(payload.content).trim();
  if (payload.bannerUrl !== undefined) {
    updateData.bannerUrl = sanitizeInput(payload.bannerUrl).trim();
    if (existing?.bannerUrl && existing.bannerUrl !== updateData.bannerUrl) {
      await deleteFromR2(existing.bannerUrl);
    }
  }

  return prisma.article.update({
    where: { id },
    data: updateData,
  });
}

/**
 * Menghapus artikel dari database dan membersihkan gambar terkait di R2.
 */
export async function deleteAdminArticle(id) {
  const existing = await prisma.article.findUnique({
    where: { id },
    select: { bannerUrl: true },
  });

  if (existing?.bannerUrl) {
    await deleteFromR2(existing.bannerUrl);
  }

  return prisma.article.delete({
    where: { id },
  });
}
