import { useMemo } from "react";

function toDateKey(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function useCampaignChartData({ initialData = [], campaign = {}, timeRange = "30d", viewMode = "all" }) {
  // Generate continuous daily date series (without gaps) for selected time range
  const chartData = useMemo(() => {
    // 1. Map real transactions per date
    const transactionMap = new Map();
    if (Array.isArray(initialData)) {
      initialData.forEach((item) => {
        if (item?.date) {
          transactionMap.set(item.date, {
            dailyAmount: Number(item.dailyAmount || 0),
            donationsCount: Number(item.donationsCount || 0),
          });
        }
      });
    }

    // 2. Determine date range (startDate to today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let startDate = new Date(today);
    if (timeRange === "7d") {
      startDate.setDate(today.getDate() - 6);
    } else if (timeRange === "90d") {
      startDate.setDate(today.getDate() - 89);
    } else {
      // Default: '30d'
      startDate.setDate(today.getDate() - 29);
    }

    // 3. Calculate accumulated funds collected BEFORE startDate
    const startKey = toDateKey(startDate);
    let totalBeforeStart = 0;
    if (Array.isArray(initialData)) {
      initialData.forEach((item) => {
        if (item?.date && item.date < startKey) {
          totalBeforeStart += Number(item.dailyAmount || 0);
        }
      });
    }

    // 4. Generate sequential continuous daily records
    const continuousSeries = [];
    let runningCumulative = totalBeforeStart;
    const cursor = new Date(startDate);

    while (cursor <= today) {
      const dateKey = toDateKey(cursor);
      const tx = transactionMap.get(dateKey);

      const daily = tx ? tx.dailyAmount : 0;
      const count = tx ? tx.donationsCount : 0;
      runningCumulative += daily;

      continuousSeries.push({
        date: dateKey,
        dailyAmount: daily,
        cumulativeAmount: runningCumulative,
        donationsCount: count,
      });

      cursor.setDate(cursor.getDate() + 1);
    }

    // Fallback if no transactions yet in DB but campaign already has collectedAmount
    if (
      transactionMap.size === 0 &&
      Number(campaign?.collectedAmount || 0) > 0 &&
      continuousSeries.length > 0
    ) {
      const total = Number(campaign.collectedAmount);
      const totalDonors = Number(campaign.donorCount || 1);
      continuousSeries[continuousSeries.length - 1].cumulativeAmount = total;
      continuousSeries[continuousSeries.length - 1].dailyAmount = total;
      continuousSeries[continuousSeries.length - 1].donationsCount = totalDonors;
    }

    return continuousSeries;
  }, [initialData, campaign, timeRange]);

  // Summary metrics calculation
  const summaryMetrics = useMemo(() => {
    const totalPeriod = chartData.reduce((acc, curr) => acc + (curr.dailyAmount || 0), 0);
    const totalTransactions = chartData.reduce((acc, curr) => acc + (curr.donationsCount || 0), 0);
    const avgPerDay = chartData.length > 0 ? Math.round(totalPeriod / chartData.length) : 0;
    const latestCumulative = chartData[chartData.length - 1]?.cumulativeAmount || campaign.collectedAmount || 0;

    return {
      totalPeriod,
      totalTransactions,
      avgPerDay,
      latestCumulative,
    };
  }, [chartData, campaign]);

  const currentChartConfig = useMemo(() => {
    if (viewMode === "all") {
      return {
        cumulativeAmount: {
          label: "Total Terkumpul (Kiri)",
          color: "#2563eb",
        },
        dailyAmount: {
          label: "Donasi Harian (Kanan)",
          color: "#10b981",
        },
      };
    }
    if (viewMode === "daily") {
      return {
        dailyAmount: {
          label: "Donasi Harian",
          color: "#10b981",
        },
      };
    }
    return {
      cumulativeAmount: {
        label: "Total Terkumpul",
        color: "#2563eb",
      },
    };
  }, [viewMode]);

  return {
    chartData,
    summaryMetrics,
    currentChartConfig,
  };
}
