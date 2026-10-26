import prisma from "@/lib/prisma";
import { sanitizeInput } from "@/lib/security";
import { toTitleCase } from "@/lib/formatters";
import { cleanupOrphanCategories } from "./categoryService";
import { deleteFromR2 } from "@/lib/r2Storage";

/**
 * Mengambil daftar program kampanye untuk tabel manajemen admin.
 */
export async function getAdminCampaigns({ search = "", status = "", page = 1, limit = 10 } = {}) {
  const skip = (Math.max(1, page) - 1) * limit;

  try {
    const where = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, items, categories] = await Promise.all([
      prisma.campaign.count({ where }),
      prisma.campaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          updates: { select: { disbursedAmount: true } },
          _count: { select: { donations: true, updates: true } },
        },
      }),
      prisma.category.findMany({ select: { id: true, name: true, slug: true } }),
    ]);

    return {
      items: items.map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        category: c.category?.name || "Program Umum",
        categoryId: c.categoryId,
        targetAmount: Number(c.targetAmount || 0),
        collectedAmount: Number(c.collectedAmount || 0),
        disbursedAmount: c.updates?.reduce((acc, u) => acc + Number(u.disbursedAmount || 0), 0) || 0,
        updatesCount: c._count?.updates || c.updates?.length || 0,
        donorCount: c._count?.donations || c.donorCount || 0,
        endDate: c.endDate ? c.endDate.toISOString() : null,
        status: c.status,
        isUrgent: c.isUrgent,
        isFeatured: c.isFeatured,
        location: c.location || "Nasional",
        bannerUrl: c.bannerUrl || null,
        createdAt: c.createdAt.toISOString(),
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
    console.error("Prisma getAdminCampaigns error:", error);
    return {
      items: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 1,
      },
      categories: [],
    };
  }
}

/**
 * Membuat kategori program baru dan menghasilkan slug unik.
 */
export async function createAdminCategory(name) {
  const sanitizedName = sanitizeInput(name || "").trim();
  if (!sanitizedName) {
    throw new Error("Nama kategori program wajib diisi.");
  }

  const baseSlug = sanitizedName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const uniqueSlug = `${baseSlug || "kategori"}-${Date.now().toString().slice(-4)}`;

  try {
    return await prisma.category.create({
      data: {
        name: sanitizedName,
        slug: uniqueSlug,
      },
    });
  } catch (error) {
    console.warn("Prisma createAdminCategory fallback:", error.message);
    return {
      id: `cat-${Date.now()}`,
      name: sanitizedName,
      slug: uniqueSlug,
    };
  }
}

/**
 * Membuat program kampanye baru dengan whitelisting atribut ketat (OWASP).
 */
export async function createAdminCampaign(payload) {
  const title = sanitizeInput(payload.title || "").trim();
  const location = sanitizeInput(payload.location || "Indonesia").trim();
  const story = sanitizeInput(payload.story || "").trim();
  const excerpt = sanitizeInput(payload.excerpt || story.slice(0, 160)).trim();
  const targetAmount = Math.max(0, parseInt(payload.targetAmount, 10) || 0);
  const isUrgent = Boolean(payload.isUrgent);
  const isFeatured = Boolean(payload.isFeatured);
  const bannerUrl = payload.bannerUrl ? sanitizeInput(payload.bannerUrl).trim() : null;
  let categoryId = payload.categoryId;
  const rawCat = payload.newCategoryName ? sanitizeInput(payload.newCategoryName).trim() : null;
  const newCategoryName = rawCat ? toTitleCase(rawCat) : null;
  const endDate = payload.endDate ? new Date(payload.endDate) : null;

  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

  if (!categoryId && newCategoryName) {
    return prisma.$transaction(async (tx) => {
      let category = await tx.category.findFirst({
        where: { name: { equals: newCategoryName, mode: "insensitive" } },
      });

      if (!category) {
        const catSlug = newCategoryName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        category = await tx.category.create({
          data: {
            name: newCategoryName,
            slug: `${catSlug || "kategori"}-${Date.now().toString().slice(-4)}`,
          },
        });
      }

      return tx.campaign.create({
        data: {
          title,
          slug: uniqueSlug,
          categoryId: category.id,
          targetAmount,
          collectedAmount: 0,
          donorCount: 0,
          endDate,
          isUrgent,
          isFeatured,
          location,
          excerpt,
          story,
          bannerUrl,
          status: "ACTIVE",
        },
        include: { category: true },
      });
    });
  }

  return prisma.campaign.create({
    data: {
      title,
      slug: uniqueSlug,
      categoryId,
      targetAmount,
      collectedAmount: 0,
      donorCount: 0,
      endDate,
      isUrgent,
      isFeatured,
      location,
      excerpt,
      story,
      bannerUrl,
      status: "ACTIVE",
    },
    include: { category: true },
  });
}

