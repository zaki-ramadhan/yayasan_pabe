"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { formatRupiah } from "@/lib/formatters";

export function DonorGaugeChartCanvas({
  data = [],
  totalNominal = 0,
  colors = [],
}) {
  return (
    <div className="h-44 w-full flex items-center justify-center relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="75%"
            startAngle={180}
            endAngle={0}
            innerRadius={62}
            outerRadius={88}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.isPlaceholder
                    ? "#e2e8f0"
                    : colors[index % colors.length]
                }
              />
            ))}
          </Pie>
          {!data[0]?.isPlaceholder && (
            <RechartsTooltip
              formatter={(val) => formatRupiah(val)}
              wrapperStyle={{ zIndex: 50, pointerEvents: "none" }}
              contentStyle={{
                backgroundColor: "#ffffff",
                borderColor: "#cbd5e1",
                borderRadius: "8px",
                fontSize: "13px",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
              }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute top-[58%] text-center pointer-events-none z-0">
        <span className="text-sm font-medium text-slate-500 block">
          Total Donasi
        </span>
        <span className="text-base font-medium text-slate-900 block">
          {formatRupiah(totalNominal)}
        </span>
      </div>
    </div>
  );
}
