"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { Card, CardContent } from "@/components/ui/Card";
import { ChartLegendGrid } from "./ChartLegendGrid";
import { formatRupiah } from "@/lib/formatters";

/**
 * Organism: Pie Chart for Cash In vs Cash Out Proportion.
 *
 * @param {object} props
 * @param {{cashIn: number, cashOut: number}} props.totals
 */
export function CashFlowRatioPieChart({ totals = { cashIn: 0, cashOut: 0 } }) {
  const cashInVal = totals.cashIn || 0;
  const cashOutVal = totals.cashOut || 0;
  const sum = cashInVal + cashOutVal;

  const pctIn = sum > 0 ? Math.round((cashInVal / sum) * 100) : 50;
  const pctOut = sum > 0 ? 100 - pctIn : 50;

  const pieData = [
    {
      name: "Penghimpunan (Cash In)",
      value: cashInVal,
      percentage: pctIn,
      color: "#0ea5e9", // sky-500
    },
    {
      name: "Penyaluran (Cash Out)",
      value: cashOutVal,
      percentage: pctOut,
      color: "#10b981", // emerald-500
    },
  ];

  const legendItems = pieData.map((d) => ({
    label: d.name,
    color: d.color,
    percentage: d.percentage,
  }));

  return (
    <Card className="rounded-lg border-slate-200 shadow-xs h-full flex flex-col">
      <CardContent className="p-4 sm:p-6 flex flex-col justify-between flex-1 space-y-4">
        {/* Title */}
        <h3 className="text-base sm:text-lg font-semibold text-slate-950 text-center tracking-tight">
          Proporsi Rasio Arus Kas
        </h3>

        {/* Pie Chart */}
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
                        <span className="font-semibold text-slate-950">
                          {item.name}
                        </span>
                      </div>
                      <div className="text-slate-600 font-medium">
                        {formatRupiah(Number(item.value))} ({item.payload?.percentage}%)
                      </div>
                    </div>
                  );
                }}
              />
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                stroke="#ffffff"
                strokeWidth={2}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cashflow-pie-cell-${entry.name}-${index}`}
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
