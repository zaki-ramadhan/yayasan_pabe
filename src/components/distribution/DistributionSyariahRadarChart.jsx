"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

/**
 * Molecule component: Radar Chart for Sharia Compliance & Governance
 * Clean monochromatic palette without neon colors or visual gimmicks.
 * @param {object} props
 * @param {Array} props.metrics
 */
export function DistributionSyariahRadarChart({ metrics = [] }) {
  if (!metrics || metrics.length === 0) return null;

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="w-full h-52 sm:h-56">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={metrics}>
            <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: "#475569", fontSize: 13, fontWeight: 500 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: "#64748b", fontSize: 12 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white border border-slate-200 rounded-md p-3 shadow-md text-sm space-y-1">
                      <p className="font-semibold text-slate-900">{data.dimension}</p>
                      <p className="text-slate-500 font-normal">
                        Skor: <span className="font-medium text-slate-900">{data.score}</span> / {data.fullMark}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Radar
              name="Kepatuhan Syariah"
              dataKey="score"
              stroke="#0ea5e9"
              fill="#0ea5e9"
              fillOpacity={0.25}
              strokeWidth={2}
              dot={{ fill: "#0ea5e9", r: 3.5, stroke: "#ffffff", strokeWidth: 1.5 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm text-slate-600 font-normal text-center pt-1">
        Grafik Radar Standar Kepatuhan Syariah Lembaga (Skala 0–100%)
      </p>
    </div>
  );
}
