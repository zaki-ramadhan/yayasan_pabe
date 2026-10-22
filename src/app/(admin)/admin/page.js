import {
  getAdminOverviewStats,
  getAdminTransactions,
  getAdminCampaigns,
} from "@/services/adminService";
import { AdminMetricCards } from "@/components/admin/AdminMetricCards";
import { AdminRecentTransactionsCard } from "@/components/admin/AdminRecentTransactionsCard";
import { AdminCampaignOverviewCard } from "@/components/admin/AdminCampaignOverviewCard";

export const metadata = {
  title: "Dashboard Administrator",
  description: "Ringkasan performa penghimpunan donasi, penyaluran program mustahik, dan mutasi kas riil yayasan.",
};

export default async function AdminDashboardPage() {
  const [stats, transactionsData, campaignsData] = await Promise.all([
    getAdminOverviewStats(),
    getAdminTransactions({ limit: 7 }),
    getAdminCampaigns({ status: "ACTIVE", limit: 5 }),
  ]);

  return (
    <div className="space-y-2.5">
      {/* 1. Metric Overview Cards */}
      <AdminMetricCards stats={stats} />

      {/* 2. Main Grid: Real-time Transactions + Priority Campaign Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch">
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col">
          <AdminRecentTransactionsCard initialTransactions={transactionsData.items} />
        </div>
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col">
          <AdminCampaignOverviewCard campaigns={campaignsData.items} />
        </div>
      </div>
    </div>
  );
}
