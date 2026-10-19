import { getFinancialLedgerData } from "@/services/reportService";
import { FinancialLedgerDashboard } from "@/components/reports/FinancialLedgerDashboard";
import { InformationHeroHeader } from "@/components/shared/InformationHeroHeader";

export const metadata = {
  title: "Laporan Akuntabilitas & Keuangan - Yayasan PABE",
  description: "Transparansi penerimaan donasi, penyaluran program mustahik, dan saldo kas Yayasan PABE.",
};

export default async function LaporanPage() {
  const ledgerData = await getFinancialLedgerData();

  return (
    <div className="w-full">
      <InformationHeroHeader
        badge={
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Akuntabilitas Publik
          </span>
        }
        title="Laporan Akuntabilitas & Keuangan"
        description="Transparansi mutasi dana donatur, pembiayaan program mustahik, dan saldo kas riil Yayasan PABE yang dikelola secara profesional dan amanah."
        imageAlt="Latar Belakang Laporan Keuangan Yayasan PABE"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <FinancialLedgerDashboard
          transactions={ledgerData.transactions}
          campaigns={ledgerData.campaigns}
          grandTotals={ledgerData.grandTotals}
          nextDistributionDate={ledgerData.nextDistributionDate}
          financialDetails={ledgerData.financialDetails}
          cashFlowDetails={ledgerData.cashFlowDetails}
          hideHeader
        />
      </main>
    </div>
  );
}
