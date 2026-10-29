import prisma from "@/lib/prisma";
import { DEFAULT_GALLERY_CATEGORY } from "@/lib/galleryConstants";
import { sanitizeInput } from "@/lib/security";
import { decodeHtmlEntities } from "@/lib/formatters";
import { deleteFromR2 } from "@/lib/r2Storage";

/**
 * Mengambil daftar dokumentasi galeri untuk tabel/grid admin.
 */
export async function getAdminGalleryItems({
  search = "",
  category = "Semua Kategori",
  page = 1,
  limit = 24,
} = {}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 24));
  const skip = (safePage - 1) * safeLimit;

  try {
    const where = {};
    if (category && category !== "Semua Kategori" && category !== "ALL") {
      where.category = { equals: category, mode: "insensitive" };
    }
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

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
        orderBy: [{ activityDate: "desc" }, { createdAt: "desc" }],
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
    console.error("Gagal mengambil galeri admin:", error);
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

/**
 * Menyimpan banyak foto dokumentasi sekaligus (Batch Insert).
 *
 * @param {Array<{
 *   imageUrl: string,
 *   title?: string,
 *   category?: string,
 *   description?: string,
 *   activityDate?: string|Date
 * }>} items
 */
export async function createGalleryBatch(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Daftar foto tidak boleh kosong.");
  }

  const validItems = items
    .filter((item) => item && typeof item.imageUrl === "string" && item.imageUrl.trim().length > 0)
    .map((item) => {
      const sanitizedTitle = item.title ? sanitizeInput(decodeHtmlEntities(item.title.trim())) : null;
      const sanitizedCategory = item.category ? sanitizeInput(decodeHtmlEntities(item.category.trim())) : DEFAULT_GALLERY_CATEGORY;
      const sanitizedDesc = item.description ? sanitizeInput(decodeHtmlEntities(item.description.trim())) : null;

      let date = null;
      if (item.activityDate) {
        const parsed = new Date(item.activityDate);
        if (!isNaN(parsed.getTime())) {
          date = parsed;
        }
      }

      return {
        imageUrl: item.imageUrl.trim(),
        title: sanitizedTitle || "Dokumentasi Kegiatan",
        category: sanitizedCategory,
        description: sanitizedDesc,
        activityDate: date || new Date(),
      };
    });

  if (validItems.length === 0) {
    throw new Error("Tidak ada foto valid untuk disimpan.");
  }

  if (!prisma.galleryItem) {
    throw new Error(
      "Model galleryItem belum dimuat ke client Prisma. Jalankan 'pnpm exec prisma generate' lalu restart server 'pnpm dev'."
    );
  }

  return await prisma.galleryItem.createMany({
    data: validItems,
  });
}

/**
 * Menghapus satu dokumentasi galeri beserta berkasnya di Cloudflare R2.
 *
 * @param {string} id
 */
export async function deleteGalleryItem(id) {
  if (!id) throw new Error("ID dokumentasi wajib disertakan.");

  if (!prisma.galleryItem) {
    throw new Error(
      "Model galleryItem belum dimuat ke client Prisma. Jalankan 'pnpm exec prisma generate' lalu restart server 'pnpm dev'."
    );
  }

  const existing = await prisma.galleryItem.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Dokumentasi galeri tidak ditemukan.");
  }

  // Hapus dari database
  await prisma.galleryItem.delete({
    where: { id },
  });

  // Hapus dari R2 jika url ada
  if (existing.imageUrl) {
    try {
      await deleteFromR2(existing.imageUrl);
    } catch (r2Err) {
      console.warn("Gagal menghapus berkas foto dari R2:", r2Err.message);
    }
  }

  return existing;
}

/**
 * Memperbarui data dokumentasi galeri.
 *
 * @param {string} id
 * @param {{
 *   title?: string,
 *   category?: string,
 *   description?: string,
 *   activityDate?: string|Date,
 *   imageUrl?: string
 * }} data
 */
export async function updateGalleryItem(id, { title, category, description, activityDate, imageUrl }) {
  if (!id) throw new Error("ID dokumentasi wajib disertakan.");
  if (!prisma.galleryItem) {
    throw new Error(
      "Model galleryItem belum dimuat ke client Prisma. Jalankan 'pnpm exec prisma generate' lalu restart server 'pnpm dev'."
    );
  }

  const existing = await prisma.galleryItem.findUnique({ where: { id } });
  if (!existing) throw new Error("Dokumentasi galeri tidak ditemukan.");

  const sanitizedTitle = title ? sanitizeInput(decodeHtmlEntities(title.trim())) : null;
  const sanitizedCategory = category ? sanitizeInput(decodeHtmlEntities(category.trim())) : DEFAULT_GALLERY_CATEGORY;
  const sanitizedDesc = description ? sanitizeInput(decodeHtmlEntities(description.trim())) : null;

  let date = existing.activityDate;
  if (activityDate) {
    const parsed = new Date(activityDate);
    if (!isNaN(parsed.getTime())) date = parsed;
  }

  // Jika gambar diperbarui, hapus berkas lama dari R2
  if (imageUrl && imageUrl.trim() !== existing.imageUrl) {
    try {
      await deleteFromR2(existing.imageUrl);
    } catch (e) {
      console.warn("Gagal menghapus foto lama dari R2:", e.message);
    }
  }

  return await prisma.galleryItem.update({
    where: { id },
    data: {
      title: sanitizedTitle || "Dokumentasi kegiatan",
      category: sanitizedCategory,
      description: sanitizedDesc,
      activityDate: date,
      imageUrl: imageUrl ? imageUrl.trim() : existing.imageUrl,
    },
  });
}

/**
 * Menghapus banyak dokumentasi galeri sekaligus dan membersihkan berkas R2-nya secara paralel.
 *
 * @param {string[]} ids - Daftar ID galeri yang akan dihapus
 * @returns {Promise<{ count: number }>}
 */
export async function deleteGalleryItemsBatch(ids) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("Daftar ID dokumentasi tidak boleh kosong.");
  }

  if (!prisma.galleryItem) {
    throw new Error(
      "Model galleryItem belum dimuat ke client Prisma. Jalankan 'pnpm exec prisma generate' lalu restart server 'pnpm dev'."
    );
  }

  const items = await prisma.galleryItem.findMany({
    where: { id: { in: ids } },
    select: { id: true, imageUrl: true },
  });

  if (items.length === 0) return { count: 0 };

  const validIds = items.map((i) => i.id);

  await prisma.galleryItem.deleteMany({
    where: { id: { in: validIds } },
  });

  // Hapus berkas gambar/video dari R2 secara paralel tanpa memutus proses bila ada yang gagal
  await Promise.allSettled(
    items
      .filter((i) => i.imageUrl && !i.imageUrl.includes("youtube.com") && !i.imageUrl.includes("youtu.be"))
      .map((i) => deleteFromR2(i.imageUrl).catch(() => {}))
  );

  return { count: validIds.length };
}
