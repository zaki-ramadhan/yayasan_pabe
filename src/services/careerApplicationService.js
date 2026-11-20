import prisma from "@/lib/prisma";

/**
 * Service untuk mengambil daftar lamaran pekerjaan yang diajukan oleh pengguna (berdasarkan email sesi).
 * Menjaga prinsip Single Responsibility Principle (SRP) dan keamanan data anti-IDOR.
 *
 * @param {string} userEmail
 * @returns {Promise<Array<object>>}
 */
export async function getUserApplications(userEmail) {
  if (!userEmail || typeof userEmail !== "string") {
    return [];
  }

  const cleanEmail = userEmail.trim().toLowerCase();

  try {
    const applications = await prisma.jobApplication.findMany({
      where: {
        email: {
          equals: cleanEmail,
          mode: "insensitive",
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        vacancy: {
          select: {
            id: true,
            jobCode: true,
            title: true,
            department: true,
            location: true,
            type: true,
            workplace: true,
            deadline: true,
          },
        },
      },
    });

    return applications.map((app) => ({
      id: app.id,
      vacancyId: app.vacancy?.jobCode || app.vacancy?.id || app.vacancyId,
      vacancyDbId: app.vacancyId,
      position: app.vacancy?.title || "Posisi Tidak Diketahui",
      department: app.vacancy?.department || "Umum",
      location: app.vacancy?.location || "Indonesia",
      type: app.vacancy?.type || "Penuh Waktu",
      workplace: app.vacancy?.workplace || "Kantor",
      deadline: app.vacancy?.deadline || null,
      fullName: app.fullName,
      email: app.email,
      phone: app.phone,
      resumeUrl: app.resumeUrl,
      portfolioUrl: app.portfolioUrl,
      linkedinUrl: app.linkedinUrl,
      coverLetter: app.coverLetter,
      status: app.status || "PENDING",
      createdAt: app.createdAt ? app.createdAt.toISOString() : new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Prisma getUserApplications error:", error);
    return [];
  }
}

