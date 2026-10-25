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
import { getBeneficiaryStats, getAllBeneficiaries } from "@/services/beneficiaryService";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Laporan Distribusi Penyaluran",
  description:
    "Laporan keuangan audit independen, grafik distribusi penyaluran berkala, transparansi penerima manfaat, dan kepatuhan syariah Yayasan Payung Berkah.",
  openGraph: {
    title: "Laporan Distribusi Penyaluran - Yayasan Payung Berkah",
    description:
      "Laporan audit, grafik tren penyaluran, dan transparansi 132 penerima manfaat binaan resmi Yayasan Payung Berkah.",
    url: "/distribusi",
    type: "website",
    images: [
      {
        url: "/img/logo/logo_ypabe.jpeg",
        width: 1200,
        height: 630,
        alt: "Laporan Penyaluran Yayasan Payung Berkah",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Laporan Distribusi Penyaluran - Yayasan Payung Berkah",
    description: "Transparansi audit dan penyaluran amanah donasi dan zakat.",
    images: ["/img/logo/logo_ypabe.jpeg"],
  },
};

export default async function DistribusiPage() {
  const [auditData, trendData, syariahData, beneficiaryStats, beneficiaries] = await Promise.all([
    getDistributionAuditData(),
    getDistributionTrendData(),
    getDistributionSyariahData(),
    getBeneficiaryStats(),
    getAllBeneficiaries(),
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

        {/* Kepatuhan Syariah & Dewan Pengawas (Chart Terakhir) */}
        <div className="flex justify-center pb-8 sm:pb-10 border-b border-slate-200">
          <div className="w-full max-w-2xl">
            <DistributionSyariahSection syariahData={syariahData} />
          </div>
        </div>

        {/* Daftar Transparansi Penerima Manfaat Binaan (Setelah Seluruh Chart) */}
        <BeneficiaryDirectory
          initialBeneficiaries={beneficiaries}
          stats={beneficiaryStats}
        />
      </main>
    </div>
  );
}
