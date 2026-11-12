import prisma from "@/lib/prisma";
import { sanitizeInput } from "@/lib/security";
import {
  ZIS_LOCKED_CATEGORIES,
  ZIS_LOCKED_CATEGORY_IDS,
  isLockedZisCategoryId,
} from "@/lib/zisFilter";

/**
 * Memastikan 3 kategori mutlak ZIS (Zakat, Infaq, Sedekah) selalu tersedia
 * dan merapikan nama kategori Zakat bila masih tertulis ZISWAF.
 */
export async function ensureLockedZisCategories(client = prisma) {
  try {
    for (const item of ZIS_LOCKED_CATEGORIES) {
      await client.category.upsert({
        where: { slug: item.slug },
        update: { name: item.name },
        create: {
          id: item.id,
          name: item.name,
          slug: item.slug,
          iconName: item.iconName,
        },
      });
    }
  } catch (err) {
    console.warn("ensureLockedZisCategories warning:", err?.message);
  }
}

/**
 * Mengambil daftar kategori kampanye yayasan.
 */
export async function getAdminCategories({ search = "" } = {}) {
  try {
    const where = {};
    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: "insensitive" } },
        { slug: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { campaigns: true },
        },
      },
    });

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      iconName: cat.iconName || "HeartHandshake",
      campaignCount: cat._count?.campaigns || 0,
      createdAt: cat.createdAt instanceof Date ? cat.createdAt.toISOString() : cat.createdAt,
    }));
  } catch (error) {
    console.warn("Prisma getAdminCategories fallback:", error.message);
    return [];
  }
}

/**
 * Membuat kategori baru.
 */
export async function createCategory({ name, slug, iconName }) {
  const cleanName = sanitizeInput(name);
  const cleanSlug = sanitizeInput(slug || name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  if (!cleanName) {
    throw new Error("Nama kategori wajib diisi.");
  }

  const existing = await prisma.category.findFirst({
    where: {
      OR: [{ slug: cleanSlug }, { name: { equals: cleanName, mode: "insensitive" } }],
    },
  });

  if (existing) {
    throw new Error("Kategori dengan nama atau tautan (slug) tersebut sudah ada.");
  }

  const category = await prisma.category.create({
    data: {
      name: cleanName,
      slug: cleanSlug,
      iconName: iconName || "HeartHandshake",
    },
  });

  return category;
}

/**
 * Memperbarui kategori.
 */
export async function updateCategory({ id, name, slug, iconName }) {
  const existing = await prisma.category.findUnique({
    where: { id },
    select: { id: true, slug: true },
  });
  if (
    existing &&
    (isLockedZisCategoryId(existing.id) || isLockedZisCategoryId(existing.slug))
  ) {
    throw new Error(
      "Kategori ZIS (Zakat, Infaq, Sedekah) bersifat tetap dan tidak dapat diubah."
    );
  }

  const cleanName = sanitizeInput(name);
  const cleanSlug = sanitizeInput(slug || name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  if (!cleanName) {
    throw new Error("Nama kategori wajib diisi.");
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      name: cleanName,
      slug: cleanSlug,
      iconName: iconName || "HeartHandshake",
    },
  });

  return category;
}

/**
 * Menghapus kategori jika tidak memiliki program terhubung dan bukan kategori tetap ZIS.
 */
export async function deleteCategory({ id }) {
  const existing = await prisma.category.findUnique({
    where: { id },
    select: { id: true, slug: true },
  });
  if (
    existing &&
    (isLockedZisCategoryId(existing.id) || isLockedZisCategoryId(existing.slug))
  ) {
    throw new Error(
      "Kategori ZIS (Zakat, Infaq, Sedekah) bersifat tetap dan tidak dapat dihapus."
    );
  }

  const count = await prisma.campaign.count({ where: { categoryId: id } });
  if (count > 0) {
    throw new Error(
      `Tidak dapat menghapus kategori karena masih terhubung dengan ${count} program kampanye.`
    );
  }

  const deleted = await prisma.category.delete({
    where: { id },
  });

  return deleted;
}

/**
 * Menghapus banyak kategori sekaligus jika tidak memiliki program terhubung.
 */
export async function deleteCategoriesBatch({ ids }) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("Daftar ID kategori tidak boleh kosong.");
  }

  const lockedCategories = await prisma.category.findMany({
    where: {
      id: { in: ids },
      OR: [
        { id: { in: ZIS_LOCKED_CATEGORY_IDS } },
        { slug: { in: ZIS_LOCKED_CATEGORY_IDS } },
      ],
    },
    select: { name: true },
  });

  if (lockedCategories.length > 0) {
    const names = lockedCategories.map((c) => `"${c.name}"`).join(", ");
    throw new Error(
      `Kategori tetap ZIS (${names}) tidak dapat dihapus dari sistem.`
    );
  }

  const categoriesWithCampaigns = await prisma.category.findMany({
    where: {
      id: { in: ids },
      campaigns: { some: {} },
    },
    select: { name: true },
  });

  if (categoriesWithCampaigns.length > 0) {
    const names = categoriesWithCampaigns.map((c) => `"${c.name}"`).join(", ");
    throw new Error(
      `Sebagian kategori (${names}) masih terhubung dengan program aktif dan tidak dapat dihapus.`
    );
  }

  const result = await prisma.category.deleteMany({
    where: { id: { in: ids } },
  });

  return { count: result.count };
}

/**
 * Membersihkan kategori kosong yang tidak memiliki program kampanye terhubung,
 * sambil mempertahankan 3 kategori tetap ZIS (Zakat, Infaq, Sedekah).
 * @param {object} [client] - Prisma client atau transaction
 * @returns {Promise<number>} - Jumlah kategori yang dibersihkan
 */
export async function cleanupOrphanCategories(client = prisma) {
  try {
    const orphans = await client.category.findMany({
      where: {
        id: { notIn: ZIS_LOCKED_CATEGORY_IDS },
        slug: { notIn: ZIS_LOCKED_CATEGORY_IDS },
        campaigns: {
          none: {},
        },
      },
      select: { id: true, name: true },
    });

    if (orphans.length === 0) return 0;

    const ids = orphans.map((c) => c.id);
    const result = await client.category.deleteMany({
      where: { id: { in: ids } },
    });

    return result.count;
  } catch (err) {
    console.warn("Auto-cleanup orphan categories warning:", err.message);
    return 0;
  }
}

