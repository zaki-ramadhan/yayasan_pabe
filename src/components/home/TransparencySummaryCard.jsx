import { formatNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";

/**
 * Reusable metric item for financial summary values
 */
export function MetricItem({
  title,
  value,
  prefix,
  isPrimary = false,
  className = "",
}) {
  return (
    <div className={className}>
      <span className="text-base font-medium text-slate-600 block">
        {title}
      </span>
      <div
        className={
          isPrimary
            ? "flex items-baseline whitespace-nowrap mt-1"
            : "flex items-baseline whitespace-nowrap mt-0.5"
        }
      >
        {prefix && (
          <span
            className={
              isPrimary
                ? "text-sm sm:text-base font-semibold text-slate-600 mr-1.5 select-none shrink-0"
                : "text-xs sm:text-sm font-semibold text-slate-600 mr-1 select-none shrink-0"
            }
          >
            {prefix}
          </span>
        )}
        <span
          className={
            isPrimary
              ? "text-xl sm:text-2xl xl:text-3xl font-semibold text-slate-800 tracking-tight tabular-nums"
              : "text-lg font-semibold text-slate-800 tabular-nums"
          }
        >
          {value}
        </span>
      </div>
    </div>
  );
}

/**
 * Reusable summary card for transparency section
 */
export function TransparencySummaryCard({
  metrics = {},
  items: customItems,
  className = "",
}) {
  const monthlyTrend = Array.isArray(metrics?.monthlyTrend) ? metrics.monthlyTrend : [];
  const total12Months = monthlyTrend.reduce((acc, item) => acc + (item.amount || 0), 0);
  const totalCount = monthlyTrend.reduce((acc, item) => acc + (item.count || 0), 0);
  const totalAllTime = metrics?.totalDonationsAllTime ?? total12Months;
  const totalTransactions = metrics?.totalTransactions ?? totalCount;
  const totalBeneficiaries = metrics?.totalBeneficiaries ?? 0;
  const auditOpinion = metrics?.kapAuditOpinion || "WTP";

  const defaultItems = [
    {
      title: "Penyaluran (12 Bulan Terakhir)",
      prefix: "Rp",
      value: formatNumber(total12Months > 0 ? total12Months : totalAllTime),
      isPrimary: true,
    },
    {
      title: "Total Transaksi Donasi",
      value: `${formatNumber(totalTransactions)} Transaksi`,
    },
    {
      title: "Akumulasi Dana Terhimpun",
      prefix: "Rp",
      value: formatNumber(totalAllTime),
    },
    {
      title: "Penerima Manfaat Terverifikasi",
      value: `${formatNumber(totalBeneficiaries)} Jiwa`,
    },
    {
      title: "Opini Audit KAP",
      value: auditOpinion,
    },
  ];

  const items = customItems || defaultItems;

  return (
    <div
      className={cn(
        "bg-slate-100/90 border border-slate-200 rounded p-5 sm:p-6 flex flex-col justify-between h-full space-y-4",
        className
      )}
    >
      {items.map((item) => (
        <MetricItem
          key={item.title}
          title={item.title}
          value={item.value}
          prefix={item.prefix}
          isPrimary={item.isPrimary}
        />
      ))}
    </div>
  );
}

