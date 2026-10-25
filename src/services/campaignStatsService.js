import prisma from "@/lib/prisma";

/**
 * Mengambil data statistik pertumbuhan donasi per hari untuk grafik campaign
 * @param {string} slug 
 * @returns {Promise<Array<{date: string, dailyAmount: number, cumulativeAmount: number, donationsCount: number}>>}
 */
export async function getCampaignDonationStats(slug) {
  if (!slug) return [];
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { slug },
      select: {
        id: true,
        createdAt: true,
        collectedAmount: true,
        targetAmount: true,
      },
    });

    if (campaign) {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      ninetyDaysAgo.setHours(0, 0, 0, 0);

      // Hitung total akumulasi sebelum 90 hari terakhir via aggregation O(1)
      const priorAggregate = await prisma.donation.aggregate({
        where: {
          campaignId: campaign.id,
          status: "PAID",
          paidAt: { lt: ninetyDaysAgo },
        },
        _sum: { amount: true },
      });

      const priorTotal = Number(priorAggregate._sum.amount || 0);

      const paidDonations = await prisma.donation.findMany({
        where: {
          campaignId: campaign.id,
          status: "PAID",
          paidAt: { gte: ninetyDaysAgo },
        },
        select: {
          amount: true,
          paidAt: true,
          createdAt: true,
        },
        orderBy: {
          paidAt: "asc",
        },
      });

      const dateMap = new Map();
      paidDonations.forEach((d) => {
        const rawDate = d.paidAt || d.createdAt;
        const dateKey = (rawDate instanceof Date ? rawDate : new Date(rawDate)).toISOString().split("T")[0];
        const existing = dateMap.get(dateKey) || { dailyAmount: 0, donationsCount: 0 };
        existing.dailyAmount += Number(d.amount || 0);
        existing.donationsCount += 1;
        dateMap.set(dateKey, existing);
      });

      const sortedDates = Array.from(dateMap.keys()).sort();
      let runningTotal = priorTotal;

      const result = sortedDates.map((date) => {
        const info = dateMap.get(date);
        runningTotal += info.dailyAmount;
        return {
          date,
          dailyAmount: info.dailyAmount,
          cumulativeAmount: runningTotal,
          donationsCount: info.donationsCount,
        };
      });

      if (priorTotal > 0 && result.length > 0 && result[0].date > ninetyDaysAgo.toISOString().split("T")[0]) {
        result.unshift({
          date: ninetyDaysAgo.toISOString().split("T")[0],
          dailyAmount: 0,
          cumulativeAmount: priorTotal,
          donationsCount: 0,
        });
      }

      return result;
    }
  } catch (error) {
    console.error("Prisma getCampaignDonationStats error:", error);
  }

  return [];
}
