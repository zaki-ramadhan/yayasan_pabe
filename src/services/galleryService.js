import prisma from "@/lib/prisma";
import { decodeHtmlEntities } from "@/lib/formatters";

/**
 * Mengambil daftar dokumentasi galeri publik dengan filter kategori dan pagination.
 *
 * @param {{
 *   category?: string,
 *   page?: number,
 * @param {{
 *   category?: string,
 *   search?: string,
 *   sortBy?: string,
 *   page?: number,
 *   limit?: number
 * }} params
 */
export async function getPublicGalleryItems({
  category = "Semua Kategori",
  search = "",
  sortBy = "terbaru",
  page = 1,
  limit = 24,
} = {}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = limit ? Math.min(200, Math.max(1, Number(limit))) : 24;
  const skip = (safePage - 1) * safeLimit;

  try {
    const where = {};
    if (category && category !== "Semua Kategori" && category !== "ALL" && category !== "all") {
      where.category = { equals: category, mode: "insensitive" };
    }

    if (search && search.trim().length >= 1) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
      ];
    }

    const orderBy =
      sortBy === "terlama"
        ? [{ activityDate: "asc" }, { createdAt: "asc" }]
        : [{ activityDate: "desc" }, { createdAt: "desc" }];

    if (!prisma.galleryItem) {
      console.warn("Prisma model galleryItem belum dimuat ke client. Silakan jalankan 'pnpm exec prisma generate' dan restart 'pnpm dev'.");
      return {
        items: [],
        total: 0,
        page: safePage,
        limit: safeLimit,
        totalPages: 0,
        hasMore: false,
        categories: ["Semua Kategori"],
      };
    }

    const [total, items, dbCategories] = await Promise.all([
      prisma.galleryItem.count({ where }),
      prisma.galleryItem.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy,
      }),
      prisma.galleryItem.findMany({
        select: { category: true },
        distinct: ["category"],
        where: { category: { not: "" } },
      }),
    ]);

    const activeCategories = Array.from(
      new Set(
        dbCategories
          .map((c) => decodeHtmlEntities(c.category?.trim()))
          .filter((cat) => Boolean(cat) && cat !== "Semua Kategori" && cat !== "ALL" && cat !== "all")
      )
    ).sort();

    const totalPages = Math.ceil(total / safeLimit);

    return {
      items: items.map((item) => ({
        ...item,
        title: decodeHtmlEntities(item.title),
        category: decodeHtmlEntities(item.category),
        description: item.description ? decodeHtmlEntities(item.description) : null,
        activityDate: item.activityDate ? item.activityDate.toISOString() : null,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt ? item.updatedAt.toISOString() : null,
      })),
      total,
      page: safePage,
      limit: safeLimit,
      totalPages,
      hasMore: safePage < totalPages,
      categories: ["Semua Kategori", ...activeCategories],
    };
  } catch (error) {
    console.error("Gagal mengambil dokumentasi galeri publik:", error);
    return {
      items: [],
      total: 0,
      page: safePage,
      limit: safeLimit,
      totalPages: 0,
      hasMore: false,
      categories: ["Semua Kategori"],
    };
  }
}
