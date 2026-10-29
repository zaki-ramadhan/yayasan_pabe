"use client";

import * as React from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/Chart";
import { formatRupiah, formatNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";

const chartConfig = {
  amount: {
    label: "Dana Penyaluran",
    color: "#059669",
  },
};

export function TransparencyTrendChart({ data = [], className = "" }) {
  const chartData = Array.isArray(data) && data.length > 0 ? data : [];

  return (
    <div className={cn("w-full max-w-5xl mx-auto", className)}>
      <ChartContainer
        config={chartConfig}
        className="aspect-auto h-[300px] sm:h-[360px] w-full outline-none focus:outline-none select-none [&_*]:outline-none [&_*]:focus:outline-none"
      >
        <AreaChart
          data={chartData}
          margin={{
            top: 25,
            right: 15,
            left: 15,
            bottom: 10,
          }}
        >
          <defs>
            <linearGradient id="fillSingleTrend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity={0.14} />
              <stop offset="100%" stopColor="#059669" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          {/* Garis horizontal solid tipis */}
          <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="0" />

          {/* 12 Bulan pada sumbu X */}
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={18}
            className="text-xs sm:text-sm fill-slate-400 font-normal"
          />

          {/* Tooltip standar sistem chart persis tab riwayat donasi */}
          <ChartTooltip
            cursor={{ stroke: "#94a3b8", strokeWidth: 1, strokeDasharray: "4 4" }}
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => {
                  const item = payload?.[0]?.payload;
                  return item?.fullMonth ? `Periode ${item.fullMonth}` : "";
                }}
                formatter={(value, _, item) => (
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between w-full gap-4">
                      <span className="text-slate-600">Realisasi Penyaluran:</span>
                      <span className="font-semibold text-slate-950">
                        {formatRupiah(Number(value))}
                      </span>
                    </div>
                    {item?.payload?.count > 0 && (
                      <div className="flex items-center justify-between w-full gap-4 text-slate-500 text-[11px]">
                        <span>Jumlah Transaksi:</span>
                        <span>{formatNumber(item.payload.count)} donasi</span>
                      </div>
                    )}
                  </div>
                )}
                indicator="dot"
              />
            }
          />

          {/* Satu garis kurva tunggal yang mengalir tenang dan elegan */}
          <Area
            type="monotone"
            dataKey="amount"
            name="amount"
            stroke="#059669"
            strokeWidth={2.5}
            fill="url(#fillSingleTrend)"
            dot={{ r: 3.5, fill: "#ffffff", stroke: "#059669", strokeWidth: 2 }}
            activeDot={{ r: 6, fill: "#059669", stroke: "#ffffff", strokeWidth: 2.5 }}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
