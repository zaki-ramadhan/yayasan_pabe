import prisma from "@/lib/prisma";
import { sanitizeInput } from "@/lib/security";

/**
 * Mengambil daftar seluruh pertanyaan FAQ dari PostgreSQL dengan filter pencarian.
 */
export async function getAdminFaqs({ search = "" } = {}) {
  try {
    const where = { isActive: true };
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { question: { contains: q, mode: "insensitive" } },
        { answer: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
      ];
    }

    return await prisma.faq.findMany({
      where,
      orderBy: { order: "asc" },
    });
  } catch (error) {
    console.warn("Prisma getAdminFaqs error:", error.message);
    return [];
  }
}

/**
 * Menambahkan butir FAQ baru ke database.
 */
export async function createAdminFaq(payload) {
  const question = sanitizeInput(payload.question || "").trim();
  const answer = sanitizeInput(payload.answer || "").trim();
  const category = sanitizeInput(payload.category || "Umum").trim();

  if (!question || !answer) {
    throw new Error("Pertanyaan dan jawaban FAQ wajib diisi.");
  }

  const count = await prisma.faq.count().catch(() => 0);

  return await prisma.faq.create({
    data: {
      question,
      answer,
      category,
      order: count + 1,
      isActive: true,
    },
  });
}

/**
 * Memperbarui butir FAQ yang tersimpan di database.
 */
export async function updateAdminFaq(id, payload) {
  const data = {};
  if (payload.question !== undefined) data.question = sanitizeInput(payload.question).trim();
  if (payload.answer !== undefined) data.answer = sanitizeInput(payload.answer).trim();
  if (payload.category !== undefined) data.category = sanitizeInput(payload.category).trim();
  if (payload.order !== undefined) data.order = Number(payload.order);
  if (payload.isActive !== undefined) data.isActive = Boolean(payload.isActive);

  return await prisma.faq.update({
    where: { id },
    data,
  });
}

/**
 * Menghapus butir FAQ dari database.
 */
export async function deleteAdminFaq(id) {
  await prisma.faq.delete({
    where: { id },
  });
  return true;
}

/**
 * Menghapus banyak butir FAQ sekaligus dari database.
 */
export async function deleteAdminFaqsBatch(ids) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("Daftar ID FAQ tidak boleh kosong.");
  }
  const result = await prisma.faq.deleteMany({
    where: {
      id: { in: ids },
    },
  });
  return { count: result.count };
}
