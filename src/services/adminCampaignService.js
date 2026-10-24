import prisma from "@/lib/prisma";
import { CAMPAIGNS } from "@/data/campaigns";
import { sanitizeInput } from "@/lib/security";
import { toTitleCase } from "@/lib/formatters";
import { cleanupOrphanCategories } from "./categoryService";

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
        bannerUrl: c.bannerUrl || "/img/hero_card_1.jpeg",
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
    console.warn("Prisma getAdminCampaigns fallback:", error.message);
    const filtered = CAMPAIGNS.filter((c) => {
      if (status && status !== "ALL" && c.status !== status) return false;
      if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    return {
      items: filtered.slice(skip, skip + limit).map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        category: c.category || "Program Umum",
        categoryId: c.categoryId || "cat-1",
        targetAmount: Number(c.targetAmount || 0),
        collectedAmount: Number(c.collectedAmount || 0),
        disbursedAmount: c.updates?.reduce((acc, u) => acc + Number(u.disbursedAmount || 0), 0) || 0,
        updatesCount: c.updates?.length || 0,
        donorCount: c.donorCount || 0,
        endDate: c.endDate || null,
        status: c.status || "ACTIVE",
        isUrgent: Boolean(c.isUrgent),
        isFeatured: Boolean(c.isFeatured),
        location: c.location || "Nasional",
        bannerUrl: c.bannerUrl || "/img/hero_card_1.jpeg",
        createdAt: new Date().toISOString(),
      })),
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit) || 1,
      },
      categories: [
        { id: "cat-1", name: "Pendidikan & Santri", slug: "pendidikan" },
        { id: "cat-2", name: "Kesehatan Dhuafa", slug: "kesehatan" },
        { id: "cat-3", name: "Pemberdayaan Ekonomi", slug: "ekonomi" },
        { id: "cat-4", name: "Tanggap Bencana", slug: "bencana" },
      ],
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
  const bannerUrl = sanitizeInput(payload.bannerUrl || "/img/hero_card_1.jpeg").trim();
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
    select: { categoryId: true },
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
  if (payload.bannerUrl !== undefined) updateData.bannerUrl = sanitizeInput(payload.bannerUrl).trim();

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
