import prisma from "@/lib/prisma";
import { sanitizeInput } from "@/lib/security";

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
 * Menghapus kategori jika tidak memiliki program terhubung.
 */
export async function deleteCategory({ id }) {
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
 * Membersihkan kategori kosong yang tidak memiliki program kampanye terhubung.
 * Menjamin database selalu bersih dan tidak ada kategori yatim (orphan) tanpa data.
 * @param {object} [client] - Prisma client atau transaction
 * @returns {Promise<number>} - Jumlah kategori yang dibersihkan
 */
export async function cleanupOrphanCategories(client = prisma) {
  try {
    const orphans = await client.category.findMany({
      where: {
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