/**
 * Memperbarui program kampanye yang ada (OWASP Mass Assignment Protection).
 */
export async function updateAdminCampaign(id, payload) {
  const existingCampaign = await prisma.campaign.findUnique({
    where: { id },
    select: { categoryId: true, bannerUrl: true },
  });
  const oldCategoryId = existingCampaign?.categoryId;

  const updateData = {};

  if (payload.title !== undefined) updateData.title = sanitizeInput(payload.title).trim();
  if (payload.targetAmount !== undefined) updateData.targetAmount = Math.max(0, parseInt(payload.targetAmount, 10) || 0);
  if (payload.location !== undefined) updateData.location = sanitizeInput(payload.location).trim();
  if (payload.story !== undefined) updateData.story = sanitizeInput(payload.story).trim();
  if (payload.excerpt !== undefined) updateData.excerpt = sanitizeInput(payload.excerpt).trim();
  if (payload.status !== undefined && ["ACTIVE", "PAUSED", "COMPLETED"].includes(payload.status)) {
    updateData.status = payload.status;
  }
  if (payload.isUrgent !== undefined) updateData.isUrgent = Boolean(payload.isUrgent);
  if (payload.isFeatured !== undefined) updateData.isFeatured = Boolean(payload.isFeatured);
  if (payload.bannerUrl !== undefined) {
    updateData.bannerUrl = sanitizeInput(payload.bannerUrl).trim();
    if (existingCampaign?.bannerUrl && existingCampaign.bannerUrl !== updateData.bannerUrl) {
      await deleteFromR2(existingCampaign.bannerUrl);
    }
  }

  if (!payload.categoryId && payload.newCategoryName) {
    const rawCat = sanitizeInput(payload.newCategoryName).trim();
    const newCatName = rawCat ? toTitleCase(rawCat) : null;
    if (newCatName) {
      let category = await prisma.category.findFirst({
        where: { name: { equals: newCatName, mode: "insensitive" } },
      });
      if (!category) {
        const catSlug = newCatName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        category = await prisma.category.create({
          data: {
            name: newCatName,
            slug: `${catSlug || "kategori"}-${Date.now().toString().slice(-4)}`,
          },
        });
      }
      updateData.categoryId = category.id;
    }
  } else if (payload.categoryId !== undefined) {
    updateData.categoryId = payload.categoryId;
  }

  if (payload.endDate !== undefined) updateData.endDate = payload.endDate ? new Date(payload.endDate) : null;

  const updated = await prisma.campaign.update({
    where: { id },
    data: updateData,
  });

  // Auto-cleanup: jika kategori program berganti dan kategori sebelumnya menjadi kosong, hapus otomatis
  if (oldCategoryId && updateData.categoryId && oldCategoryId !== updateData.categoryId) {
    await cleanupOrphanCategories(prisma);
  }

  return updated;
}

/**
 * Menghapus program kampanye dari database dan membersihkan banner terkait di R2.
 */
export async function deleteAdminCampaign(id) {
  const existing = await prisma.campaign.findUnique({
    where: { id },
    select: { bannerUrl: true, categoryId: true },
  });

  if (existing?.bannerUrl) {
    await deleteFromR2(existing.bannerUrl);
  }

  const deleted = await prisma.campaign.delete({
    where: { id },
  });

  if (existing?.categoryId) {
    await cleanupOrphanCategories(prisma);
  }

  return deleted;
}
