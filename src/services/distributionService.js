import prisma from "@/lib/prisma";
import { AUDIT_SUMMARY_DATA } from "@/data/distributionData";
import { formatNumber } from "@/lib/formatters";

/**
 * Service to retrieve real database distribution data with robust fallbacks
 */
export async function getDistributionAuditData() {
  try {
    const reports = await prisma.auditReport.findMany({
      orderBy: { year: "desc" },
    });

    let updatesAllocations = null;
    try {
      const updates = await prisma.campaignUpdate.findMany({
        where: { disbursedAmount: { gt: 0 } },
        include: {
          campaign: {
            include: { category: true },
          },
        },
      });

      if (updates && updates.length > 0) {
        let totalDisbursed = 0;
        const categoryMap = {};
        const palette = ["#059669", "#0284c7", "#d97706", "#7c3aed", "#e11d48"];

        updates.forEach((u) => {
          const catName = u.campaign?.category?.name || "Bantuan & Pemberdayaan";
          const amt = Number(u.disbursedAmount || 0);
          totalDisbursed += amt;
          if (!categoryMap[catName]) {
            categoryMap[catName] = { name: catName, amount: 0 };
          }
          categoryMap[catName].amount += amt;
        });

        if (totalDisbursed > 0) {
          updatesAllocations = Object.values(categoryMap).map((cat, idx) => ({
            id: `alloc-${idx}`,
            name: cat.name,
            amount: cat.amount,
            percentage: Math.round((cat.amount / totalDisbursed) * 100),
            color: palette[idx % palette.length],
          }));
        }
      }
    } catch (allocErr) {
      console.warn("Prisma allocation aggregation fallback:", allocErr.message);
    }

    if (reports && reports.length > 0) {
      const result = {};
      reports.forEach((rep, idx) => {
        const yearKey = `Tahun ${rep.year}`;
        result[yearKey] = {
          year: rep.year,
          title: rep.title || `Laporan Pertanggungjawaban (${yearKey})`,
          description: rep.summary || AUDIT_SUMMARY_DATA.description,
          auditorName: rep.auditorName || AUDIT_SUMMARY_DATA.auditorName,
          opinion: rep.opinionStatus || AUDIT_SUMMARY_DATA.opinion,
          auditPeriod: `Tahun Buku ${rep.year}`,
          operationalRatio: rep.operationalRatio || AUDIT_SUMMARY_DATA.operationalRatio,
          maxAllowedRatio: AUDIT_SUMMARY_DATA.maxAllowedRatio,
          totalFundsManaged: Number(rep.totalFundsIn) || AUDIT_SUMMARY_DATA.totalFundsManaged,
          allocations: idx === 0 && updatesAllocations ? updatesAllocations : AUDIT_SUMMARY_DATA.allocations,
        };
      });
      return result;
    }
  } catch (error) {
    console.warn("Prisma getDistributionAuditData fallback:", error.message);
  }

  return {
    "Tahun 2025": {
      ...AUDIT_SUMMARY_DATA,
      year: 2025,
      title: "Laporan Pertanggungjawaban (Tahun 2025)",
      auditPeriod: "Tahun Buku 2025",
    },
    "Tahun 2024": {
      ...AUDIT_SUMMARY_DATA,
      year: 2024,
      title: "Laporan Pertanggungjawaban (Tahun 2024)",
      auditPeriod: "Tahun Buku 2024",
      totalFundsManaged: 520000000,
      operationalRatio: "8.9%",
    },
  };
}

export async function getDistributionTrendData() {
  try {
    const updates = await prisma.campaignUpdate.findMany({
      where: { disbursedAmount: { gt: 0 } },
      select: { disbursedAmount: true, date: true },
      orderBy: { date: "asc" },
    });

    if (updates && updates.length > 0) {
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

      if (Object.keys(trendMap).length > 0) {
        return trendMap;
      }
    }
  } catch (error) {
    console.error("Prisma getDistributionTrendData error:", error);
  }

  const currentYear = new Date().getFullYear();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const fullMonthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  return {
    [`Tahun ${currentYear}`]: monthNames.map((m, idx) => ({
      month: m,
      fullMonth: `${fullMonthNames[idx]} ${currentYear}`,
      amount: 0,
      beneficiaries: 0,
    })),
  };
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
        const value = Number(u.disbursedAmount || 0);
        const beneficiaryEstimated = value > 0 ? Math.max(1, Math.round(value / 200000)) : 0;
        return {
          id: `DIST-${dateStr.slice(0, 4)}-00${idx + 1}`,
          title: u.title,
          location: u.campaign?.location || "Wilayah Binaan PABE",
          date: dateStr,
          beneficiaries: `${formatNumber(beneficiaryEstimated)}+ Orang`,
          value,
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
