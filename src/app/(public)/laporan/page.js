import { getFinancialLedgerData } from "@/services/reportService";
import { FinancialLedgerDashboard } from "@/components/reports/FinancialLedgerDashboard";

export const metadata = {
  title: "Laporan Keuangan & Arus Kas Donasi",
  description: "Transparansi penerimaan donasi, penyaluran program mustahik, dan saldo kas Yayasan PABE.",
};

export default async function LaporanPage() {
  const ledgerData = await getFinancialLedgerData();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <FinancialLedgerDashboard
        transactions={ledgerData.transactions}
        campaigns={ledgerData.campaigns}
        grandTotals={ledgerData.grandTotals}
        nextDistributionDate={ledgerData.nextDistributionDate}
        financialDetails={ledgerData.financialDetails}
        cashFlowDetails={ledgerData.cashFlowDetails}
      />
    </main>
  );
}
