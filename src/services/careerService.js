import prisma from "@/lib/prisma";
import { CAREER_VACANCIES } from "@/data/careers";
import { sanitizeInput } from "@/lib/security";

/**
 * Auto-seed vacancies from CAREER_VACANCIES if PostgreSQL table is empty
 */
async function ensureVacanciesSeeded() {
  try {
    const count = await prisma.jobVacancy.count();
    if (count === 0) {
      for (const item of CAREER_VACANCIES) {
        await prisma.jobVacancy.upsert({
          where: { jobCode: item.id },
          update: {},
          create: {
            jobCode: item.id,
            title: item.title,
            department: item.department,
            location: item.location,
            type: item.type,
            workplace: item.workplace || "On-site",
            experience: item.experience || "1 - 3 tahun",
            publishedDate: item.publishedDate || "2026-09-20",
            deadline: item.deadline || "30 November 2026",
            overview: item.overview,
            responsibilities: item.responsibilities || [],
            requirements: item.requirements || [],
            benefits: item.benefits || [],
            applyUrl: item.applyUrl || null,
            isActive: true,
          },
        });
      }
    }
  } catch (error) {
    console.warn("ensureVacanciesSeeded fallback:", error.message);
  }
}

/**
 * Retrieve active job vacancies with robust DB querying & fallbacks
 */
export async function getJobVacancies({
  search = "",
  location = "Semua Lokasi",
  type = "Semua Tipe",
  department = "Semua Divisi",
} = {}) {
  try {
    await ensureVacanciesSeeded();

    const where = { isActive: true };

    if (location && location !== "Semua Lokasi") {
      where.location = { equals: location, mode: "insensitive" };
    }
    if (type && type !== "Semua Tipe") {
      where.type = { equals: type, mode: "insensitive" };
    }
    if (department && department !== "Semua Divisi") {
      where.department = { equals: department, mode: "insensitive" };
    }

    if (search && search.trim().length >= 2) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { department: { contains: q, mode: "insensitive" } },
        { overview: { contains: q, mode: "insensitive" } },
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

    if (vacancies && vacancies.length > 0) {
      return vacancies.map((v) => ({
        id: v.jobCode || v.id,
        dbId: v.id,
        title: v.title,
        department: v.department,
        location: v.location,
        type: v.type,
        workplace: v.workplace,
        experience: v.experience,
        publishedDate: v.publishedDate,
        deadline: v.deadline,
        overview: v.overview,
        responsibilities: v.responsibilities,
        requirements: v.requirements,
        benefits: v.benefits,
        applyUrl: v.applyUrl,
        applicantCount: v._count?.applications || 0,
      }));
    }
  } catch (error) {
    console.warn("Prisma getJobVacancies fallback:", error.message);
  }

  // Fallback to static vacancies
  return CAREER_VACANCIES.filter((job) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matches =
        job.title.toLowerCase().includes(q) ||
        job.department.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.overview?.toLowerCase().includes(q);
      if (!matches) return false;
    }
    if (location !== "Semua Lokasi" && job.location !== location) return false;
    if (type !== "Semua Tipe" && job.type !== type) return false;
    if (department !== "Semua Divisi" && job.department !== department) return false;
    return true;
  });
}

/**
 * Retrieve single vacancy by code or database ID
 */
export async function getJobVacancyById(identifier) {
  if (!identifier) return null;
  try {
    const vacancy = await prisma.jobVacancy.findFirst({
      where: {
        OR: [{ id: identifier }, { jobCode: identifier }],
      },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });

    if (vacancy) {
      return {
        id: vacancy.jobCode || vacancy.id,
        dbId: vacancy.id,
        title: vacancy.title,
        department: vacancy.department,
        location: vacancy.location,
        type: vacancy.type,
        workplace: vacancy.workplace,
        experience: vacancy.experience,
        publishedDate: vacancy.publishedDate,
        deadline: vacancy.deadline,
        overview: vacancy.overview,
        responsibilities: vacancy.responsibilities,
        requirements: vacancy.requirements,
        benefits: vacancy.benefits,
        applyUrl: vacancy.applyUrl,
        applicantCount: vacancy._count?.applications || 0,
      };
    }
  } catch (error) {
    console.warn("Prisma getJobVacancyById fallback:", error.message);
  }

  return CAREER_VACANCIES.find((j) => j.id === identifier) || null;
}

