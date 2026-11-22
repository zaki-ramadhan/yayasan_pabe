import prisma from "@/lib/prisma";
import { sanitizeInput } from "@/lib/security";
import { verifyEmailDomainDns } from "@/lib/serverDnsValidator";
import { validateWebUrl, validateResumeUrl, validatePhone } from "@/lib/validator";
import { CAREER_VACANCIES } from "@/data/careers";
import { broadcastAdminEvent } from "@/lib/sseBroadcast";
import { sendCareerApplicationEmail } from "@/services/emailService";

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
      quota: typeof v.quota === "number" && v.quota >= 1 ? v.quota : 1,
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
        quota: typeof vacancy.quota === "number" && vacancy.quota >= 1 ? vacancy.quota : 1,
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

  if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
    throw new Error("Nama lengkap wajib diisi minimal 2 karakter.");
  }
  const emailVal = await verifyEmailDomainDns(email, { isRequired: true });
  if (!emailVal.isValid) {
    throw new Error(emailVal.message || "Format alamat email tidak valid.");
  }
  const phoneVal = validatePhone(phone, { fieldName: "Nomor WhatsApp" });
  if (!phoneVal.isValid) {
    throw new Error(phoneVal.message);
  }
  const cleanPhone = phoneVal.sanitized;
  if (!coverLetter || typeof coverLetter !== "string" || coverLetter.trim().length < 10) {
    throw new Error("Surat pengantar / alasan melamar wajib diisi minimal 10 karakter.");
  }

  const targetVacancy = await prisma.jobVacancy.findFirst({
    where: {
      OR: [{ id: vacancyId }, { jobCode: vacancyId }],
    },
  });

  if (!targetVacancy) {
    throw new Error("Posisi lowongan pekerjaan yang dipilih tidak ditemukan.");
  }

  if (targetVacancy.isActive === false) {
    throw new Error("Penerimaan berkas untuk lowongan pekerjaan ini telah ditutup.");
  }

  const cleanEmail = emailVal.sanitized.toLowerCase();

  // GUARD 1: Anti-Double Job
  const acceptedApp = await prisma.jobApplication.findFirst({
    where: {
      email: cleanEmail,
      status: "ACCEPTED",
    },
    select: { id: true, vacancy: { select: { title: true } } },
  });
  if (acceptedApp) {
    throw new Error(
      `Akun Anda telah terikat kontrak kerja aktif untuk posisi "${acceptedApp.vacancy?.title || "Karyawan Yayasan"}". Anda tidak dapat mengajukan lamaran baru (Anti-Double Job).`
    );
  }

  const existingStaff = await prisma.user.findFirst({
    where: { email: cleanEmail },
    select: { role: true },
  });
  const staffRoles = ["SUPERADMIN", "ADMIN", "OPERATIONAL", "FINANCE", "DISTRIBUTION", "REPRESENTATIVE"];
  if (existingStaff?.role && staffRoles.includes(existingStaff.role)) {
    throw new Error("Staf internal yayasan tidak diperkenankan mengajukan lamaran kerja baru.");
  }

  // GUARD 2: Anti-Duplicate untuk posisi yang sama
  const duplicateActive = await prisma.jobApplication.findFirst({
    where: {
      vacancyId: targetVacancy.id,
      email: cleanEmail,
      status: { in: ["PENDING", "REVIEWED", "SHORTLISTED"] },
    },
    select: { id: true },
  });
  if (duplicateActive) {
    throw new Error(
      "Anda telah mengirimkan berkas lamaran untuk posisi ini dan saat ini masih dalam proses seleksi."
    );
  }

  // GUARD 3: Kuota Maksimal Lamaran Aktif (Maksimal 2 posisi aktif bersamaan)
  const activeApplicationsCount = await prisma.jobApplication.count({
    where: {
      email: cleanEmail,
      status: { in: ["PENDING", "REVIEWED", "SHORTLISTED"] },
    },
  });
  if (activeApplicationsCount >= 2) {
    throw new Error(
      "Anda telah mencapai batas maksimal 2 lamaran aktif yang berjalan bersamaan. Harap tunggu proses peninjauan selesai sebelum melamar posisi lain."
    );
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
    const resumeVal = validateResumeUrl(resumeUrl.trim());
    if (!resumeVal.isValid) {
      throw new Error("Berkas CV / resume tidak valid. Harap unggah berkas PDF yang benar.");
    }
    cleanResume = sanitizeInput(resumeVal.normalizedUrl);
  } else if (resumeUrl && typeof resumeUrl === "string" && resumeUrl.trim()) {
    const resumeVal = validateResumeUrl(resumeUrl.trim());
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

  if (cleanEmail && cleanPhone) {
    try {
      const existingUser = await prisma.user.findFirst({
        where: { email: cleanEmail },
        select: { id: true, phone: true },
      });
      if (existingUser && (!existingUser.phone || existingUser.phone === "-")) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { phone: cleanPhone },
        });
      }
    } catch (uErr) {
      console.warn("Gagal sinkronisasi otomatis nomor WhatsApp pelamar ke profil:", uErr?.message);
    }
  }

    if (cleanEmail) {
    try {
      await sendCareerApplicationEmail({
        to: cleanEmail,
        name: application.fullName,
        position: targetVacancy.title,
        department: targetVacancy.department,
      });
    } catch (emailErr) {
      console.warn("Gagal mengirim email konfirmasi lamaran kerja:", emailErr?.message);
    }
  }

  try {
    broadcastAdminEvent("CAREER_APPLICATION", {
      id: application.id,
      vacancyId: targetVacancy.id,
      position: targetVacancy.title,
      fullName: application.fullName,
      email: application.email,
      submittedAt: application.createdAt.toISOString(),
    });
  } catch (sseErr) {
    console.warn("Peringatan: Gagal broadcast SSE career application:", sseErr?.message);
  }

  return {
    success: true,
    message: "Lamaran Anda berhasil dikirim. Tim kami akan segera meninjaunya.",
    data: {
      id: application.id,
      position: targetVacancy.title,
      fullName: application.fullName,
      email: application.email,
      submittedAt: application.createdAt.toISOString(),
    },
  };
}

