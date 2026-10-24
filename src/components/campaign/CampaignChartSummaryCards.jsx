import { formatRupiah } from "@/lib/formatters";

export function CampaignChartSummaryCards({ summaryMetrics, campaign = {} }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 border border-x-0 border-slate-200 bg-slate-50/70 text-xs sm:text-sm overflow-hidden">
      <div className="p-3.5 sm:p-4 space-y-0.5">
        <span className="text-slate-600 font-medium">Total Akumulasi</span>
        <p className="text-base sm:text-lg font-semibold text-slate-950">
          {formatRupiah(summaryMetrics.latestCumulative)}
        </p>
      </div>

      <div className="p-3.5 sm:p-4 space-y-0.5">
        <span className="text-slate-600 font-medium">Donasi Periode Ini</span>
        <p className="text-base sm:text-lg font-semibold text-slate-950">
          {formatRupiah(summaryMetrics.totalPeriod || summaryMetrics.latestCumulative)}
        </p>
      </div>

      <div className="p-3.5 sm:p-4 space-y-0.5">
        <span className="text-slate-600 font-medium">Donatur Berpartisipasi</span>
        <p className="text-base sm:text-lg font-semibold text-slate-950">
          {summaryMetrics.totalTransactions || campaign.donorCount || 0} donasi
        </p>
      </div>
    </div>
  );
}
