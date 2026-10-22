import { FAQS } from "@/data/articles";
import { sanitizeInput } from "@/lib/security";

// In-memory runtime state for FAQs with default data
let runtimeFaqs = FAQS.map((faq, index) => ({
  id: `faq-${index + 1}`,
  question: faq.question,
  answer: faq.answer,
  category: "Umum",
  order: index + 1,
  updatedAt: new Date().toISOString(),
}));

/**
 * Mengambil daftar seluruh pertanyaan FAQ dengan filter pencarian.
 */
export async function getAdminFaqs({ search = "" } = {}) {
  let list = [...runtimeFaqs];
  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    list = list.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
    );
  }
  return list.sort((a, b) => a.order - b.order);
}

/**
 * Menambahkan butir FAQ baru.
 */
export async function createAdminFaq(payload) {
  const question = sanitizeInput(payload.question || "").trim();
  const answer = sanitizeInput(payload.answer || "").trim();
  const category = sanitizeInput(payload.category || "Umum").trim();

  if (!question || !answer) {
    throw new Error("Pertanyaan dan jawaban FAQ wajib diisi.");
  }

  const newFaq = {
    id: `faq-${Date.now()}`,
    question,
    answer,
    category,
    order: runtimeFaqs.length + 1,
    updatedAt: new Date().toISOString(),
  };

  runtimeFaqs.push(newFaq);
  return newFaq;
}

/**
 * Memperbarui butir FAQ yang sudah ada.
 */
export async function updateAdminFaq(id, payload) {
  const index = runtimeFaqs.findIndex((f) => f.id === id);
  if (index === -1) {
    throw new Error("Data FAQ tidak ditemukan.");
  }

  if (payload.question !== undefined) {
    runtimeFaqs[index].question = sanitizeInput(payload.question).trim();
  }
  if (payload.answer !== undefined) {
    runtimeFaqs[index].answer = sanitizeInput(payload.answer).trim();
  }
  if (payload.category !== undefined) {
    runtimeFaqs[index].category = sanitizeInput(payload.category).trim();
  }
  if (payload.order !== undefined) {
    runtimeFaqs[index].order = Number(payload.order) || runtimeFaqs[index].order;
  }
  runtimeFaqs[index].updatedAt = new Date().toISOString();

  return runtimeFaqs[index];
}

/**
 * Menghapus butir FAQ.
 */
export async function deleteAdminFaq(id) {
  const initialLength = runtimeFaqs.length;
  runtimeFaqs = runtimeFaqs.filter((f) => f.id !== id);
  if (runtimeFaqs.length === initialLength) {
    throw new Error("Data FAQ tidak ditemukan untuk dihapus.");
  }
  return true;
}
