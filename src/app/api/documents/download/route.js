import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  generateAuditReportPdf,
  generateSyariahReportPdf,
} from "@/lib/pdfReportGenerator";
import {
  AUDIT_SUMMARY_DATA,
  SYARIAH_COMPLIANCE_DATA,
} from "@/data/distributionData";
import { formatRupiah } from "@/lib/formatters";

/**
 * Route handler to serve official PDF reports
 * Endpoint: GET /api/documents/download?type=audit|syariah&year=2025
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const year = searchParams.get("year") || "2025";

    if (type === "syariah") {
      const pdfBuffer = generateSyariahReportPdf({
        skNumber: SYARIAH_COMPLIANCE_DATA.skNumber,
        shariaBoardChairman: SYARIAH_COMPLIANCE_DATA.shariaBoardChairman,
        effectiveDate: SYARIAH_COMPLIANCE_DATA.effectiveDate,
        legalFoundation: SYARIAH_COMPLIANCE_DATA.legalFoundation,
      });

      const filename = "SK-Dewan-Pengawas-Syariah-PABE-2026.pdf";

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Content-Length": String(pdfBuffer.length),
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
        },
      });
    }

    if (type === "audit") {
      const dbReport = await prisma.auditReport.findFirst({
        where: { year: parseInt(year, 10) || 2025 },
      }).catch(() => null);

      const pdfBuffer = generateAuditReportPdf({
        year,
        auditorName: dbReport?.auditorName || AUDIT_SUMMARY_DATA.auditorName,
        opinion: dbReport?.opinionStatus || AUDIT_SUMMARY_DATA.opinion,
        operationalRatio: dbReport?.operationalRatio || AUDIT_SUMMARY_DATA.operationalRatio,
        maxAllowedRatio: AUDIT_SUMMARY_DATA.maxAllowedRatio,
        totalFundsManagedFormatted: formatRupiah(dbReport ? dbReport.totalFundsIn : AUDIT_SUMMARY_DATA.totalFundsManaged),
      });

      const filename = `Laporan-Audit-Keuangan-PABE-${year}.pdf`;

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Content-Length": String(pdfBuffer.length),
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
        },
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Parameter tipe dokumen tidak valid. Gunakan 'audit' atau 'syariah'.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Gagal mengunduh dokumen PDF:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan internal saat membuat berkas dokumen PDF.",
      },
      { status: 500 }
    );
  }
}
