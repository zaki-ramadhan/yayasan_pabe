import prisma from "@/lib/prisma";
import { DEPARTMENT_OPTIONS, TYPE_OPTIONS, LOCATION_OPTIONS } from "@/data/careers";
import { sanitizeInput, maskEmail } from "@/lib/security";

/**
 * Mengambil daftar seluruh lowongan pekerjaan (termasuk yang nonaktif) beserta jumlah pelamar.
 */
export async function getAdminVacancies({ search = "", department = "ALL" } = {}) {
  try {
    const where = {};
    if (department && department !== "ALL" && department !== "Semua Divisi") {
      where.department = { equals: department, mode: "insensitive" };
    }
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { department: { contains: q, mode: "insensitive" } },
        { location: { contains: q, mode: "insensitive" } },
      ];
    }

    const vacancies = await prisma.jobVacancy.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });

    return vacancies.map((v) => ({
      id: v.id,
      jobCode: v.jobCode,
      title: v.title,
      department: v.department,
      location: v.location,
      type: v.type,
      workplace: v.workplace,
      experience: v.experience,
      publishedDate: v.publishedDate,
      deadline: v.deadline,
      overview: v.overview,
      responsibilities: v.responsibilities || [],
      requirements: v.requirements || [],
      benefits: v.benefits || [],
      applyUrl: v.applyUrl,
      isActive: v.isActive,
      applicantCount: v._count?.applications || 0,
      createdAt: v.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Prisma getAdminVacancies error:", error);
    return [];
  }
}

/**
 * Membuat lowongan pekerjaan baru ke database.
 */
export async function createAdminVacancy(payload) {
  const title = sanitizeInput(payload.title || "").trim();
  const department = sanitizeInput(payload.department || "Operasional & Penyaluran").trim();
  const location = sanitizeInput(payload.location || "Jakarta Timur / Depok").trim();
  const type = sanitizeInput(payload.type || "Penuh Waktu (Full-time)").trim();
  const workplace = sanitizeInput(payload.workplace || "On-site").trim();
  const experience = sanitizeInput(payload.experience || "1 - 3 tahun").trim();
  const deadline = sanitizeInput(payload.deadline || "30 November 2026").trim();
  const overview = sanitizeInput(payload.overview || "").trim();
  const responsibilities = Array.isArray(payload.responsibilities)
    ? payload.responsibilities.map((r) => sanitizeInput(r).trim()).filter(Boolean)
    : [];
  const requirements = Array.isArray(payload.requirements)
    ? payload.requirements.map((r) => sanitizeInput(r).trim()).filter(Boolean)
    : [];
  const benefits = Array.isArray(payload.benefits)
    ? payload.benefits.map((b) => sanitizeInput(b).trim()).filter(Boolean)
    : [];

  if (!title || !department || !overview) {
    throw new Error("Judul posisi, divisi, dan deskripsi singkat wajib diisi.");
  }

  const jobCode = `JOB-${Date.now().toString().slice(-4)}`;
  const publishedDate = new Date().toISOString().split("T")[0];

  return prisma.jobVacancy.create({
    data: {
      jobCode,
      title,
      department,
      location,
      type,
      workplace,
      experience,
      publishedDate,
      deadline,
      overview,
      responsibilities,
      requirements,
      benefits,
      applyUrl: payload.applyUrl ? sanitizeInput(payload.applyUrl).trim() : null,
      isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
    },
  });
}

/**
 * Memperbarui lowongan pekerjaan atau toggle status aktif.
 */
export async function updateAdminVacancy(id, payload) {
  const updateData = {};
  if (payload.title !== undefined) updateData.title = sanitizeInput(payload.title).trim();
  if (payload.department !== undefined) updateData.department = sanitizeInput(payload.department).trim();
  if (payload.location !== undefined) updateData.location = sanitizeInput(payload.location).trim();
  if (payload.type !== undefined) updateData.type = sanitizeInput(payload.type).trim();
  if (payload.workplace !== undefined) updateData.workplace = sanitizeInput(payload.workplace).trim();
  if (payload.experience !== undefined) updateData.experience = sanitizeInput(payload.experience).trim();
  if (payload.deadline !== undefined) updateData.deadline = sanitizeInput(payload.deadline).trim();
  if (payload.overview !== undefined) updateData.overview = sanitizeInput(payload.overview).trim();
  if (payload.isActive !== undefined) updateData.isActive = Boolean(payload.isActive);

  if (Array.isArray(payload.responsibilities)) {
    updateData.responsibilities = payload.responsibilities.map((r) => sanitizeInput(r).trim()).filter(Boolean);
  }
  if (Array.isArray(payload.requirements)) {
    updateData.requirements = payload.requirements.map((r) => sanitizeInput(r).trim()).filter(Boolean);
  }
  if (Array.isArray(payload.benefits)) {
    updateData.benefits = payload.benefits.map((b) => sanitizeInput(b).trim()).filter(Boolean);
  }

  return prisma.jobVacancy.update({
    where: { id },
    data: updateData,
  });
}

/**
 * Menghapus lowongan pekerjaan beserta pelamar terkait (cascade).
 */
export async function deleteAdminVacancy(id) {
  return prisma.jobVacancy.delete({
    where: { id },
  });
}

/**
 * Menghapus banyak lowongan pekerjaan sekaligus beserta pelamar terkait (cascade).
 */
export async function deleteAdminVacanciesBatch(ids) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("Daftar ID lowongan tidak boleh kosong.");
  }

  const result = await prisma.jobVacancy.deleteMany({
    where: { id: { in: ids } },
  });

  return { count: result.count };
}

/**
 * Mengambil daftar pelamar pekerjaan.
 */
export async function getAdminApplications({ vacancyId = "", status = "" } = {}) {
  try {
    const where = {};
    if (vacancyId) where.vacancyId = vacancyId;
    if (status && status !== "ALL") where.status = status;

    const applications = await prisma.jobApplication.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        vacancy: {
          select: { id: true, title: true, department: true },
        },
      },
    });

    return applications.map((app) => ({
      id: app.id,
      vacancyId: app.vacancyId,
      vacancyTitle: app.vacancy?.title || "Posisi Umum",
      department: app.vacancy?.department || "-",
      fullName: app.fullName,
      email: app.email ? maskEmail(app.email) : "",
      phone: app.phone,
      linkedinUrl: app.linkedinUrl || "",
      portfolioUrl: app.portfolioUrl || "",
      coverLetter: app.coverLetter || "",
      resumeUrl: app.resumeUrl || "",
      status: app.status,
      createdAt: app.createdAt.toISOString(),
    }));
  } catch (error) {
    console.warn("Prisma getAdminApplications fallback:", error.message);
    return [];
  }
}

/**
 * Mengubah status review berkas pelamar pekerjaan.
 */
export async function updateApplicationStatus(applicationId, newStatus) {
  const validStatuses = ["PENDING", "REVIEWED", "SHORTLISTED", "REJECTED"];
  if (!validStatuses.includes(newStatus)) {
    throw new Error("Status pelamar tidak valid.");
  }

  return prisma.jobApplication.update({
    where: { id: applicationId },
    data: { status: newStatus },
  });
}
