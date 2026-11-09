import prisma from "@/lib/prisma";
import { DEPARTMENT_OPTIONS, TYPE_OPTIONS, LOCATION_OPTIONS, CAREER_VACANCIES } from "@/data/careers";
import { sanitizeInput, maskEmail } from "@/lib/security";
import { deleteMultipleFromR2 } from "@/lib/r2Storage";

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
      requiresResume: v.applyUrl === "WITHOUT_RESUME"
        ? false
        : (CAREER_VACANCIES.find((c) => c.id === (v.jobCode || v.id))?.requiresResume !== undefined
            ? CAREER_VACANCIES.find((c) => c.id === (v.jobCode || v.id)).requiresResume
            : v.applyUrl !== "WITHOUT_RESUME"),
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
  const department = sanitizeInput(payload.department || "Umum").trim();
  const location = sanitizeInput(payload.location || "Jakarta Timur / Depok").trim();
  const type = payload.type || "Kontrak";
  const workplace = payload.workplace || "On-site";
  const experience = sanitizeInput(payload.experience || "1 - 3 tahun").trim();
  const deadline = sanitizeInput(payload.deadline || "30 November 2026").trim();
  const overview = sanitizeInput(payload.overview || "").trim();
  const applyUrl = payload.applyUrl ? sanitizeInput(payload.applyUrl).trim() : null;

  const responsibilities = Array.isArray(payload.responsibilities)
    ? payload.responsibilities.map((r) => sanitizeInput(r).trim()).filter(Boolean)
    : [];

  const requirements = Array.isArray(payload.requirements)
    ? payload.requirements.map((r) => sanitizeInput(r).trim()).filter(Boolean)
    : [];

  const benefits = Array.isArray(payload.benefits)
    ? payload.benefits.map((b) => sanitizeInput(b).trim()).filter(Boolean)
    : [];

  const randomCode = `PABE-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  return prisma.jobVacancy.create({
    data: {
      jobCode: randomCode,
      title,
      department,
      location,
      type,
      workplace,
      experience,
      publishedDate: new Date().toISOString().split("T")[0],
      deadline,
      overview,
      responsibilities,
      requirements,
      benefits,
      applyUrl,
      isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
    },
  });
}

/**
 * Memperbarui data lowongan pekerjaan.
 */
export async function updateAdminVacancy(id, payload) {
  const data = {};

  if (payload.title !== undefined) data.title = sanitizeInput(payload.title).trim();
  if (payload.department !== undefined) data.department = sanitizeInput(payload.department).trim();
  if (payload.location !== undefined) data.location = sanitizeInput(payload.location).trim();
  if (payload.type !== undefined) data.type = payload.type;
  if (payload.workplace !== undefined) data.workplace = payload.workplace;
  if (payload.experience !== undefined) data.experience = sanitizeInput(payload.experience).trim();
  if (payload.deadline !== undefined) data.deadline = sanitizeInput(payload.deadline).trim();
  if (payload.overview !== undefined) data.overview = sanitizeInput(payload.overview).trim();
  if (payload.applyUrl !== undefined) {
    data.applyUrl = payload.applyUrl ? sanitizeInput(payload.applyUrl).trim() : null;
  }
  if (payload.isActive !== undefined) data.isActive = Boolean(payload.isActive);

  if (Array.isArray(payload.responsibilities)) {
    data.responsibilities = payload.responsibilities
      .map((r) => sanitizeInput(r).trim())
      .filter(Boolean);
  }

  if (Array.isArray(payload.requirements)) {
    data.requirements = payload.requirements
      .map((r) => sanitizeInput(r).trim())
      .filter(Boolean);
  }

  if (Array.isArray(payload.benefits)) {
    data.benefits = payload.benefits
      .map((b) => sanitizeInput(b).trim())
      .filter(Boolean);
  }

  return prisma.jobVacancy.update({
    where: { id },
    data,
  });
}

/**
 * Mengubah status aktif/nonaktif lowongan pekerjaan.
 */
export async function toggleAdminVacancyStatus(id, isActive) {
  return prisma.jobVacancy.update({
    where: { id },
    data: { isActive: Boolean(isActive) },
  });
}

/**
 * Menghapus lowongan pekerjaan beserta pelamar terkait (cascade) dan membersihkan berkas CV di R2.
 */
export async function deleteAdminVacancy(id) {
  const applications = await prisma.jobApplication.findMany({
    where: { vacancyId: id, resumeUrl: { not: null } },
    select: { resumeUrl: true },
  });

  const resumeUrls = applications.map((a) => a.resumeUrl).filter(Boolean);
  if (resumeUrls.length > 0) {
    try {
      await deleteMultipleFromR2(resumeUrls);
    } catch (err) {
      console.warn(`[AdminCareer] Gagal membersihkan berkas resume R2 untuk lowongan ${id}:`, err?.message);
    }
  }

  return prisma.jobVacancy.delete({
    where: { id },
  });
}

/**
 * Menghapus banyak lowongan pekerjaan sekaligus beserta berkas pelamar terkait di R2.
 */
export async function deleteAdminVacanciesBatch(ids) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("Daftar ID lowongan tidak boleh kosong.");
  }

  const validIds = ids.filter((i) => typeof i === "string" && i.trim().length > 0);
  if (validIds.length === 0) {
    throw new Error("Tidak ada ID lowongan yang valid.");
  }

  const applications = await prisma.jobApplication.findMany({
    where: { vacancyId: { in: validIds }, resumeUrl: { not: null } },
    select: { resumeUrl: true },
  });

  const resumeUrls = applications.map((a) => a.resumeUrl).filter(Boolean);
  if (resumeUrls.length > 0) {
    try {
      await deleteMultipleFromR2(resumeUrls);
    } catch (err) {
      console.warn("[AdminCareer] Gagal membersihkan berkas resume R2 pada batch delete:", err?.message);
    }
  }

  const result = await prisma.jobVacancy.deleteMany({
    where: { id: { in: validIds } },
  });

  return { count: result.count };
}

/**
 * Mengambil daftar pelamar pekerjaan dengan dukungan filter, sorting, dan paginasi.
 */
export async function getAdminApplications({
  vacancyId = "",
  status = "",
  sort = "newest",
  page = 1,
  limit = 15,
} = {}) {
  try {
    const where = {};
    if (vacancyId) where.vacancyId = vacancyId;
    if (status && status !== "ALL") where.status = status;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, Math.min(50, parseInt(limit, 10) || 15));
    const skip = (parsedPage - 1) * parsedLimit;

    // Sorting createdAt desc / asc
    const orderBy = {
      createdAt: sort === "oldest" ? "asc" : "desc",
    };

    const [total, applications] = await Promise.all([
      prisma.jobApplication.count({ where }),
      prisma.jobApplication.findMany({
        where,
        skip,
        take: parsedLimit,
        orderBy,
        include: {
          vacancy: {
            select: { id: true, title: true, department: true },
          },
        },
      }),
    ]);

    const items = applications.map((app) => ({
      id: app.id,
      vacancyId: app.vacancyId,
      vacancyTitle: app.vacancy?.title || "Posisi Umum",
      department: app.vacancy?.department || "-",
      fullName: app.fullName,
      email: app.email || "",
      phone: app.phone || "",
      linkedinUrl: app.linkedinUrl || "",
      portfolioUrl: app.portfolioUrl || "",
      coverLetter: app.coverLetter || "",
      resumeUrl: app.resumeUrl || "",
      status: app.status,
      createdAt: app.createdAt.toISOString(),
    }));

    return {
      items,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total,
        totalPages: Math.ceil(total / parsedLimit),
        hasMore: skip + items.length < total,
      },
    };
  } catch (error) {
    console.warn("Prisma getAdminApplications fallback:", error.message);
    return {
      items: [],
      pagination: { page: 1, limit: 15, total: 0, totalPages: 0, hasMore: false },
    };
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
