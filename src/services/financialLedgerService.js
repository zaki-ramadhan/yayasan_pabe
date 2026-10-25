import prisma from "@/lib/prisma";
import {
  aggregateFinancialAnalytics,
  getFallbackAnalytics,
} from "./financialAnalyticsHelper";

export { aggregateFinancialAnalytics, getFallbackAnalytics };

/**
 * Mengambil ringkasan data buku besar keuangan yayasan (penerimaan & penyaluran dana riil)
 */
export async function getFinancialLedgerData() {
  try {
    const [donations, updates, campaigns, donationsAgg, updatesAgg] = await Promise.all([
      prisma.donation.findMany({
        where: { status: "PAID" },
        orderBy: { paidAt: "desc" },
        take: 300,
        select: {
          id: true,
          campaignId: true,
          amount: true,
          paymentChannel: true,
          donationType: true,
          donorName: true,
          isAnonymous: true,
          paidAt: true,
          createdAt: true,
          campaign: {
            select: {
              id: true,
              title: true,
              category: { select: { name: true } },
            },
          },
        },
      }),
      prisma.campaignUpdate.findMany({
        where: { disbursedAmount: { gt: 0 } },
        orderBy: { date: "desc" },
        take: 100,
        select: {
          id: true,
          campaignId: true,
          title: true,
          disbursedAmount: true,
          date: true,
          campaign: {
            select: {
              id: true,
              title: true,
              category: { select: { name: true } },
            },
          },
        },
      }),
      prisma.campaign.findMany({
        select: {
          id: true,
          slug: true,
          title: true,
          collectedAmount: true,
          targetAmount: true,
          bannerUrl: true,
          category: { select: { name: true } },
        },
      }),
      prisma.donation.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
      }),
      prisma.campaignUpdate.aggregate({
        where: { disbursedAmount: { gt: 0 } },
        _sum: { disbursedAmount: true },
      }),
    ]);

    const totalIncome = Number(donationsAgg?._sum?.amount || 0);
    const totalExpenses = Number(updatesAgg?._sum?.disbursedAmount || 0);
    const netBalance = totalIncome - totalExpenses;

    const incomingTx = donations.map((d) => ({
      id: d.id,
      campaignId: d.campaignId || null,
      campaignTitle: d.campaign?.title || null,
      date: d.paidAt ? d.paidAt.toISOString() : d.createdAt.toISOString(),
      source: d.paymentChannel ? d.paymentChannel.replace(/_/g, " ") : "QRIS",
      type: "INCOME",
      typeLabel: "Donasi Masuk",
      description: d.campaign?.title || (d.donationType === "ZAKAT" ? "Zakat Penghasilan" : "Sedekah Umum"),
      category: d.campaign?.category?.name || "ZISWAF",
      amount: d.amount,
      status: "PAID",
      statusLabel: "Diterima",
    }));

    const outgoingTx = updates.map((u) => ({
      id: u.id,
      campaignId: u.campaignId || null,
      campaignTitle: u.campaign?.title || null,
      date: u.date ? u.date.toISOString() : new Date().toISOString(),
      source: "Kas Program",
      type: "EXPENSE",
      typeLabel: "Penyaluran",
      description: u.title,
      category: u.campaign?.category?.name || "Program Penyaluran",
      amount: -u.disbursedAmount,
      status: "COMPLETED",
      statusLabel: "Tersalurkan",
    }));

    const allTransactions = [...incomingTx, ...outgoingTx].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const now = new Date();
    const daysUntilNextFriday = ((5 - now.getDay() + 7) % 7) || 7;
    const nextFridayDate = new Date(now.getTime() + daysUntilNextFriday * 24 * 60 * 60 * 1000);
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const nextDistributionFormatted = `${nextFridayDate.getDate()} ${months[nextFridayDate.getMonth()]} ${nextFridayDate.getFullYear()}`;

    // Aggregasi data analitik riil untuk Rincian Laporan Keuangan & Arus Kas
    const analytics = aggregateFinancialAnalytics(donations, updates, totalIncome, totalExpenses);

    return {
      transactions: allTransactions,
      campaigns: campaigns.map((c) => ({
        id: c.id,
        slug: c.slug || c.id,
        title: c.title,
        collectedAmount: c.collectedAmount,
        targetAmount: c.targetAmount,
        bannerUrl: c.bannerUrl || null,
        category: c.category?.name || "Umum",
      })),
      grandTotals: {
        totalIncome,
        totalExpenses,
        netBalance,
      },
      nextDistributionDate: nextDistributionFormatted,
      financialDetails: analytics.financialDetails,
      cashFlowDetails: analytics.cashFlowDetails,
    };
  } catch (error) {
    console.warn("Prisma getFinancialLedgerData fallback:", error.message);
    const fallbackAnalytics = getFallbackAnalytics();
    return {
      transactions: [],
      campaigns: [],
      grandTotals: {
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0,
      },
      nextDistributionDate: "Jumat Ini",
      financialDetails: fallbackAnalytics.financialDetails,
      cashFlowDetails: fallbackAnalytics.cashFlowDetails,
    };
  }
}

