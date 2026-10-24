import prisma from "@/lib/prisma";
import {
  calculateMonthlyTrend,
  calculateCategoryDistribution,
  formatRecentDonations,
  formatRecentReports,
  formatRoutineDonations,
  getDefaultMonthlyTrend,
} from "./donorAnalyticsHelper";

export function buildUserWhereClause(userEmail, userName) {
  const orConditions = [];

  if (userEmail && typeof userEmail === "string") {
    orConditions.push({ donorEmail: { equals: userEmail.trim(), mode: "insensitive" } });
  }

  if (userName && typeof userName === "string") {
    const cleanName = userName.trim();
    orConditions.push({ donorName: { equals: cleanName, mode: "insensitive" } });

    const withoutHonorific = cleanName.replace(/^(H\.|Hj\.|Drs\.|Ust\.|dr\.|Prof\.)\s*/i, "").trim();
    if (withoutHonorific && withoutHonorific !== cleanName) {
      orConditions.push({ donorName: { contains: withoutHonorific, mode: "insensitive" } });
    }
  }

  return orConditions.length > 0 ? { OR: orConditions } : null;
}

export async function getDonorDashboardOverview({ userEmail, userName, year }) {
  const currentYear = parseInt(year, 10) || new Date().getFullYear();
  const userCondition = buildUserWhereClause(userEmail, userName);
  const defaultMonthly = getDefaultMonthlyTrend();

  if (!userCondition) {
    return {
      metrics: { totalNominal: 0, totalTransactions: 0, totalPrograms: 0 },
      monthlyTrend: defaultMonthly,
      categoryDistribution: [],
      currentMonthAchieved: 0,
      currentMonthTarget: 1000000,
      recentReports: [],
      recentItems: [],
      routineDonations: [],
    };
  }

  const basePaidWhere = {
    status: "PAID",
    AND: [userCondition],
  };

  try {
    const startOfYear = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0));
    const endOfYear = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59, 999));

    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999));

    const [
      aggregates,
      distinctCampaigns,
      donationsInYear,
      allUserDonations,
      monthAggregate,
      recentReportsData,
      recentDonationsData,
      routineDonationsData,
    ] = await Promise.all([
      prisma.donation.aggregate({
        where: {
          status: "PAID",
          AND: [userCondition],
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.donation.findMany({
        where: {
          status: "PAID",
          AND: [userCondition],
        },
        select: { campaignId: true, donationType: true },
        distinct: ["campaignId", "donationType"],
      }),
      prisma.donation.findMany({
        where: {
          status: "PAID",
          AND: [
            userCondition,
            {
              OR: [
                { paidAt: { gte: startOfYear, lte: endOfYear } },
                { AND: [{ paidAt: null }, { createdAt: { gte: startOfYear, lte: endOfYear } }] },
              ],
            },
          ],
        },
        select: { amount: true, paidAt: true, createdAt: true },
      }),
      prisma.donation.findMany({
        where: {
          status: "PAID",
          AND: [userCondition],
        },
        select: {
          amount: true,
          donationType: true,
          campaign: {
            select: {
              category: { select: { name: true } },
            },
          },
        },
      }),
      prisma.donation.aggregate({
        where: {
          status: "PAID",
          AND: [
            userCondition,
            {
              OR: [
                { paidAt: { gte: startOfMonth, lte: endOfMonth } },
                { AND: [{ paidAt: null }, { createdAt: { gte: startOfMonth, lte: endOfMonth } }] },
              ],
            },
          ],
        },
        _sum: { amount: true },
      }),
      prisma.campaignUpdate.findMany({
        where: {
          disbursedAmount: { gt: 0 },
        },
        orderBy: { date: "desc" },
        take: 3,
        select: {
          id: true,
          title: true,
          content: true,
          disbursedAmount: true,
          date: true,
          campaign: {
            select: {
              title: true,
              slug: true,
              category: { select: { name: true } },
            },
          },
        },
      }),
      prisma.donation.findMany({
        where: basePaidWhere,
        orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
        take: 5,
        select: {
          id: true,
          invoiceId: true,
          amount: true,
          paidAt: true,
          createdAt: true,
          status: true,
          donorName: true,
          isAnonymous: true,
          paymentChannel: true,
          donationType: true,
          campaign: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
      }),
      prisma.routineDonation.findMany({
        where: {
          AND: [
            userEmail
              ? { donorEmail: { equals: userEmail.trim(), mode: "insensitive" } }
              : { donorName: { equals: userName.trim(), mode: "insensitive" } },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 4,
        select: {
          id: true,
          amount: true,
          frequency: true,
          routineType: true,
          status: true,
          programTitle: true,
          reminderTime: true,
          createdAt: true,
          campaign: {
            select: {
              title: true,
            },
          },
        },
      }),
    ]);

    const totalNominal = aggregates._sum.amount || 0;
    const totalTransactions = aggregates._count.id || 0;
    const totalPrograms = distinctCampaigns.length;

    const monthlyTrend = calculateMonthlyTrend(donationsInYear);
    const categoryDistribution = calculateCategoryDistribution(allUserDonations, totalNominal);
    const recentItems = formatRecentDonations(recentDonationsData);
    const recentReports = formatRecentReports(recentReportsData);
    const routineDonations = formatRoutineDonations(routineDonationsData);

    const currentMonthAchieved = monthAggregate._sum.amount || 0;
    const currentMonthTarget = 1000000;

    return {
      metrics: {
        totalNominal,
        totalTransactions,
        totalPrograms,
      },
      monthlyTrend,
      categoryDistribution,
      currentMonthAchieved,
      currentMonthTarget,
      recentReports,
      recentItems,
      routineDonations,
    };
  } catch (error) {
    console.error("Error getDonorDashboardOverview in donorOverviewService:", error);
    throw error;
  }
}

export async function getDonorMonthlyTrend({ userEmail, userName, year }) {
  const currentYear = parseInt(year, 10) || new Date().getFullYear();
  const userCondition = buildUserWhereClause(userEmail, userName);

  if (!userCondition) {
    return { monthlyTrend: getDefaultMonthlyTrend() };
  }

  try {
    const startOfYear = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0));
    const endOfYear = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59, 999));

    const donationsInYear = await prisma.donation.findMany({
      where: {
        status: "PAID",
        AND: [
          userCondition,
          {
            OR: [
              { paidAt: { gte: startOfYear, lte: endOfYear } },
              { AND: [{ paidAt: null }, { createdAt: { gte: startOfYear, lte: endOfYear } }] },
            ],
          },
        ],
      },
      select: { amount: true, paidAt: true, createdAt: true },
    });

    const monthlyTrend = calculateMonthlyTrend(donationsInYear);

    return { monthlyTrend };
  } catch (error) {
    console.error("Error getDonorMonthlyTrend in donorOverviewService:", error);
    throw error;
  }
}
