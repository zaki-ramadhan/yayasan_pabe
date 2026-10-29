"use client";

import * as React from "react";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/Chart";
import { formatRupiah, formatCompactRupiah, formatNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";

const chartConfig = {
  cumulativeAmount: {
    label: "Total akumulasi",
    color: "#2563eb",
  },
  dailyAmount: {
    label: "Donasi masuk",
    color: "#059669",
  },
  inflow: {
    label: "Total donasi masuk",
    color: "#059669",
  },
  outflow: {
    label: "Dana penyaluran",
    color: "#e11d48",
  },
  disbursedAmount: {
    label: "Penyaluran mustahik",
    color: "#e11d48",
  },
};

export function AdminDonationTrendCanvas({
  data = [],
  viewMode = "all",
  isMonthly = false,
  className = "",
}) {
  const chartData = Array.isArray(data) ? data : [];

  return (
    <div className={cn("w-full select-none", className)}>
      <ChartContainer
        config={chartConfig}
        className="aspect-auto h-[260px] sm:h-[300px] w-full outline-none focus:outline-none [&_*]:outline-none [&_*]:focus:outline-none"
      >
        <AreaChart
          data={chartData}
          margin={{
            top: 15,
            right: 12,
            left: 0,
            bottom: 4,
          }}
        >
          <defs>
            <linearGradient id="adminFillCumulative" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity={0.16} />
              <stop offset="100%" stopColor="#2563eb" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="adminFillDaily" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#059669" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="adminFillOutflow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e11d48" stopOpacity={0.14} />
              <stop offset="100%" stopColor="#e11d48" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="0" />

          <XAxis
            dataKey={isMonthly ? "month" : "label"}
            tickLine={false}
            axisLine={false}
            tickMargin={12}
            minTickGap={20}
            className="text-xs fill-slate-400 font-normal"
          />

          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            width={70}
            tickFormatter={(val) => formatCompactRupiah(val, 0)}
            className="text-xs fill-slate-400 font-normal"
          />

          <ChartTooltip
            cursor={{ stroke: "#94a3b8", strokeWidth: 1, strokeDasharray: "3 3" }}
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => {
                  const item = payload?.[0]?.payload;
                  if (isMonthly) {
                    return item?.fullMonth || "Periode";
                  }
                  return item?.date ? `Tanggal ${item.date}` : "Tanggal";
                }}
                formatter={(value, name, item) => {
                  const numVal = Number(value || 0);
                  const isOutflowKey = name === "outflow" || name === "disbursedAmount";
                  const isCumulativeKey = name === "cumulativeAmount";

                  let labelText = "Donasi Masuk";
                  if (isOutflowKey) labelText = "Penyaluran";
                  if (isCumulativeKey) labelText = "Total Akumulasi";

                  return (
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between w-full gap-4">
                        <span className="text-slate-600">{labelText}:</span>
                        <span className="font-semibold text-slate-900 tabular-nums">
                          {formatRupiah(numVal)}
                        </span>
                      </div>
                      {!isCumulativeKey && (item?.payload?.count > 0 || item?.payload?.donationsCount > 0) && (
                        <div className="flex items-center justify-between w-full gap-4 text-slate-500 text-[11px]">
                          <span>Jumlah transaksi:</span>
                          <span className="tabular-nums">
                            {formatNumber(item.payload.count || item.payload.donationsCount)} donasi
                          </span>
                        </div>
                      )}
                    </div>
                  );
                }}
                indicator="dot"
              />
            }
          />

          {isMonthly ? (
            <>
              {(viewMode === "all" || viewMode === "cumulative") && (
                <Area
                  type="monotone"
                  dataKey="cumulativeAmount"
                  name="cumulativeAmount"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fill="url(#adminFillCumulative)"
                  dot={{ r: 3, fill: "#ffffff", stroke: "#2563eb", strokeWidth: 1.5 }}
                  activeDot={{ r: 5, fill: "#2563eb", stroke: "#ffffff", strokeWidth: 2 }}
                />
              )}
              {(viewMode === "all" || viewMode === "daily") && (
                <Area
                  type="monotone"
                  dataKey="inflow"
                  name="inflow"
                  stroke="#059669"
                  strokeWidth={2}
                  fill="url(#adminFillDaily)"
                  dot={{ r: 3, fill: "#ffffff", stroke: "#059669", strokeWidth: 1.5 }}
                  activeDot={{ r: 5, fill: "#059669", stroke: "#ffffff", strokeWidth: 2 }}
                />
              )}
              {(viewMode === "all" || viewMode === "outflow") && (
                <Area
                  type="monotone"
                  dataKey="outflow"
                  name="outflow"
                  stroke="#e11d48"
                  strokeWidth={2}
                  fill="url(#adminFillOutflow)"
                  dot={{ r: 3, fill: "#ffffff", stroke: "#e11d48", strokeWidth: 1.5 }}
                  activeDot={{ r: 5, fill: "#e11d48", stroke: "#ffffff", strokeWidth: 2 }}
                />
              )}
            </>
          ) : (
            <>
              {(viewMode === "all" || viewMode === "cumulative") && (
                <Area
                  type="monotone"
                  dataKey="cumulativeAmount"
                  name="cumulativeAmount"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fill="url(#adminFillCumulative)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#2563eb", stroke: "#ffffff", strokeWidth: 2 }}
                />
              )}
              {(viewMode === "all" || viewMode === "daily") && (
                <Area
                  type="monotone"
                  dataKey="dailyAmount"
                  name="dailyAmount"
                  stroke="#059669"
                  strokeWidth={2}
                  fill="url(#adminFillDaily)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#059669", stroke: "#ffffff", strokeWidth: 2 }}
                />
              )}
              {viewMode === "outflow" && (
                <Area
                  type="monotone"
                  dataKey="disbursedAmount"
                  name="disbursedAmount"
                  stroke="#e11d48"
                  strokeWidth={2}
                  fill="url(#adminFillOutflow)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#e11d48", stroke: "#ffffff", strokeWidth: 2 }}
                />
              )}
            </>
          )}
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
