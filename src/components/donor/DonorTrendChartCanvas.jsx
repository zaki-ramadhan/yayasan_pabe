"use client";

import { useId, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { formatRupiah, formatCompactRupiah } from "@/lib/formatters";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

export function DonorTrendChartCanvas({ data = [], isChartEmpty = false }) {
  const gradientId = useId();

  const chartData = useMemo(() => {
    if (Array.isArray(data) && data.length === 12) {
      return data;
    }

    const dataMap = {};
    if (Array.isArray(data)) {
      data.forEach((item) => {
        if (item?.month) {
          dataMap[item.month] = Number(item.donasi || 0);
        }
      });
    }

    return MONTH_NAMES.map((m) => ({
      month: m,
      donasi: dataMap[m] || 0,
    }));
  }, [data]);

  const isEmpty =
    isChartEmpty || chartData.every((item) => Number(item.donasi || 0) === 0);

  return (
    <div className="h-60 sm:h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 18, right: 12, left: -4, bottom: 4 }}
        >
          <defs>
            <linearGradient
              id={`emeraldGrad-${gradientId}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#059669" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f1f5f9"
          />

          <XAxis
            dataKey="month"
            stroke="#cbd5e1"
            tick={{ fill: "#64748b", fontSize: 12, fontWeight: 400 }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
          />

          <YAxis
            width={70}
            stroke="#cbd5e1"
            domain={isEmpty ? [0, 1] : [0, "auto"]}
            ticks={isEmpty ? [0] : undefined}
            tick={{ fill: "#64748b", fontSize: 12, fontWeight: 400 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => {
              if (!val) return "Rp 0";
              return formatCompactRupiah(val, 2, { short: true });
            }}
          />

          {!isEmpty && (
            <RechartsTooltip
              formatter={(value) => [formatRupiah(value), "Nominal Donasi"]}
              wrapperStyle={{ zIndex: 10, pointerEvents: "none" }}
              contentStyle={{
                backgroundColor: "#ffffff",
                borderColor: "#cbd5e1",
                borderRadius: "8px",
                fontSize: "13px",
              }}
            />
          )}

          <Area
            type="monotone"
            dataKey="donasi"
            stroke={isEmpty ? "transparent" : "#059669"}
            strokeWidth={2.5}
            fillOpacity={isEmpty ? 0 : 1}
            strokeOpacity={isEmpty ? 0 : 1}
            fill={isEmpty ? "transparent" : `url(#emeraldGrad-${gradientId})`}
            isAnimationActive={!isEmpty}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
