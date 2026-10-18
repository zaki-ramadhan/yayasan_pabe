import { DistributionHeader } from "@/components/distribution/DistributionHeader";
import { DistributionAuditSection } from "@/components/distribution/DistributionAuditSection";
import { DistributionTrendSection } from "@/components/distribution/DistributionTrendSection";
import { DistributionSyariahSection } from "@/components/distribution/DistributionSyariahSection";
import {
  getDistributionAuditData,
  getDistributionTrendData,
  getDistributionSyariahData,
} from "@/services/distributionService";

export const metadata = {
  title: "Distribusi - Yayasan PABE",
  description:
    "Laporan keuangan audit independen, grafik distribusi penyaluran berkala, dan kepatuhan syariah Yayasan PABE.",
};

export default async function DistribusiPage() {
  const [auditData, trendData, syariahData] = await Promise.all([
    getDistributionAuditData(),
    getDistributionTrendData(),
    getDistributionSyariahData(),
  ]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 lg:space-y-10">
      {/* Top Header - Sesuai gaya Laporan Keuangan (Align Tengah) */}
      <DistributionHeader
        title="Distribusi"
        description="Transparansi audit keuangan independen, dinamika rekam jejak penyaluran bantuan berkala, serta kepatuhan fatwa Dewan Pengawas Syariah demi menjaga amanah umat secara profesional dan akuntabel."
      />

      {/* Grid 2 Kolom: Baris 1 = 2 Laporan Chart, Baris 2 = 1 Laporan Chart Center X */}
      <div className="space-y-8 lg:space-y-10">
        {/* Row 1: Section 1 & Section 2 Berdampingan (2 Kolom) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pb-8 sm:pb-10 border-b border-slate-200">
          <DistributionAuditSection auditData={auditData} />
          <DistributionTrendSection trendData={trendData} />
        </div>

        {/* Row 2: Section 3 Berada di Tengah Sumbu X */}
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <DistributionSyariahSection syariahData={syariahData} />
          </div>
        </div>
      </div>
    </main>
  );
}
