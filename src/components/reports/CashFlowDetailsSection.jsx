"use client";

import { useState, useMemo } from "react";
import { ReportSectionHeader } from "./ReportSectionHeader";
import { YearFilterPills } from "./YearFilterPills";
import { CashFlowTrendAreaChart } from "./CashFlowTrendAreaChart";
import { CashFlowRatioPieChart } from "./CashFlowRatioPieChart";

/**
 * Organism: Section 2 - Rincian Arus Kas.
 * Features year filtering, smooth cash flow area chart, and cash flow ratio pie chart.
 *
 * @param {object} props
 * @param {object} props.data - Aggregated cash flow details from service layer
 */
export function CashFlowDetailsSection({ data }) {
  const [selectedYear, setSelectedYear] = useState("all");

  const availableYears = data?.availableYears || [
    { id: "all", label: "Semua Tahun" },
    { id: "2026", label: "Tahun 2026" },
    { id: "2025", label: "Tahun 2025" },
  ];

  // Filter data bulanan sesuai tahun
  const filteredMonthlyData = useMemo(() => {
    const list = data?.monthlyData || [];
    if (selectedYear === "all") return list;
    return list.filter((item) => item.year === selectedYear);
  }, [data?.monthlyData, selectedYear]);

  // Hitung ulang total Cash In & Cash Out jika tahun tertentu dipilih
  const filteredTotals = useMemo(() => {
    if (selectedYear === "all" && data?.totals) {
      return data.totals;
    }

    let cashIn = 0;
    let cashOut = 0;
    filteredMonthlyData.forEach((row) => {
      cashIn += row.cashIn || 0;
      cashOut += row.cashOut || 0;
    });

    return { cashIn, cashOut };
  }, [data, filteredMonthlyData, selectedYear]);

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <ReportSectionHeader title="Rincian Arus Kas" />

      {/* Year Filter Pill */}
      <div>
        <YearFilterPills
          years={availableYears}
          activeYear={selectedYear}
          onSelectYear={setSelectedYear}
        />
      </div>

      {/* 2 Columns: Area Chart & Ratio Pie Chart (Equal Height, Gap 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        <div className="lg:col-span-8 flex flex-col h-full">
          <CashFlowTrendAreaChart data={filteredMonthlyData} />
        </div>
        <div className="lg:col-span-4 flex flex-col h-full">
          <CashFlowRatioPieChart totals={filteredTotals} />
        </div>
      </div>
    </section>
  );
}
