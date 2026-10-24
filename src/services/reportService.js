import prisma from "@/lib/prisma";
import {
  AUDIT_REPORTS,
  TRANSPARENCY_METRICS,
  PROGRAM_ALLOCATIONS,
  ANNUAL_DISTRIBUTION_TREND,
  MONTHLY_DISTRIBUTION_12M,
} from "@/data/reports";

export async function getAuditReports() {
  try {
    const dbReports = await prisma.auditReport.findMany({
      orderBy: { year: "desc" },
    });
    if (dbReports && dbReports.length > 0) {
      return dbReports.map((r) => ({
        ...r,
        pdfUrl:
          r.pdfUrl && r.pdfUrl !== "#"
            ? r.pdfUrl
            : `/api/documents/download?type=audit&year=${r.year || 2025}`,
      }));
    }
  } catch (error) {
    console.warn("Prisma getAuditReports fallback:", error.message);
  }
  return AUDIT_REPORTS;
}

export async function getProgramAllocations() {
  return PROGRAM_ALLOCATIONS;
}

export async function getMonthlyFinancialTrend() {
  try {
    const donations = await prisma.donation.findMany({
      where: {
        status: "PAID",
        paidAt: { not: null },
      },
      select: {
        amount: true,
        paidAt: true,
      },
    });

    let latestDate = new Date();
    if (donations.length > 0) {
      for (const d of donations) {
        if (d.paidAt && d.paidAt > latestDate) {
          latestDate = new Date(d.paidAt);
        }
      }
    }

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const fullMonthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const monthKeys = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(latestDate.getFullYear(), latestDate.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthKeys.push({
        key,
        month: monthNames[d.getMonth()],
        fullMonth: `${fullMonthNames[d.getMonth()]} ${d.getFullYear()}`,
        amount: 0,
        count: 0,
      });
    }

    const map = new Map();
    monthKeys.forEach((m) => map.set(m.key, m));

    for (const d of donations) {
      if (!d.paidAt) continue;
      const key = `${d.paidAt.getFullYear()}-${String(d.paidAt.getMonth() + 1).padStart(2, "0")}`;
      const target = map.get(key);
      if (target) {
        target.amount += d.amount;
        target.count += 1;
      }
    }

    return monthKeys.map((m) => ({
      month: m.month,
      fullMonth: m.fullMonth,
      amount: Math.round(m.amount),
      count: m.count,
    }));
  } catch (error) {
    console.warn("Prisma getMonthlyFinancialTrend fallback:", error.message);
    return MONTHLY_DISTRIBUTION_12M;
  }
}

export async function getTransparencyMetrics() {
  try {
    const [campaignCount, donationsAgg, monthlyTrend] = await Promise.all([
      prisma.campaign.count({ where: { status: "ACTIVE" } }),
      prisma.donation.aggregate({
        _sum: { amount: true },
        _count: { id: true },
        where: { status: "PAID" },
      }),
      getMonthlyFinancialTrend(),
    ]);

    const dynamicTotal = donationsAgg._sum.amount || 0;
    const baseTotal = TRANSPARENCY_METRICS.totalDonationsAllTime;

    return {
      ...TRANSPARENCY_METRICS,
      totalDonationsAllTime: Math.max(baseTotal, dynamicTotal),
      activeCampaignsCount: campaignCount || TRANSPARENCY_METRICS.activeCampaignsCount,
      allocations: PROGRAM_ALLOCATIONS,
      distributionTrend: ANNUAL_DISTRIBUTION_TREND,
      monthlyTrend,
    };
  } catch (error) {
    console.warn("Prisma getTransparencyMetrics fallback:", error.message);
  }
  return {
    ...TRANSPARENCY_METRICS,
    allocations: PROGRAM_ALLOCATIONS,
    distributionTrend: ANNUAL_DISTRIBUTION_TREND,
    monthlyTrend: MONTHLY_DISTRIBUTION_12M.map((m) => ({
      month: m.month,
      fullMonth: m.fullMonth,
      incoming: Math.round(m.amount * 1.09),
      disbursed: m.amount,
    })),
  };
}

export { getFinancialLedgerData } from "./financialLedgerService";



