"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { SortDropdown } from "@/components/shared/SortDropdown";
import {
  getTopProgramsData,
  getDynamicYearOptions,
  MODE_OPTIONS,
} from "@/lib/topProgramsHelper";
import { TopProgramCardItem } from "./TopProgramCardItem";
import { cn } from "@/lib/utils";

/**
 * Top 5 Program Ranking Card.
 *
 * Adheres strictly to:
 * - Tight and balanced vertical spacing between header and items (no excessive gap/divider)
 * - Clickable program titles with hover primary color and underline
 * - Single nominal value per mode (Penghimpunan vs Penyaluran)
 * - Dynamic year dropdown starting from 2026 onwards
 * - Minimum font size: text-sm (no text-xs)
 * - Maximum font weight: font-semibold for numbers, font-medium for titles/labels
 * - No dot separators or badge clutter
 *
 * @param {object} props
 * @param {Array<object>} props.campaigns - Campaign records
 * @param {Array<object>} props.transactions - Transactions array
 * @param {string} [props.className] - Optional extra classes
 */
export function TopProgramsRankingCard({
  campaigns = [],
  transactions = [],
  className,
}) {
  const [selectedMode, setSelectedMode] = useState("PENGHIMPUNAN"); // "PENGHIMPUNAN" | "PENYALURAN"
  const [selectedYear, setSelectedYear] = useState("ALL");
  const yearOptions = useMemo(() => getDynamicYearOptions(), []);

  const programs = useMemo(() => {
    return getTopProgramsData(campaigns, transactions, selectedYear, selectedMode);
  }, [campaigns, transactions, selectedYear, selectedMode]);

  const maxAmount = programs[0]?.displayAmount || 1;

  return (
    <Card className={cn("rounded-xl border border-slate-200 bg-white shadow-2xs", className)}>
      {/* Card Header with tight bottom padding and no border divider */}
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div className="space-y-0.5">
          <CardTitle className="text-lg sm:text-xl font-semibold text-slate-950 tracking-tight">
            Top 5 Program
          </CardTitle>
          <CardDescription className="text-sm font-normal text-slate-600">
            {selectedMode === "PENYALURAN"
              ? "Peringkat program berdasarkan realisasi dana tersalurkan"
              : "Peringkat program berdasarkan akumulasi donasi diterima"}
          </CardDescription>
        </div>

        {/* Dual Controls: Mode Dropdown & Dynamic Year Dropdown */}
        <div className="flex flex-wrap items-center gap-2.5">
          <SortDropdown
            options={MODE_OPTIONS}
            value={selectedMode}
            onChange={setSelectedMode}
            label="Mode Metrik"
            className="h-9 px-3 text-sm font-normal border-slate-300 text-slate-800"
            align="end"
          />
          <SortDropdown
            options={yearOptions}
            value={selectedYear}
            onChange={setSelectedYear}
            label="Tahun"
            className="h-9 px-3 text-sm font-normal border-slate-300 text-slate-800"
            align="end"
          />
        </div>
      </CardHeader>

      {/* Card Content with tight top padding directly flowing from header */}
      <CardContent className="pt-2 space-y-4 sm:space-y-4.5">
        {programs.length > 0 ? (
          programs.map((program, idx) => (
            <TopProgramCardItem
              key={program.id || idx}
              rank={idx + 1}
              program={program}
              maxAmount={maxAmount}
            />
          ))
        ) : (
          <div className="py-10 text-center text-sm font-normal text-slate-500">
            Tidak ada catatan program pada tahun dan mode yang dipilih.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
