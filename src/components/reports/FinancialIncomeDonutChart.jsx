"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { ChartLegendGrid } from "./ChartLegendGrid";
import { formatRupiah } from "@/lib/formatters";

/**
 * Organism: Donut Chart for Distribusi Penghimpunan Keseluruhan.
 *
 * @param {object} props
 * @param {Array<{name: string, value: number, percentage: number, color: string}>} props.data
 */
export function FinancialIncomeDonutChart({ data = [] }) {
  const legendItems = data.map((d) => ({
    label: d.name,
    color: d.color,
    percentage: d.percentage,
  }));

  return (
    <Card className="rounded-lg border-slate-200 shadow-xs h-full flex flex-col">
      <CardContent className="p-4 sm:p-6 flex flex-col justify-between flex-1 space-y-4">
        {/* Title */}
        <h3 className="text-base sm:text-lg font-semibold text-slate-950 text-center tracking-tight">
          Distribusi Penghimpunan Keseluruhan
        </h3>

        {/* Donut Chart */}
        <div className="w-full flex-1 min-h-[220px] sm:min-h-[250px] aspect-auto">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  const item = payload[0];
                  return (
                    <div className="bg-white border border-slate-200 rounded-md shadow-md p-3 text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-xs shrink-0"
                          style={{ backgroundColor: item.payload?.color }}
                          aria-hidden="true"
                        />
                        <span className="font-medium text-slate-900">
                          {item.name}
                        </span>
                      </div>
                      <div className="text-slate-500 font-normal">
                        {formatRupiah(Number(item.value))} ({item.payload?.percentage}%)
                      </div>
                    </div>
                  );
                }}
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={65}
                outerRadius={100}
                paddingAngle={2}
                stroke="#ffffff"
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`donut-cell-${entry.name}-${index}`}
                    fill={entry.color}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend Grid Below */}
        <div className="pt-2 border-t border-slate-100">
          <ChartLegendGrid items={legendItems} />
        </div>
      </CardContent>
    </Card>
  );
}
