"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/Chart";
import { formatRupiah, formatCompactRupiah } from "@/lib/formatters";

const chartConfig = {
  penghimpunan: {
    label: "Penghimpunan",
    color: "#2563eb", // blue-600
  },
  penyaluran: {
    label: "Penyaluran",
    color: "#059669", // emerald-600
  },
};

/**
 * Horizontal Multiple Bar Chart for Top 5 Programs.
 * Displays side-by-side comparison of Penghimpunan and Penyaluran.
 *
 * @param {object} props
 * @param {Array<object>} props.data - Prepared ranking data
 */
export function TopProgramsBarChart({ data = [] }) {
  return (
    <div className="space-y-4">
      {/* Legend Header (No dots, rectangular indicators, text-sm) */}
      <div className="flex items-center justify-end gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-xs bg-blue-600" />
          <span className="font-medium text-slate-700">Penghimpunan</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-xs bg-emerald-600" />
          <span className="font-medium text-slate-700">Penyaluran</span>
        </div>
      </div>

      {/* Recharts Horizontal Multiple Bar Chart */}
      <ChartContainer
        config={chartConfig}
        className="w-full h-[290px] sm:h-[320px] aspect-auto text-sm"
      >
        <BarChart
          accessibilityLayer
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 16, left: 16, bottom: 8 }}
          barCategoryGap="22%"
          barGap={4}
        >
          <CartesianGrid
            horizontal={false}
            strokeDasharray="3 3"
            className="stroke-slate-200"
          />
          <YAxis
            dataKey="shortName"
            type="category"
            tickLine={false}
            axisLine={false}
            width={130}
            tick={{ fill: "#1e293b", fontSize: 13, fontWeight: 500 }}
          />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => formatCompactRupiah(value, 0)}
            tick={{ fill: "#64748b", fontSize: 13, fontWeight: 400 }}
          />
          <ChartTooltip
            cursor={{ fill: "rgba(241, 245, 249, 0.6)" }}
            content={
              <ChartTooltipContent
                indicator="line"
                className="text-sm rounded-lg shadow-md bg-white border border-slate-200"
                formatter={(value, name) => (
                  <div className="flex items-center justify-between gap-4 text-sm w-full">
                    <span className="text-slate-600 font-normal">
                      {name === "penghimpunan" ? "Penghimpunan" : "Penyaluran"}:
                    </span>
                    <span className="font-semibold text-slate-950">
                      {formatRupiah(Number(value))}
                    </span>
                  </div>
                )}
              />
            }
          />
          <Bar
            dataKey="penghimpunan"
            fill="var(--color-penghimpunan)"
            radius={[0, 4, 4, 0]}
            barSize={12}
          />
          <Bar
            dataKey="penyaluran"
            fill="var(--color-penyaluran)"
            radius={[0, 4, 4, 0]}
            barSize={12}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
