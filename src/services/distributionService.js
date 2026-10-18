import prisma from "@/lib/prisma";
import {
  AUDIT_SUMMARY_DATA,
  DISTRIBUTION_TREND_DATA,
  SYARIAH_COMPLIANCE_DATA,
} from "@/data/distributionData";
import { formatNumber } from "@/lib/formatters";

/**
 * Service to retrieve real database distribution data with robust fallbacks
 */
export async function getDistributionAuditData() {
  try {
    const latestAudit = await prisma.auditReport.findFirst({
      orderBy: { year: "desc" },
    });

    if (latestAudit) {
      return {
        ...AUDIT_SUMMARY_DATA,
        auditorName: latestAudit.auditorName || AUDIT_SUMMARY_DATA.auditorName,
        opinion: latestAudit.opinionStatus || AUDIT_SUMMARY_DATA.opinion,
        auditPeriod: `Tahun Buku ${latestAudit.year}`,
        operationalRatio: latestAudit.operationalRatio || AUDIT_SUMMARY_DATA.operationalRatio,
        pdfUrl: latestAudit.pdfUrl || "#",
      };
    }
  } catch (error) {
    console.warn("Prisma getDistributionAuditData fallback:", error.message);
  }

  return AUDIT_SUMMARY_DATA;
}

export async function getDistributionTrendData() {
  try {
    const updates = await prisma.campaignUpdate.findMany({
      where: { disbursedAmount: { gt: 0 } },
      select: { disbursedAmount: true, date: true },
      orderBy: { date: "asc" },
    });

    if (updates && updates.length >= 5) {
      // Aggregate by year and month from real DB updates
      const trendMap = {};
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      const fullMonthNames = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];

      updates.forEach((u) => {
        const d = new Date(u.date);
        const yearKey = `Tahun ${d.getFullYear()}`;
        const monthIdx = d.getMonth();

        if (!trendMap[yearKey]) {
          trendMap[yearKey] = monthNames.map((m, idx) => ({
            month: m,
            fullMonth: `${fullMonthNames[idx]} ${d.getFullYear()}`,
            amount: 0,
            beneficiaries: 0,
          }));
        }

        trendMap[yearKey][monthIdx].amount += Number(u.disbursedAmount || 0);
        trendMap[yearKey][monthIdx].beneficiaries += Math.round(Number(u.disbursedAmount || 0) / 250000);
      });

      return {
        ...DISTRIBUTION_TREND_DATA,
        ...trendMap,
      };
    }
  } catch (error) {
    console.warn("Prisma getDistributionTrendData fallback:", error.message);
  }

  return DISTRIBUTION_TREND_DATA;
}

export async function getDistributionSyariahData() {
  return SYARIAH_COMPLIANCE_DATA;
}

export async function getDistributionRecords() {
  try {
    const updates = await prisma.campaignUpdate.findMany({
      include: {
        campaign: {
          select: {
            title: true,
            slug: true,
            location: true,
            bannerUrl: true,
          },
        },
      },
      orderBy: { date: "desc" },
      take: 20,
    });

    if (updates && updates.length > 0) {
      return updates.map((u, idx) => {
        const dateStr = u.date instanceof Date ? u.date.toISOString().split("T")[0] : u.date;
        const beneficiaryEstimated = Math.max(50, Math.round(Number(u.disbursedAmount || 25000000) / 200000));
        return {
          id: `DIST-${dateStr.slice(0, 4)}-00${idx + 1}`,
          title: u.title,
          location: u.campaign?.location || "Wilayah Binaan PABE",
          date: dateStr,
          beneficiaries: `${formatNumber(beneficiaryEstimated)}+ Jiwa`,
          value: Number(u.disbursedAmount || 25000000),
          status: "SELESAI",
          image: (u.images && u.images[0]) || u.campaign?.bannerUrl || "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&auto=format&fit=crop&q=80",
          pj: "Tim Penyaluran & Logistik PABE",
          notes: u.content,
        };
      });
    }
  } catch (error) {
    console.warn("Prisma getDistributionRecords fallback:", error.message);
  }

  return null;
}
