"use client";

import { ReportSectionHeader } from "./ReportSectionHeader";
import { UnifiedFinancialOverview } from "./UnifiedFinancialOverview";
import { FinancialDetailsSection } from "./FinancialDetailsSection";
import { CashFlowDetailsSection } from "./CashFlowDetailsSection";

/**
 * Public Financial Transparency Dashboard.
 * Replaces old static table with modern analytical overview based on reference.
 *
 * Constraints applied:
 * - Font weight: semibold for numbers/dates, medium/normal for labels
 * - Min text size: text-sm (no text-xs)
 * - Proportional rounded-lg/xl/md (no rounded-full)
 * - No dot separators or badge clutter
 */
export function FinancialLedgerDashboard({
  transactions = [],
  campaigns = [],
  grandTotals = {
    totalIncome: 12500000000,
    totalExpenses: 11000000000,
    netBalance: 1500000000,
  },
  nextDistributionDate = "25 Sep 2026",
  financialDetails,
  cashFlowDetails,
  hideHeader = false,
}) {
  return (
    <div className="space-y-10">
      {/* Top Header */}
      {!hideHeader && (
        <div className="space-y-1.5 border-b border-slate-200 pb-5">
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-950 tracking-tight">
            Dashboard Transparansi Keuangan
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-normal">
            Ringkasan laporan keseluruhan donasi masuk, penyaluran program amanah, dan saldo kas yayasan.
          </p>
        </div>
      )}

      {/* Section 1: Ikhtisar Keuangan & Realisasi Program (Unified Parent Container) */}
      <section className="space-y-4">
        <ReportSectionHeader title="Ikhtisar Transparansi Keuangan &amp; Program" />

        <UnifiedFinancialOverview
          grandTotals={grandTotals}
          nextDistributionDate={nextDistributionDate}
          campaigns={campaigns}
          transactions={transactions}
        />
      </section>

      {/* Section 2: Rincian Laporan Keuangan */}
      <FinancialDetailsSection data={financialDetails} />

      {/* Section 3: Rincian Arus Kas */}
      <CashFlowDetailsSection data={cashFlowDetails} />
    </div>
  );
}
