"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatRupiah } from "@/lib/formatters";

/**
 * Molecule component: Donut Chart for program allocations
 * Minimum text size is text-sm, clean table legend without badges or mini-card spam.
 * @param {object} props
 * @param {Array} props.allocations
 */
export function DistributionAuditDonutChart({ allocations = [] }) {
  if (!allocations || allocations.length === 0) return null;

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-6 lg:gap-12 w-full py-1">
      <div className="relative w-48 h-48 sm:w-52 sm:h-52 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              wrapperStyle={{ zIndex: 50, pointerEvents: "none" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-md text-sm space-y-1">
                      <div className="font-medium text-slate-900 flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-xs"
                          style={{ backgroundColor: data.color }}
                        />
                        <span>{data.name}</span>
                      </div>
                      <div className="text-slate-700">
                        {formatRupiah(data.amount)} ({data.percentage}%)
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={allocations}
              dataKey="percentage"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={78}
              paddingAngle={2}
              stroke="#ffffff"
              strokeWidth={2}
            >
              {allocations.map((entry) => (
                <Cell key={entry.id || entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
          <span className="text-sm font-medium text-slate-600">Alokasi</span>
          <span className="text-lg font-medium text-slate-900">100%</span>
        </div>
      </div>

      <div className="w-full md:max-w-md divide-y divide-slate-100">
        {allocations.map((item) => (
          <div
            key={item.id || item.name}
            className="flex items-center justify-between py-1.5 text-sm"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="w-3 h-3 rounded-xs shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate font-medium text-slate-800">
                {item.name}
              </span>
            </div>
            <div className="shrink-0 flex items-center gap-3">
              <span className="text-slate-600 font-normal hidden sm:inline">
                {formatRupiah(item.amount)}
              </span>
              <span className="font-medium text-slate-900 w-10 text-right">
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
