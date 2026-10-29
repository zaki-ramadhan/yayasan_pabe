"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Card, CardContent } from "@/components/ui/Card";
import { ChartTooltipCard } from "./ChartTooltipCard";
import { formatCompactRupiah, formatRupiah } from "@/lib/formatters";

/**
 * Organism: Multi-Category Stacked Bar Chart with side-by-side Penyaluran.
 *
 * @param {object} props
 * @param {Array<object>} props.data - Monthly aggregated data points
 * @param {Array<{id: string, name: string, color: string}>} props.categories - Configured category list
 */
export function FinancialCategoryBarChart({ data = [], categories = [] }) {
  const displayCategories = categories.length > 0
    ? categories
    : [
        { id: "Pendidikan & Beasiswa", name: "Pendidikan & Beasiswa", color: "#059669" },
        { id: "Zakat", name: "Zakat", color: "#2563eb" },
        { id: "Kemandirian Yatim", name: "Kemandirian Yatim", color: "#7c3aed" },
        { id: "Infaq & Sedekah", name: "Infaq & Sedekah", color: "#f59e0b" },
        { id: "Tanggap Bencana", name: "Tanggap Bencana", color: "#e11d48" },
        { id: "Pemberdayaan Umat", name: "Pemberdayaan Umat", color: "#0891b2" },
      ];

  return (
    <Card className="rounded-lg border-slate-200 shadow-xs h-full flex flex-col">
      <CardContent className="p-4 sm:p-6 space-y-4 flex flex-col flex-1">
        {/* Top Legend Header */}
        <div className="flex flex-wrap items-center justify-start gap-x-4 gap-y-2 text-sm">
          {displayCategories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-xs shrink-0"
                style={{ backgroundColor: cat.color }}
                aria-hidden="true"
              />
              <span className="font-medium text-slate-700">{cat.name} (In)</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-xs shrink-0 bg-emerald-500"
              aria-hidden="true"
            />
            <span className="font-medium text-slate-700">Penyaluran (Cash Out)</span>
          </div>
        </div>

        {/* Recharts Stacked & Grouped Bar Chart */}
        <div className="w-full flex-1 min-h-[320px] sm:min-h-[380px] aspect-auto">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 12, right: 16, left: 16, bottom: 8 }}
              barGap={4}
            >
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
                cursor={{ fill: "rgba(241, 245, 249, 0.5)" }}
                content={<ChartTooltipCard formatter={formatRupiah} />}
              />

              {/* Stacked Bars for Income Categories */}
              {displayCategories.map((cat, idx) => (
                <Bar
                  key={cat.id}
                  dataKey={cat.name}
                  stackId="income"
                  fill={cat.color}
                  radius={idx === displayCategories.length - 1 ? [2, 2, 0, 0] : [0, 0, 0, 0]}
                  maxBarSize={28}
                />
              ))}

              {/* Cash Out Bar (Emerald) */}
              <Bar
                dataKey="penyaluran"
                name="Penyaluran (Cash Out)"
                fill="#10b981"
                radius={[2, 2, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
