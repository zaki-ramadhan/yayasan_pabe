"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { SortDropdown } from "@/components/shared/SortDropdown";
import { formatRupiah, formatCompactNumber } from "@/lib/formatters";
import { TIME_RANGE_OPTIONS, VIEW_MODE_OPTIONS } from "@/data/chartOptions";
import { useCampaignChartData } from "./useCampaignChartData";
import { CampaignChartSummaryCards } from "./CampaignChartSummaryCards";

export function CampaignDonationGrowthChart({
  initialData = [],
  campaign = {},
}) {
  const [timeRange, setTimeRange] = React.useState("30d");
  const [viewMode, setViewMode] = React.useState("all"); // 'all' | 'daily' | 'cumulative'

  const { chartData, summaryMetrics, currentChartConfig } = useCampaignChartData({
    initialData,
    campaign,
    timeRange,
    viewMode,
  });

  return (
    <div className="space-y-5">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h3 className="text-base sm:text-lg font-semibold text-slate-950">
            Grafik Perkembangan Donasi
          </h3>
          <p className="text-sm sm:text-base text-slate-600">
            Visualisasi akumulasi dana dan tren donasi harian yang terverifikasi sistem.
          </p>
        </div>

        {/* Controls: View Mode Selector + Range Selector */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto flex-wrap">
          <SortDropdown
            options={VIEW_MODE_OPTIONS}
            value={viewMode}
            onChange={setViewMode}
            label="Pilih Tampilan"
            align="end"
            className="h-9 text-xs sm:text-sm w-fit whitespace-nowrap"
          />
          <SortDropdown
            options={TIME_RANGE_OPTIONS}
            value={timeRange}
            onChange={setTimeRange}
            label="Pilih Rentang"
            align="end"
            className="h-9 text-xs sm:text-sm w-fit whitespace-nowrap"
          />
        </div>
      </div>

      {/* KPI Highlight Summary Cards */}
      <CampaignChartSummaryCards
        summaryMetrics={summaryMetrics}
        campaign={campaign}
      />

      {/* Interactive Dual-Axis Area Chart */}
      <div className="pt-2">
        <ChartContainer
          config={currentChartConfig}
          className="aspect-auto h-[260px] sm:h-[300px] w-full outline-none focus:outline-none select-none [&_*]:outline-none [&_*]:focus:outline-none"
        >
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: viewMode === "all" ? -5 : 10,
              left: -15,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="fillCumulative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="fillDaily" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={28}
              tick={{ fill: "#64748b", fontSize: 12, fontWeight: 400 }}
              tickFormatter={(value) => {
                if (!value) return "";
                const date = new Date(value);
                return date.toLocaleDateString("id-ID", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />

            {/* Sumbu Y Kiri: Akumulasi Total */}
            {viewMode !== "daily" && (
              <YAxis
                yAxisId="cumulative"
                orientation="left"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: "#64748b", fontSize: 12, fontWeight: 400 }}
                tickFormatter={(value) => formatCompactNumber(value)}
              />
            )}

            {/* Sumbu Y Kanan (atau Kiri jika single mode): Donasi Harian */}
            {viewMode !== "cumulative" && (
              <YAxis
                yAxisId="daily"
                orientation={viewMode === "all" ? "right" : "left"}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: "#64748b", fontSize: 12, fontWeight: 400 }}
                tickFormatter={(value) => formatCompactNumber(value)}
              />
            )}

            <ChartTooltip
              cursor={{ stroke: "#94a3b8", strokeWidth: 1, strokeDasharray: "4 4" }}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    if (!value) return "";
                    const date = new Date(value);
                    return date.toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    });
                  }}
                  formatter={(value, name) => {
                    const isCum = name === "cumulativeAmount";
                    const label = isCum ? "Total Terkumpul" : "Donasi Harian";
                    return (
                      <div className="flex items-center justify-between w-full gap-4 text-xs">
                        <span className="text-slate-600">{label}:</span>
                        <span className="font-semibold text-slate-950">
                          {formatRupiah(Number(value))}
                        </span>
                      </div>
                    );
                  }}
                  indicator="dot"
                />
              }
            />

            {/* Area Donasi Harian (Sumbu Y Independen 'daily') */}
            {viewMode !== "cumulative" && (
              <Area
                yAxisId="daily"
                dataKey="dailyAmount"
                type="monotone"
                fill="url(#fillDaily)"
                stroke="#10b981"
                strokeWidth={2}
                name="dailyAmount"
              />
            )}

            {/* Area Total Akumulasi (Sumbu Y Independen 'cumulative') */}
            {viewMode !== "daily" && (
              <Area
                yAxisId="cumulative"
                dataKey="cumulativeAmount"
                type="monotone"
                fill="url(#fillCumulative)"
                stroke="#2563eb"
                strokeWidth={2.5}
                name="cumulativeAmount"
              />
            )}

            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </div>
    </div>
  );
}
