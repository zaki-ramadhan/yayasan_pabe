import { DistributionHeader } from "@/components/distribution/DistributionHeader";
import { DistributionAuditSection } from "@/components/distribution/DistributionAuditSection";
import { DistributionTrendSection } from "@/components/distribution/DistributionTrendSection";
import { BeneficiaryDirectory } from "@/components/beneficiaries/BeneficiaryDirectory";
import {
  getDistributionAuditData,
  getDistributionTrendData,
} from "@/services/distributionService";
import { getBeneficiaryStats, getAllBeneficiaries } from "@/services/beneficiaryService";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Laporan Distribusi Penyaluran",
  description:
    "Laporan pertanggungjawaban penyaluran dana, grafik distribusi berkala, dan transparansi penerima manfaat Yayasan Payung Berkah.",
  openGraph: {
    title: "Laporan Distribusi Penyaluran - Yayasan Payung Berkah",
    description:
      "Laporan pertanggungjawaban penyaluran, grafik tren distribusi, dan transparansi 132 penerima manfaat binaan resmi Yayasan Payung Berkah.",
    url: "/distribusi",
    type: "website",
    images: [
      {
        url: "/img/branding/logo-ypabe.webp",
        width: 1200,
        height: 630,
        alt: "Laporan Penyaluran Yayasan Payung Berkah",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Laporan Distribusi Penyaluran - Yayasan Payung Berkah",
    description: "Transparansi dan penyaluran amanah donasi dan zakat.",
    images: ["/img/branding/logo-ypabe.webp"],
  },
};

export default async function DistribusiPage() {
  const [auditData, trendData, beneficiaryStats, beneficiaries] = await Promise.all([
    getDistributionAuditData(),
    getDistributionTrendData(),
    getBeneficiaryStats(),
    getAllBeneficiaries(),
  ]);

  return (
    <div className="w-full">
      <DistributionHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 lg:space-y-12">
        {/* Grid 2 Kolom: Laporan Chart Audit & Tren Penyaluran */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pb-8 sm:pb-10 border-b border-slate-200">
          <DistributionAuditSection auditData={auditData} />
          <DistributionTrendSection trendData={trendData} />
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
