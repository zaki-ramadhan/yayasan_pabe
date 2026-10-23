import {
  getAdminOverviewStats,
  getAdminTransactions,
  getAdminCampaigns,
  getAdminDonationTrends,
} from "@/services/adminService";
import { AdminMetricCards } from "@/components/admin/AdminMetricCards";
import { AdminDonationTrendCard } from "@/components/admin/analytics/AdminDonationTrendCard";
import { AdminRecentTransactionsCard } from "@/components/admin/AdminRecentTransactionsCard";
import { AdminCampaignOverviewCard } from "@/components/admin/AdminCampaignOverviewCard";

export const metadata = {
  title: "Dashboard Administrator",
  description: "Ringkasan performa penghimpunan donasi, penyaluran program mustahik, dan mutasi kas riil yayasan.",
};

export default async function AdminDashboardPage() {
  const [stats, transactionsData, campaignsData, trendData] = await Promise.all([
    getAdminOverviewStats(),
    getAdminTransactions({ limit: 7 }),
    getAdminCampaigns({ status: "ACTIVE", limit: 4 }),
    getAdminDonationTrends(),
  ]);

  return (
    <div className="space-y-2.5">
      {/* 1. Metric Overview Cards */}
      <AdminMetricCards stats={stats} />

      {/* 2. Donation & Cashflow Trend Analytics Chart */}
      <AdminDonationTrendCard initialTrends={trendData} />

      {/* 3. Main Grid: Real-time Transactions + Priority Campaign Progress (Fit-Content) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-start">
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col">
          <AdminRecentTransactionsCard
            initialTransactions={transactionsData.items}
            maxRows={7}
          />
        </div>
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col">
          <AdminCampaignOverviewCard
            campaigns={campaignsData.items}
            maxItems={4}
            stretch={false}
          />
        </div>
      </div>
    </div>
  );
}