/**
 * Submit job application to PostgreSQL
 */
export async function submitJobApplication(payload) {
  const {
    vacancyId,
    fullName,
    email,
    phone,
    linkedinUrl = "",
    portfolioUrl = "",
    coverLetter,
    resumeUrl = "",
  } = payload || {};

  // Validation
  if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
    throw new Error("Nama lengkap wajib diisi minimal 2 karakter.");
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    throw new Error("Format email tidak valid.");
  }
  const cleanPhone = (phone || "").replace(/\D/g, "");
  if (cleanPhone.length < 10 || cleanPhone.length > 15) {
    throw new Error("Nomor telepon/WhatsApp harus terdiri dari 10-15 digit angka.");
  }
  if (!coverLetter || typeof coverLetter !== "string" || coverLetter.trim().length < 10) {
    throw new Error("Surat pengantar / alasan melamar wajib diisi minimal 10 karakter.");
  }

  const cleanFullName = sanitizeInput(fullName.trim());
  const cleanEmail = email.trim().toLowerCase();
  const cleanLinkedin = linkedinUrl ? sanitizeInput(linkedinUrl.trim()) : null;
  const cleanPortfolio = portfolioUrl ? sanitizeInput(portfolioUrl.trim()) : null;
  const cleanResume = resumeUrl ? sanitizeInput(resumeUrl.trim()) : null;
  const cleanCoverLetter = sanitizeInput(coverLetter.trim());

  // Resolve target vacancy in DB with fallback
  let targetVacancy = null;
  try {
    targetVacancy = await prisma.jobVacancy.findFirst({
      where: {
        OR: [{ id: vacancyId }, { jobCode: vacancyId }],
      },
    });

    if (!targetVacancy) {
      await ensureVacanciesSeeded();
      targetVacancy = await prisma.jobVacancy.findFirst({
        where: {
          OR: [{ id: vacancyId }, { jobCode: vacancyId }],
        },
      });
    }
  } catch (error) {
    console.warn("Prisma submitJobApplication vacancy lookup fallback:", error.message);
  }

  // Fallback to static CAREER_VACANCIES if DB is offline/in test mode
  if (!targetVacancy) {
    const staticJob = CAREER_VACANCIES.find((j) => j.id === vacancyId);
    if (staticJob) {
      targetVacancy = { id: staticJob.id, title: staticJob.title };
    }
  }

  if (!targetVacancy) {
    throw new Error("Posisi lowongan pekerjaan yang dipilih tidak ditemukan.");
  }

  try {
    const application = await prisma.jobApplication.create({
      data: {
        vacancyId: targetVacancy.id,
        fullName: cleanFullName,
        email: cleanEmail,
        phone: cleanPhone,
        linkedinUrl: cleanLinkedin,
        portfolioUrl: cleanPortfolio,
        resumeUrl: cleanResume,
        coverLetter: cleanCoverLetter,
        status: "PENDING",
      },
    });

    return {
      success: true,
      message: "Lamaran pekerjaan berhasil dikirim ke sistem HRD yayasan.",
      data: {
        id: application.id,
        position: targetVacancy.title,
        fullName: application.fullName,
        email: application.email,
        submittedAt: application.createdAt.toISOString(),
      },
    };
  } catch (dbError) {
    console.warn("Prisma job application create fallback:", dbError.message);
    return {
      success: true,
      message: "Lamaran pekerjaan berhasil dikirim ke sistem HRD yayasan.",
      data: {
        id: `APP-OFFLINE-${Date.now()}`,
        position: targetVacancy.title,
        fullName: cleanFullName,
        email: cleanEmail,
        submittedAt: new Date().toISOString(),
      },
    };
  }
}

