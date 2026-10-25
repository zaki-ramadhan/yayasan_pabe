/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SortDropdown } from "@/components/shared/SortDropdown";
import { AdminDonationTrendCanvas } from "./AdminDonationTrendCanvas";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { USER_ROLES } from "@/services/authService";
import { formatRupiah, formatNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";

const TIME_RANGE_OPTIONS = [
  { value: "7d", label: "7 hari terakhir" },
  { value: "30d", label: "30 hari terakhir" },
  { value: "90d", label: "90 hari terakhir" },
  { value: "12m", label: "12 bulan terakhir" },
];

export function AdminDonationTrendCard({
  initialTrends = { dailyTrend: [], monthlyTrend: [] },
  className = "",
}) {
  const { currentUser } = useCurrentUser();
  const isSuperAdmin = currentUser?.role === USER_ROLES.SUPER_ADMIN;

  const [timeRange, setTimeRange] = React.useState("30d");
  const [viewMode, setViewMode] = React.useState("all");

  const viewModeOptions = React.useMemo(() => {
    const base = [
      { value: "all", label: "Grafik gabungan" },
      { value: "daily", label: "Donasi masuk" },
      { value: "cumulative", label: "Total akumulasi" },
    ];
    if (isSuperAdmin || timeRange === "12m") {
      base.push({ value: "outflow", label: "Penyaluran program" });
    }
    return base;
  }, [isSuperAdmin, timeRange]);

  // Fallback jika viewMode terpilih tidak tersedia setelah ubah filter
  React.useEffect(() => {
    if (!viewModeOptions.some((opt) => opt.value === viewMode)) {
      setViewMode("all");
    }
  }, [viewModeOptions, viewMode]);

  const { activeData, totalInRange, avgDaily, totalTransactions, isMonthly } = React.useMemo(() => {
    const dailyList = initialTrends?.dailyTrend || [];
    const monthlyList = initialTrends?.monthlyTrend || [];

    if (timeRange === "12m") {
      const data = monthlyList;
      const total = data.reduce((acc, curr) => acc + (Number(curr.inflow) || 0), 0);
      const txCount = data.reduce((acc, curr) => acc + (Number(curr.count) || 0), 0);
      const avg = data.length > 0 ? Math.round(total / data.length) : 0;
      return {
        activeData: data,
        totalInRange: total,
        avgDaily: avg,
        totalTransactions: txCount,
        isMonthly: true,
      };
    }

    let sliceDays = 30;
    if (timeRange === "7d") sliceDays = 7;
    if (timeRange === "90d") sliceDays = 90;

    const data = dailyList.slice(-sliceDays);
    const total = data.reduce((acc, curr) => acc + (Number(curr.dailyAmount) || 0), 0);
    const txCount = data.reduce((acc, curr) => acc + (Number(curr.donationsCount) || 0), 0);
    const avg = data.length > 0 ? Math.round(total / data.length) : 0;

    return {
      activeData: data,
      totalInRange: total,
      avgDaily: avg,
      totalTransactions: txCount,
      isMonthly: false,
    };
  }, [timeRange, initialTrends]);

  return (
    <Card className={cn("shadow-2xs overflow-hidden", className)}>
      {/* Header Kartu */}
      <CardHeader className="p-3.5 sm:p-4 pb-3.5 border-b border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-3 space-y-0">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold text-slate-900 leading-tight">
              Tren Dinamika Donasi
            </CardTitle>
            {isSuperAdmin && (
              <Badge variant="secondary" className="px-1.5 py-0.5 text-[11px] font-medium">
                Super admin
              </Badge>
            )}
          </div>
          <CardDescription className="text-sm text-slate-500 mt-0.5 font-normal">
            Analitik perolehan donasi masuk dan arus kas operasional yayasan
          </CardDescription>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <SortDropdown
            options={TIME_RANGE_OPTIONS}
            value={timeRange}
            onChange={setTimeRange}
            label="Rentang waktu"
            className="h-9 px-3 text-sm w-full sm:w-[165px]"
          />
          <SortDropdown
            options={viewModeOptions}
            value={viewMode}
            onChange={setViewMode}
            label="Mode grafik"
            className="h-9 px-3 text-sm w-full sm:w-[175px]"
          />
        </div>
      </CardHeader>

      {/* Subheader Ringkasan Nilai & Legenda */}
      <div className="px-3.5 sm:px-4 py-2.5 bg-slate-50/50 border-b border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
          <div>
            <span className="text-sm text-slate-500 block leading-tight">Total terhimpun:</span>
            <span className="text-sm font-semibold text-slate-900 block mt-0.5 tabular-nums">
              {formatRupiah(totalInRange)}
            </span>
          </div>
          <div className="border-l border-slate-200 pl-4 sm:pl-6">
            <span className="text-sm text-slate-500 block leading-tight">
              {isMonthly ? "Rata-rata bulanan:" : "Rata-rata harian:"}
            </span>
            <span className="text-sm font-semibold text-slate-900 block mt-0.5 tabular-nums">
              {formatRupiah(avgDaily)}
            </span>
          </div>
          <div className="border-l border-slate-200 pl-4 sm:pl-6">
            <span className="text-sm text-slate-500 block leading-tight">Frekuensi transaksi:</span>
            <span className="text-sm font-semibold text-slate-900 block mt-0.5 tabular-nums">
              {formatNumber(totalTransactions)} donasi
            </span>
          </div>
        </div>

        {/* Legend Indicators */}
        <div className="flex items-center gap-3.5 self-start sm:self-auto text-sm text-slate-600 shrink-0">
          {(viewMode === "all" || viewMode === "daily") && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
              <span>Donasi masuk</span>
            </div>
          )}
          {!isMonthly && (viewMode === "all" || viewMode === "cumulative") && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
              <span>Total akumulasi</span>
            </div>
          )}
          {(isSuperAdmin || timeRange === "12m" || viewMode === "outflow") && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0" />
              <span>Penyaluran</span>
            </div>
          )}
        </div>
      </div>

      {/* Recharts Canvas */}
      <CardContent className="p-3.5 sm:p-4 pt-3.5 sm:pt-4">
        <AdminDonationTrendCanvas
          data={activeData}
          viewMode={viewMode}
          isMonthly={isMonthly}
        />
      </CardContent>
    </Card>
  );
}
