import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateAuditReportPdf } from "@/lib/pdfReportGenerator";
import { AUDIT_SUMMARY_DATA } from "@/data/distributionData";
import { formatRupiah } from "@/lib/formatters";
import { checkRateLimit } from "@/lib/rateLimit";

/**
 * Route handler to serve official PDF reports
 * Endpoint: GET /api/documents/download?type=audit&year=2025
 */
export async function GET(request) {
  try {
    const isDev = process.env.NODE_ENV === "development";
    const rateLimitBlocked = checkRateLimit(request, {
      action: "document_download",
      limit: isDev ? 120 : 60,
      windowMs: 60000,
    });
    if (rateLimitBlocked) return rateLimitBlocked;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const year = searchParams.get("year") || "2025";

    if (type === "audit") {
      const dbReport = await prisma.auditReport.findFirst({
        where: { year: parseInt(year, 10) || 2025 },
      }).catch(() => null);

      const isSelfReference = (urlStr) => {
        if (!urlStr) return true;
        const clean = urlStr.trim().toLowerCase();
        return (
          clean === "#" ||
          clean.includes("/api/documents/download") ||
          clean === request.url.toLowerCase()
        );
      };

      if (
        dbReport?.pdfUrl &&
        typeof dbReport.pdfUrl === "string" &&
        dbReport.pdfUrl.trim() &&
        !isSelfReference(dbReport.pdfUrl)
      ) {
        const targetUrl = dbReport.pdfUrl.startsWith("http")
          ? dbReport.pdfUrl
          : new URL(dbReport.pdfUrl, request.url).toString();

        if (!isSelfReference(targetUrl)) {
          return NextResponse.redirect(targetUrl);
        }
      }

      const rawOpinion = dbReport?.opinionStatus || AUDIT_SUMMARY_DATA.opinion;
      const cleanOpinion = rawOpinion === "WTP" || !rawOpinion ? "Terbuka & Akuntabel" : rawOpinion;

      const pdfBuffer = generateAuditReportPdf({
        year,
        auditorName: dbReport?.auditorName || "Internal Pembukuan Yayasan",
        opinion: cleanOpinion,
        operationalRatio: dbReport?.operationalRatio || AUDIT_SUMMARY_DATA.operationalRatio,
        maxAllowedRatio: AUDIT_SUMMARY_DATA.maxAllowedRatio,
        totalFundsIn: dbReport ? dbReport.totalFundsIn : AUDIT_SUMMARY_DATA.totalFundsManaged,
        totalFundsOut: dbReport ? dbReport.totalFundsOut : Math.round(AUDIT_SUMMARY_DATA.totalFundsManaged * 0.92),
        beneficiaryCount: dbReport ? dbReport.beneficiaryCount : 1250,
        summary: dbReport?.summary || "",
      });

      const filename = `Laporan-Pertanggungjawaban-Keuangan-PABE-${year}.pdf`;

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
        message: "Parameter tipe dokumen tidak valid. Gunakan 'audit'.",
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
