import prisma from "@/lib/prisma";


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
    console.error("Prisma getAuditReports error:", error);
  }
  return [];
}

export async function getProgramAllocations() {
  try {
    const campaigns = await prisma.campaign.findMany({
      select: {
        collectedAmount: true,
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    if (campaigns && campaigns.length > 0) {
      const categoryMap = new Map();
      let totalAmount = 0;

      for (const c of campaigns) {
        const catName = c.category?.name || "Lainnya";
        const catId = c.category?.slug || "lainnya";
        const amt = Number(c.collectedAmount || 0);
        totalAmount += amt;

        if (!categoryMap.has(catId)) {
          categoryMap.set(catId, {
            id: catId,
            label: catName,
            amount: 0,
          });
        }
        categoryMap.get(catId).amount += amt;
      }

      const colors = ["#059669", "#0284c7", "#d97706", "#8b5cf6", "#ec4899"];
      const allocations = Array.from(categoryMap.values()).map((cat, idx) => ({
        id: cat.id,
        label: cat.label,
        amount: Math.round(cat.amount),
        percentage: totalAmount > 0 ? Math.round((cat.amount / totalAmount) * 100) : 0,
        color: colors[idx % colors.length],
      }));

      if (allocations.length > 0 && totalAmount > 0) {
        return allocations;
      }
    }
  } catch (error) {
    console.warn("Prisma getProgramAllocations fallback:", error.message);
  }
  return [];
}

export async function getDistributionTrend() {
  try {
    if (prisma.auditReport) {
      const dbReports = await prisma.auditReport.findMany({
        orderBy: { year: "asc" },
      });
      if (dbReports && dbReports.length > 0) {
        return dbReports.map((r) => ({
          year: String(r.year),
          amount: Math.round(r.totalFundsOut || 0),
          beneficiaries: r.beneficiaryCount || 0,
        }));
      }
    }
  } catch (error) {
    console.warn("Prisma getDistributionTrend fallback:", error.message);
  }
  return [];
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
    console.error("Prisma getMonthlyFinancialTrend error:", error);
    return [];
  }
}

export async function getTransparencyMetrics() {
  try {
    const [
      campaignCount,
      donationsAgg,
      monthlyTrend,
      beneficiaryCount,
      latestAudit,
      allocations,
      distributionTrend,
    ] = await Promise.all([
      prisma.campaign.count({ where: { status: "ACTIVE" } }).catch(() => 0),
      prisma.donation.aggregate({
        _sum: { amount: true },
        _count: { id: true },
        where: { status: "PAID" },
      }).catch(() => ({ _sum: { amount: 0 }, _count: { id: 0 } })),
      getMonthlyFinancialTrend(),
      prisma.beneficiary
        ? prisma.beneficiary.count().catch(() => 132)
        : Promise.resolve(132),
      prisma.auditReport
        ? prisma.auditReport.findFirst({ orderBy: { year: "desc" } }).catch(() => null)
        : Promise.resolve(null),
      getProgramAllocations(),
      getDistributionTrend(),
    ]);

    const totalDonationsAllTime = Number(donationsAgg._sum?.amount || 0);
    const totalTransactions = Number(donationsAgg._count?.id || 0);

    return {
      totalDonationsAllTime,
      totalTransactions,
      totalBeneficiaries: beneficiaryCount || 132,
      activeCampaignsCount: campaignCount,
      reportStatus: "Terbuka & Akuntabel",
      partnerPesantrenCount: 5,
      allocations,
      distributionTrend,
      monthlyTrend,
    };
  } catch (error) {
    console.error("Prisma getTransparencyMetrics error:", error);
    const fallbackTrend = await getMonthlyFinancialTrend().catch(() => []);
    const fallbackSum = fallbackTrend.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const fallbackCount = fallbackTrend.reduce((acc, curr) => acc + (curr.count || 0), 0);

    return {
      totalDonationsAllTime: fallbackSum,
      totalTransactions: fallbackCount,
      totalBeneficiaries: 132,
      activeCampaignsCount: 8,
      reportStatus: "Terbuka & Akuntabel",
      partnerPesantrenCount: 5,
      allocations: [],
      distributionTrend: [],
      monthlyTrend: fallbackTrend,
    };
  }
}

export { getFinancialLedgerData } from "./financialLedgerService";




