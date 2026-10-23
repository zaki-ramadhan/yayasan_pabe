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
  opinionStatus = "WTP",
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

  const cleanTitle = sanitizeInput(title) || `Laporan Keuangan & Audit Tahun ${parsedYear}`;
  const cleanAuditor = sanitizeInput(auditorName);
  if (!cleanAuditor) {
    throw new Error("Nama kantor akuntan publik / auditor wajib diisi.");
  }

  const existing = await prisma.auditReport.findFirst({
    where: { year: parsedYear },
  });
  if (existing) {
    throw new Error(`Laporan audit untuk tahun buku ${parsedYear} sudah terdaftar.`);
  }

  const report = await prisma.auditReport.create({
    data: {
      year: parsedYear,
      title: cleanTitle,
      auditorName: cleanAuditor,
      opinionStatus: sanitizeInput(opinionStatus) || "WTP",
      totalFundsIn: parseFloat(totalFundsIn) || 0,
      totalFundsOut: parseFloat(totalFundsOut) || 0,
      beneficiaryCount: parseInt(beneficiaryCount, 10) || 0,
      operationalRatio: sanitizeInput(operationalRatio) || "12.4%",
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
  opinionStatus = "WTP",
  totalFundsIn,
  totalFundsOut,
  beneficiaryCount,
  operationalRatio,
  summary,
  pdfUrl,
}) {
  const parsedYear = parseInt(year, 10);
  const cleanTitle = sanitizeInput(title);
  const cleanAuditor = sanitizeInput(auditorName);

  if (!cleanAuditor) {
    throw new Error("Nama auditor wajib diisi.");
  }

  const report = await prisma.auditReport.update({
    where: { id },
    data: {
      year: parsedYear,
      title: cleanTitle,
      auditorName: cleanAuditor,
      opinionStatus: sanitizeInput(opinionStatus) || "WTP",
      totalFundsIn: parseFloat(totalFundsIn) || 0,
      totalFundsOut: parseFloat(totalFundsOut) || 0,
      beneficiaryCount: parseInt(beneficiaryCount, 10) || 0,
      operationalRatio: sanitizeInput(operationalRatio) || "12.4%",
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
