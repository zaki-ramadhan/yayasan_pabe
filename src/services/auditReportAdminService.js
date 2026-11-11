import prisma from "@/lib/prisma";
import { sanitizeInput } from "@/lib/security";

/**
 * Mengambil daftar laporan audit keuangan tahunan.
 */
export async function getAdminAuditReports({ search = "" } = {}) {
  try {
    const where = {};
    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: "insensitive" } },
        { auditorName: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const reports = await prisma.auditReport.findMany({
      where,
      orderBy: { year: "desc" },
    });

    return reports.map((r) => ({
      id: r.id,
      year: r.year,
      title: r.title,
      auditorName: r.auditorName,
      opinionStatus: r.opinionStatus,
      totalFundsIn: Number(r.totalFundsIn || 0),
      totalFundsOut: Number(r.totalFundsOut || 0),
      beneficiaryCount: Number(r.beneficiaryCount || 0),
      operationalRatio: r.operationalRatio || "12.4%",
      summary: r.summary || "",
      pdfUrl: r.pdfUrl || "",
      publishedAt: r.publishedAt instanceof Date ? r.publishedAt.toISOString() : r.publishedAt,
    }));
  } catch (error) {
    console.warn("Prisma getAdminAuditReports fallback:", error.message);
    return [];
  }
}

/**
 * Membuat laporan audit baru.
 */
export async function createAuditReport({
  year,
  title,
  auditorName,
  opinionStatus = "Terbuka & Akuntabel",
  totalFundsIn,
  totalFundsOut,
  beneficiaryCount,
  operationalRatio,
  summary,
  pdfUrl,
}) {
  const parsedYear = parseInt(year, 10);
  if (!parsedYear || parsedYear < 2000 || parsedYear > 2100) {
    throw new Error("Tahun buku tidak valid.");
  }

  const cleanTitle = sanitizeInput(title) || `Laporan Pertanggungjawaban Keuangan Tahun ${parsedYear}`;
  const cleanAuditor = sanitizeInput(auditorName) || "Internal Pembukuan Yayasan";

  const existing = await prisma.auditReport.findFirst({
    where: { year: parsedYear },
  });
  if (existing) {
    throw new Error(`Laporan keuangan untuk tahun buku ${parsedYear} sudah terdaftar.`);
  }

  const cleanRatioNum = parseFloat(String(operationalRatio || "").replace("%", "").trim());
  const validRatio = !isNaN(cleanRatioNum) && cleanRatioNum >= 0 && cleanRatioNum <= 100
    ? `${cleanRatioNum.toFixed(1)}%`
    : "12.4%";

  const report = await prisma.auditReport.create({
    data: {
      year: parsedYear,
      title: cleanTitle,
      auditorName: cleanAuditor,
      opinionStatus: sanitizeInput(opinionStatus) || "Terbuka & Akuntabel",
      totalFundsIn: Math.max(0, parseFloat(totalFundsIn) || 0),
      totalFundsOut: Math.max(0, parseFloat(totalFundsOut) || 0),
      beneficiaryCount: Math.max(0, parseInt(beneficiaryCount, 10) || 0),
      operationalRatio: validRatio,
      summary: sanitizeInput(summary) || null,
      pdfUrl: sanitizeInput(pdfUrl) || null,
    },
  });

  return report;
}

/**
 * Memperbarui laporan audit.
 */
export async function updateAuditReport({
  id,
  year,
  title,
  auditorName,
  opinionStatus = "Terbuka & Akuntabel",
  totalFundsIn,
  totalFundsOut,
  beneficiaryCount,
  operationalRatio,
  summary,
  pdfUrl,
}) {
  const parsedYear = parseInt(year, 10);
  if (!parsedYear || parsedYear < 2000 || parsedYear > 2100) {
    throw new Error("Tahun buku tidak valid.");
  }

  const duplicateYear = await prisma.auditReport.findFirst({
    where: {
      year: parsedYear,
      id: { not: id },
    },
  });
  if (duplicateYear) {
    throw new Error(`Laporan keuangan untuk tahun buku ${parsedYear} sudah terdaftar.`);
  }

  const cleanTitle = sanitizeInput(title) || `Laporan Pertanggungjawaban Keuangan Tahun ${parsedYear || ""}`;
  const cleanAuditor = sanitizeInput(auditorName) || "Internal Pembukuan Yayasan";

  const cleanRatioNum = parseFloat(String(operationalRatio || "").replace("%", "").trim());
  const validRatio = !isNaN(cleanRatioNum) && cleanRatioNum >= 0 && cleanRatioNum <= 100
    ? `${cleanRatioNum.toFixed(1)}%`
    : "12.4%";

  const report = await prisma.auditReport.update({
    where: { id },
    data: {
      year: parsedYear,
      title: cleanTitle,
      auditorName: cleanAuditor,
      opinionStatus: sanitizeInput(opinionStatus) || "Terbuka & Akuntabel",
      totalFundsIn: Math.max(0, parseFloat(totalFundsIn) || 0),
      totalFundsOut: Math.max(0, parseFloat(totalFundsOut) || 0),
      beneficiaryCount: Math.max(0, parseInt(beneficiaryCount, 10) || 0),
      operationalRatio: validRatio,
      summary: sanitizeInput(summary) || null,
      pdfUrl: sanitizeInput(pdfUrl) || null,
    },
  });

  return report;
}

/**
 * Menghapus laporan audit.
 */
export async function deleteAuditReport({ id }) {
  const deleted = await prisma.auditReport.delete({
    where: { id },
  });

  return deleted;
}

/**
 * Menghapus banyak laporan audit sekaligus dari database.
 */
export async function deleteAuditReportsBatch({ ids }) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("Daftar ID laporan audit tidak boleh kosong.");
  }

  const result = await prisma.auditReport.deleteMany({
    where: { id: { in: ids } },
  });

  return { count: result.count };
}
