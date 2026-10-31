import prisma from "@/lib/prisma";
import { sanitizeInput } from "@/lib/security";
import { verifyEmailDomainDns } from "@/lib/serverDnsValidator";
import { validateWebUrl, validatePhone } from "@/lib/validator";
import { CAREER_VACANCIES } from "@/data/careers";

/**
 * Retrieve active job vacancies directly from PostgreSQL
 */
export async function getJobVacancies({
  search = "",
  location = "Semua Lokasi",
  type = "Semua Tipe",
  department = "Semua Divisi",
} = {}) {
  try {
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
      requiresResume: v.applyUrl === "WITHOUT_RESUME"
        ? false
        : (CAREER_VACANCIES.find((c) => c.id === (v.jobCode || v.id))?.requiresResume !== undefined
            ? CAREER_VACANCIES.find((c) => c.id === (v.jobCode || v.id)).requiresResume
            : v.applyUrl !== "WITHOUT_RESUME"),
      applicantCount: v._count?.applications || 0,
    }));
  } catch (error) {
    console.error("Prisma getJobVacancies error:", error);
    return [];
  }
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
        requiresResume: vacancy.applyUrl === "WITHOUT_RESUME"
          ? false
          : (CAREER_VACANCIES.find((c) => c.id === (vacancy.jobCode || vacancy.id))?.requiresResume !== undefined
              ? CAREER_VACANCIES.find((c) => c.id === (vacancy.jobCode || vacancy.id)).requiresResume
              : vacancy.applyUrl !== "WITHOUT_RESUME"),
        applicantCount: vacancy._count?.applications || 0,
      };
    }
  } catch (error) {
    console.error("Prisma getJobVacancyById error:", error);
  }

  return null;
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
  const emailVal = await verifyEmailDomainDns(email, { isRequired: true });
  if (!emailVal.isValid) {
    throw new Error(emailVal.message || "Format alamat email tidak valid.");
  }
  const phoneVal = validatePhone(phone, { fieldName: "Nomor WhatsApp/telepon" });
  if (!phoneVal.isValid) {
    throw new Error(phoneVal.message);
  }
  const cleanPhone = phoneVal.sanitized;
  if (!coverLetter || typeof coverLetter !== "string" || coverLetter.trim().length < 10) {
    throw new Error("Surat pengantar / alasan melamar wajib diisi minimal 10 karakter.");
  }

  // Resolve target vacancy in DB
  const targetVacancy = await prisma.jobVacancy.findFirst({
    where: {
      OR: [{ id: vacancyId }, { jobCode: vacancyId }],
    },
  });

  if (!targetVacancy) {
    throw new Error("Posisi lowongan pekerjaan yang dipilih tidak ditemukan.");
  }

  const matchingStatic = CAREER_VACANCIES.find(
    (c) => c.id === (targetVacancy.jobCode || targetVacancy.id)
  );
  const requiresResume = targetVacancy.applyUrl === "WITHOUT_RESUME"
    ? false
    : matchingStatic?.requiresResume !== undefined
    ? matchingStatic.requiresResume
    : targetVacancy.applyUrl !== "WITHOUT_RESUME";
  let cleanResume = null;

  if (requiresResume) {
    if (!resumeUrl || typeof resumeUrl !== "string" || !resumeUrl.trim()) {
      throw new Error("Berkas CV / resume (PDF) wajib dicantumkan untuk posisi ini.");
    }
    const resumeVal = validateWebUrl(resumeUrl.trim());
    if (!resumeVal.isValid) {
      throw new Error("Tautan berkas CV / resume tidak valid. Harap masukkan alamat URL yang benar.");
    }
    cleanResume = sanitizeInput(resumeVal.normalizedUrl);
  } else if (resumeUrl && typeof resumeUrl === "string" && resumeUrl.trim()) {
    const resumeVal = validateWebUrl(resumeUrl.trim());
    if (resumeVal.isValid) {
      cleanResume = sanitizeInput(resumeVal.normalizedUrl);
    }
  }

  let cleanLinkedin = null;
  if (linkedinUrl && typeof linkedinUrl === "string" && linkedinUrl.trim()) {
    const linkVal = validateWebUrl(linkedinUrl.trim());
    if (!linkVal.isValid) {
      throw new Error("Tautan LinkedIn / portofolio tidak valid. Harap masukkan alamat URL yang benar.");
    }
    cleanLinkedin = sanitizeInput(linkVal.normalizedUrl);
  }

  const cleanFullName = sanitizeInput(fullName.trim());
  const cleanEmail = emailVal.sanitized;
  const cleanPortfolio = portfolioUrl ? sanitizeInput(portfolioUrl.trim()) : null;
  const cleanCoverLetter = sanitizeInput(coverLetter.trim());

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
}
