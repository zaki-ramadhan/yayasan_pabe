"use client";

import { useState, useMemo } from "react";
import { formatRupiah } from "@/lib/formatters";
import { SortDropdown } from "@/components/shared/SortDropdown";
import {
  getTopProgramsData,
  getDynamicYearOptions,
  MODE_OPTIONS,
} from "./topProgramsData";
import { TopProgramCardItem } from "./TopProgramCardItem";
import { cn } from "@/lib/utils";

/**
 * MetricCell:
 * Komponen bilah metrik vertikal.
 * Ukuran teks label (atas) dan subtext (bawah) disamakan persis dengan teks kategori program (text-sm font-normal text-slate-500).
 * Ukuran angka nominal/tanggal disamakan dengan sub-heading Top 5 Program (text-base sm:text-lg font-semibold text-slate-950).
 */
function MetricCell({ label, value, subtext, className = "" }) {
  return (
    <div className={cn("py-3 sm:py-3.5 space-y-0.5", className)}>
      <span className="text-sm font-normal text-slate-500 block leading-snug">
        {label}
      </span>
      <p className="text-base sm:text-lg font-semibold text-slate-950 tracking-tight">
        {value}
      </p>
      {subtext && (
        <p className="text-sm font-normal text-slate-500 leading-snug">
          {subtext}
        </p>
      )}
    </div>
  );
}

/**
 * UnifiedFinancialOverview:
 * Menggabungkan metrik Grand Total Kas dan Top 5 Program dalam satu naungan section,
 * tanpa border luar rounded yang membungkus.
 * Murni hanya menyisakan garis pemisah (divide-y) antar-item atas ke bawah.
 */
export function UnifiedFinancialOverview({
  grandTotals = {},
  nextDistributionDate = "Belum Terjadwal",
  campaigns = [],
  transactions = [],
  className,
}) {
  const [selectedMode, setSelectedMode] = useState("PENGHIMPUNAN");
  const [selectedYear, setSelectedYear] = useState("ALL");

  const yearOptions = useMemo(() => getDynamicYearOptions(), []);

  const programs = useMemo(() => {
    return getTopProgramsData(campaigns, transactions, selectedYear, selectedMode);
  }, [campaigns, transactions, selectedYear, selectedMode]);

  const maxAmount = programs[0]?.displayAmount || 1;

  const totalIncome = grandTotals.totalIncome || 0;
  const totalExpenses = grandTotals.totalExpenses || 0;
  const netBalance = grandTotals.netBalance || 0;

  return (
    <div className={cn("bg-transparent", className)}>
      <div className="flex flex-col lg:flex-row items-stretch gap-6 lg:gap-8">
        {/* Bilah Samping Ramping: Tanpa border luar, murni garis pemisah antar-item atas ke bawah (divide-y) */}
        <div className="w-full lg:w-64 xl:w-72 shrink-0 divide-y divide-slate-200 flex flex-col justify-between">
          <MetricCell
            label="Total Penghimpunan"
            value={formatRupiah(totalIncome)}
            subtext="Total donasi diterima"
          />
          <MetricCell
            label="Total Penyaluran"
            value={formatRupiah(totalExpenses)}
            subtext="Dana tersalurkan ke program"
          />
          <MetricCell
            label="Saldo Kas Terkini"
            value={formatRupiah(netBalance)}
            subtext="Sisa kas siap salur"
          />
          <MetricCell
            label="Penyaluran Mendatang"
            value={nextDistributionDate}
            subtext="Jadwal distribusi terdekat"
          />
        </div>

        {/* Sisi Kanan: Wrapper Konten Top 5 Program (tetap ada border, rounded, dan bg white) */}
        <div className="flex-1 min-w-0 bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
            <div className="space-y-0.5">
              <h3 className="text-base sm:text-lg font-semibold text-slate-950 tracking-tight">
                Top 5 Program Prioritas
              </h3>
              <p className="text-sm font-normal text-slate-500">
                {selectedMode === "PENYALURAN"
                  ? "Peringkat realisasi dana tersalurkan"
                  : "Peringkat akumulasi donasi diterima"}
              </p>
            </div>

            {/* Filter Controls: Mode & Tahun */}
            <div className="flex items-center gap-2">
              <SortDropdown
                options={MODE_OPTIONS}
                value={selectedMode}
                onChange={setSelectedMode}
                label="Metrik"
                className="h-8.5 px-2.5 text-xs sm:text-sm font-normal border-slate-300 text-slate-800"
                align="end"
              />
              <SortDropdown
                options={yearOptions}
                value={selectedYear}
                onChange={setSelectedYear}
                label="Tahun"
                className="h-8.5 px-2.5 text-xs sm:text-sm font-normal border-slate-300 text-slate-800"
                align="end"
              />
            </div>
          </div>

          <div className="space-y-4 pt-1">
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
          </div>
        </div>
      </div>
    </div>
  );
}
