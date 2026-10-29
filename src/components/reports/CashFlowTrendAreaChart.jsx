"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Card, CardContent } from "@/components/ui/Card";
import { ChartTooltipCard } from "./ChartTooltipCard";
import { formatCompactRupiah, formatRupiah } from "@/lib/formatters";

/**
 * Organism: Smooth Area/Line Chart comparing Cash In vs Cash Out across months.
 *
 * @param {object} props
 * @param {Array<{month: string, cashIn: number, cashOut: number}>} props.data
 */
export function CashFlowTrendAreaChart({ data = [] }) {
  return (
    <Card className="rounded-lg border-slate-200 shadow-xs h-full flex flex-col">
      <CardContent className="p-4 sm:p-6 space-y-4 flex flex-col flex-1">
        {/* Top Legend Header */}
        <div className="flex items-center justify-start gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-xs bg-sky-500 shrink-0" aria-hidden="true" />
            <span className="font-medium text-slate-700">Penghimpunan (Cash In)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-xs bg-emerald-500 shrink-0" aria-hidden="true" />
            <span className="font-medium text-slate-700">Penyaluran (Cash Out)</span>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="w-full flex-1 min-h-[320px] sm:min-h-[380px] aspect-auto">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 12, right: 16, left: 16, bottom: 8 }}
            >
              <defs>
                <linearGradient id="gradientCashIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="gradientCashOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 13, fontWeight: 500 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => formatCompactRupiah(val, 0)}
                tick={{ fill: "#64748b", fontSize: 13, fontWeight: 500 }}
                width={70}
              />
              <Tooltip
                cursor={{ stroke: "#cbd5e1", strokeWidth: 1 }}
                content={<ChartTooltipCard formatter={formatRupiah} />}
              />
              <Area
                type="monotone"
                dataKey="cashIn"
                name="Penghimpunan (Cash In)"
                stroke="#0ea5e9"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#gradientCashIn)"
              />
              <Area
                type="monotone"
                dataKey="cashOut"
                name="Penyaluran (Cash Out)"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#gradientCashOut)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
