"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatRupiah, formatNumber, formatCompactRupiah } from "@/lib/formatters";

/**
 * Molecule component: Smooth Area Chart for monthly distribution trend
 * Clean deep navy palette without harsh/colorful accents. Minimum text-sm.
 * @param {object} props
 * @param {Array} props.data
 */
export function DistributionAreaChart({ data = [] }) {
  if (!data || data.length === 0) return null;

  const maxAmount = Math.max(0, ...data.map((d) => Number(d.amount) || 0));
  const hasData = maxAmount > 0;

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="w-full h-56 sm:h-60">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 22, right: 16, left: -4, bottom: 6 }}
          >
            <defs>
              <linearGradient id="distributionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#64748b"
              tickLine={false}
              tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }}
              dy={4}
            />
            <YAxis
              stroke="#64748b"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }}
              tickFormatter={(v) => (v === 0 ? "Rp 0" : formatCompactRupiah(v, 0, { short: true }))}
              domain={[0, hasData ? "auto" : 1000000]}
              ticks={hasData ? undefined : [0, 500000, 1000000]}
              width={72}
            />
            <Tooltip
              wrapperStyle={{ zIndex: 10, pointerEvents: "none" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-white border border-slate-200 rounded-md p-3 shadow-md text-sm space-y-1.5">
                      <p className="font-semibold text-slate-900 border-b border-slate-100 pb-1">
                        {item.fullMonth}
                      </p>
                      <div className="flex items-center justify-between gap-4 text-slate-500 font-normal">
                        <span>Penyaluran:</span>
                        <span className="font-medium text-slate-900">
                          {formatRupiah(item.amount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-slate-500 font-normal">
                        <span>Penerima:</span>
                        <span className="font-medium text-slate-900">
                          {formatNumber(item.beneficiaries)} Orang
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#0ea5e9"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#distributionGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm text-slate-600 font-normal text-center pt-1">
        Grafik Tren Nominal Penyaluran Program per Bulan
      </p>
    </div>
  );
}
