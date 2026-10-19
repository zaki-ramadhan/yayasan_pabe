"use client";

import { useState, useMemo } from "react";
import { ReportSectionHeader } from "./ReportSectionHeader";
import { YearFilterPills } from "./YearFilterPills";
import { FinancialCategoryBarChart } from "./FinancialCategoryBarChart";
import { FinancialIncomeDonutChart } from "./FinancialIncomeDonutChart";

/**
 * Organism: Section 1 - Rincian Laporan Keuangan.
 * Features year filtering, multi-category monthly bar chart, and overall distribution donut chart.
 *
 * @param {object} props
 * @param {object} props.data - Aggregated financial details from service layer
 */
export function FinancialDetailsSection({ data }) {
  const [selectedYear, setSelectedYear] = useState("all");

  const availableYears = data?.availableYears || [
    { id: "all", label: "Semua Tahun" },
    { id: "2026", label: "Tahun 2026" },
    { id: "2025", label: "Tahun 2025" },
  ];

  // Filter bulanan sesuai tahun aktif
  const filteredMonthlyData = useMemo(() => {
    const list = data?.monthlyData || [];
    if (selectedYear === "all") return list;
    return list.filter((item) => item.year === selectedYear);
  }, [data?.monthlyData, selectedYear]);

  // Hitung ulang distribusi kategori jika tahun tertentu dipilih
  const filteredDistribution = useMemo(() => {
    if (selectedYear === "all" && data?.categoryDistribution) {
      return data.categoryDistribution;
    }

    const categories = data?.categories || [];
    const catSums = {};
    filteredMonthlyData.forEach((row) => {
      categories.forEach((cat) => {
        catSums[cat.name] = (catSums[cat.name] || 0) + (row[cat.name] || 0);
      });
    });

    const totalSum = Object.values(catSums).reduce((a, b) => a + b, 0);

    return categories
      .map((cat) => {
        const val = catSums[cat.name] || 0;
        return {
          name: cat.name,
          value: val,
          percentage: totalSum > 0 ? Math.round((val / totalSum) * 100) : 0,
          color: cat.color,
        };
      })
      .filter((c) => c.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [data, filteredMonthlyData, selectedYear]);

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <ReportSectionHeader title="Rincian Laporan Keuangan" />

      {/* Year Filter Pill */}
      <div>
        <YearFilterPills
          years={availableYears}
          activeYear={selectedYear}
          onSelectYear={setSelectedYear}
        />
      </div>

      {/* 2 Columns: Bar Chart & Donut Chart (Equal Height, Gap 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        <div className="lg:col-span-8 flex flex-col h-full">
          <FinancialCategoryBarChart
            data={filteredMonthlyData}
            categories={data?.categories}
          />
        </div>
        <div className="lg:col-span-4 flex flex-col h-full">
          <FinancialIncomeDonutChart data={filteredDistribution} />
        </div>
      </div>
    </section>
  );
}