/**
 * Membatalkan berkas lamaran pekerjaan yang diajukan oleh pengguna.
 * Hanya diizinkan jika status masih PENDING (belum direview oleh HR).
 */
export async function cancelUserJobApplication(applicationId, userEmail) {
  if (!applicationId || !userEmail) {
    throw new Error("ID lamaran dan email pengguna wajib disertakan.");
  }

  const cleanEmail = userEmail.trim().toLowerCase();

  const application = await prisma.jobApplication.findFirst({
    where: {
      id: applicationId,
      email: cleanEmail,
    },
    include: {
      vacancy: {
        select: { id: true, title: true },
      },
    },
  });

  if (!application) {
    throw new Error("Data lamaran pekerjaan tidak ditemukan.");
  }

  if (application.status !== "PENDING") {
    throw new Error(
      "Lamaran yang sedang diproses atau telah ditinjau tidak dapat dibatalkan melalui sistem."
    );
  }

  await prisma.jobApplication.delete({
    where: { id: application.id },
  });

  try {
    broadcastAdminEvent("CAREER_APPLICATION_CANCELLED", {
      id: application.id,
      vacancyId: application.vacancyId,
      position: application.vacancy?.title,
      email: application.email,
    });
  } catch (sseErr) {
    console.warn("Peringatan: Gagal broadcast SSE pembatalan lamaran:", sseErr?.message);
  }

  return {
    success: true,
    message: "Lamaran pekerjaan berhasil dibatalkan.",
    data: {
      id: application.id,
      vacancyId: application.vacancyId,
    },
  };
}
