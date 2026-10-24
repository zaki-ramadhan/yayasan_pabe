import { DistributionHeader } from "@/components/distribution/DistributionHeader";
import { DistributionAuditSection } from "@/components/distribution/DistributionAuditSection";
import { DistributionTrendSection } from "@/components/distribution/DistributionTrendSection";
import { DistributionSyariahSection } from "@/components/distribution/DistributionSyariahSection";
import { BeneficiaryDirectory } from "@/components/beneficiaries/BeneficiaryDirectory";
import {
  getDistributionAuditData,
  getDistributionTrendData,
  getDistributionSyariahData,
} from "@/services/distributionService";
import { getBeneficiaryStats } from "@/services/beneficiaryService";
import { ALL_BENEFICIARIES } from "@/data/beneficiaries";

export const metadata = {
  title: "Laporan Distribusi Penyaluran",
  description:
    "Laporan keuangan audit independen, grafik distribusi penyaluran berkala, transparansi penerima manfaat, dan kepatuhan syariah Yayasan Payung Berkah.",
};

export default async function DistribusiPage() {
  const [auditData, trendData, syariahData, beneficiaryStats] = await Promise.all([
    getDistributionAuditData(),
    getDistributionTrendData(),
    getDistributionSyariahData(),
    getBeneficiaryStats(),
  ]);

  return (
    <div className="w-full">
      <DistributionHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 lg:space-y-12">
        {/* Grid 2 Kolom: Baris 1 = 2 Laporan Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pb-8 sm:pb-10 border-b border-slate-200">
          <DistributionAuditSection auditData={auditData} />
          <DistributionTrendSection trendData={trendData} />
        </div>

        {/* Direktori Transparansi Penerima Manfaat Binaan (98 Yatim & 34 Lansia) */}
        <BeneficiaryDirectory
          initialBeneficiaries={ALL_BENEFICIARIES}
          stats={beneficiaryStats}
        />

        {/* Kepatuhan Syariah & Dewan Pengawas */}
        <div className="flex justify-center pt-2">
          <div className="w-full max-w-2xl">
            <DistributionSyariahSection syariahData={syariahData} />
          </div>
        </div>
      </main>
    </div>
  );
}
