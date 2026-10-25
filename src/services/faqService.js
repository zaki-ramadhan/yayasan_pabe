import prisma from "@/lib/prisma";
import { FAQS } from "@/data/faqs";

/**
 * Mengambil daftar FAQ publik yang aktif dari PostgreSQL.
 * Memiliki fallback ke data master jika tabel database kosong.
 * @param {object} [options]
 * @param {string} [options.category]
 * @param {number} [options.limit]
 * @returns {Promise<Array>}
 */
export async function getFaqs({ category, limit } = {}) {
  try {
    const where = { isActive: true };
    if (category) {
      where.category = category;
    }

    const faqs = await prisma.faq.findMany({
      where,
      orderBy: { order: "asc" },
      take: limit ? Number(limit) : undefined,
    });

    if (faqs && faqs.length > 0) {
      return faqs;
    }
  } catch (error) {
    console.warn("Prisma getFaqs fallback warning:", error.message);
  }

  let fallbackList = FAQS.filter((f) => f.isActive !== false);
  if (category) {
    fallbackList = fallbackList.filter((f) => f.category === category);
  }
  if (limit) {
    fallbackList = fallbackList.slice(0, Number(limit));
  }
  return fallbackList;
}
