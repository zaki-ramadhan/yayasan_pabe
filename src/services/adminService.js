import prisma from "@/lib/prisma";

// Re-export sub-services untuk menjaga backward compatibility 100%
export {
  getAdminCampaigns,
  createAdminCategory,
  createAdminCampaign,
  updateAdminCampaign,
} from "./adminCampaignService";

export {
  getAdminTransactions,
  verifyAdminTransaction,
} from "./adminTransactionService";

export {
  getAdminDistributions,
  createAdminDistribution,
  updateAdminDistribution,
  deleteAdminDistribution,
} from "./adminDistributionService";

/**
 * Mengambil ringkasan metrik statistik operasional admin yayasan.
 */
export async function getAdminOverviewStats() {
  try {
    const [donationAgg, campaignCount, donorCount, disbursedAgg] = await Promise.all([
      prisma.donation.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.campaign.count({ where: { status: "ACTIVE" } }),
      prisma.donation.groupBy({
        by: ["donorEmail"],
        where: { status: "PAID", donorEmail: { not: null } },
      }),
      prisma.campaignUpdate.aggregate({
        _sum: { disbursedAmount: true },
      }),
    ]);

    const totalCollected = donationAgg._sum.amount || 0;
    const totalTransactions = donationAgg._count.id || 0;
    const totalDisbursed = disbursedAgg._sum.disbursedAmount || 0;
    const activeDonors = donorCount.length || 0;

    return {
      totalCollected,
      totalTransactions,
      totalDisbursed,
      activeDonors,
      activeCampaigns: campaignCount,
    };
  } catch (error) {
    console.warn("Prisma getAdminOverviewStats error:", error.message);
    return {
      totalCollected: 0,
      totalTransactions: 0,
      totalDisbursed: 0,
      activeDonors: 0,
      activeCampaigns: 0,
    };
  }
}

/**
 * Mengambil ringkasan data tren donasi dan penyaluran untuk grafik analitik admin.
 */
export async function getAdminDonationTrends() {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    ninetyDaysAgo.setHours(0, 0, 0, 0);

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const [priorAggregate, paidDonations, disbursements] = await Promise.all([
      prisma.donation.aggregate({
        where: {
          status: "PAID",
          paidAt: { lt: ninetyDaysAgo },
        },
        _sum: { amount: true },
      }),
      prisma.donation.findMany({
        where: {
          status: "PAID",
          paidAt: { gte: twelveMonthsAgo },
        },
        select: {
          amount: true,
          paidAt: true,
          createdAt: true,
        },
        orderBy: { paidAt: "asc" },
      }),
      prisma.campaignUpdate.findMany({
        where: {
          date: { gte: twelveMonthsAgo },
          disbursedAmount: { gt: 0 },
        },
        select: {
          disbursedAmount: true,
          date: true,
        },
        orderBy: { date: "asc" },
      }),
    ]);

    const priorTotal = Number(priorAggregate?._sum?.amount || 0);

    const dailyMap = new Map();
    paidDonations.forEach((d) => {
      const rawDate = d.paidAt || d.createdAt;
      if (!rawDate) return;
      const dObj = rawDate instanceof Date ? rawDate : new Date(rawDate);
      if (dObj >= ninetyDaysAgo) {
        const dateKey = dObj.toISOString().split("T")[0];
        const existing = dailyMap.get(dateKey) || { dailyAmount: 0, donationsCount: 0, disbursedAmount: 0 };
        existing.dailyAmount += Number(d.amount || 0);
        existing.donationsCount += 1;
        dailyMap.set(dateKey, existing);
      }
    });

    disbursements.forEach((u) => {
      if (!u.date) return;
      const dObj = u.date instanceof Date ? u.date : new Date(u.date);
      if (dObj >= ninetyDaysAgo) {
        const dateKey = dObj.toISOString().split("T")[0];
        const existing = dailyMap.get(dateKey) || { dailyAmount: 0, donationsCount: 0, disbursedAmount: 0 };
        existing.disbursedAmount += Number(u.disbursedAmount || 0);
        dailyMap.set(dateKey, existing);
      }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyTrend = [];
    let runningCumulative = priorTotal;
    const cursor = new Date(ninetyDaysAgo);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const fullMonthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];

    while (cursor <= today) {
      const dateKey = cursor.toISOString().split("T")[0];
      const dayData = dailyMap.get(dateKey) || { dailyAmount: 0, donationsCount: 0, disbursedAmount: 0 };
      runningCumulative += dayData.dailyAmount;

      dailyTrend.push({
        date: dateKey,
        label: `${cursor.getDate()} ${monthNames[cursor.getMonth()]}`,
        dailyAmount: dayData.dailyAmount,
        cumulativeAmount: runningCumulative,
        donationsCount: dayData.donationsCount,
        disbursedAmount: dayData.disbursedAmount,
      });

      cursor.setDate(cursor.getDate() + 1);
    }

    const monthlyMap = new Map();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap.set(mKey, {
        key: mKey,
        month: monthNames[d.getMonth()],
        fullMonth: `${fullMonthNames[d.getMonth()]} ${d.getFullYear()}`,
        inflow: 0,
        outflow: 0,
        count: 0,
      });
    }

    paidDonations.forEach((d) => {
      const rawDate = d.paidAt || d.createdAt;
      if (!rawDate) return;
      const dObj = rawDate instanceof Date ? rawDate : new Date(rawDate);
      const mKey = `${dObj.getFullYear()}-${String(dObj.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyMap.has(mKey)) {
        const item = monthlyMap.get(mKey);
        item.inflow += Number(d.amount || 0);
        item.count += 1;
      }
    });

    disbursements.forEach((u) => {
      if (!u.date) return;
      const dObj = u.date instanceof Date ? u.date : new Date(u.date);
      const mKey = `${dObj.getFullYear()}-${String(dObj.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyMap.has(mKey)) {
        const item = monthlyMap.get(mKey);
        item.outflow += Number(u.disbursedAmount || 0);
      }
    });

    const monthlyTrend = Array.from(monthlyMap.values());

    return {
      dailyTrend,
      monthlyTrend,
    };
  } catch (error) {
    console.warn("Prisma getAdminDonationTrends error:", error.message);
    return { dailyTrend: [], monthlyTrend: [] };
  }
}

