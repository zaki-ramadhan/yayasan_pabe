import { Suspense } from "react";
import { getCampaigns, getCategories } from "@/services/campaignService";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProgramCatalog } from "@/components/modules/ProgramCatalog";
import { CampaignCardSkeleton } from "@/components/shared/CampaignCardSkeleton";

export const metadata = {
  title: "Program Kebaikan",
  description: "Temukan berbagai program kebaikan, beasiswa anak yatim, tanggap bencana, dan zakat produktif Yayasan Payung Berkah.",
  openGraph: {
    title: "Program Kebaikan - Yayasan Payung Berkah",
    description: "Temukan berbagai program kebaikan, beasiswa anak yatim, tanggap bencana, dan zakat produktif Yayasan Payung Berkah.",
    url: "/program",
    type: "website",
    images: [
      {
        url: "/img/branding/logo-ypabe.webp",
        width: 1200,
        height: 630,
        alt: "Program Donasi Yayasan Payung Berkah",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Program Kebaikan - Yayasan Payung Berkah",
    description: "Temukan berbagai program kebaikan dan zakat produktif Yayasan Payung Berkah.",
    images: ["/img/branding/logo-ypabe.webp"],
  },
};

export default async function ProgramPage() {
  const [campaigns, categories] = await Promise.all([
    getCampaigns(),
    getCategories(),
  ]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <PageHeader
        title="Program Kebaikan"
        description="Pilih program kebaikan yang ingin Anda bantu. Seluruh donasi disalurkan secara amanah, tepat sasaran, dan dilaporkan secara berkala kepada donatur."
      />

      {/* Catalog Component with Suspense */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <CampaignCardSkeleton key={n} />
            ))}
          </div>
        }
      >
        <ProgramCatalog initialCampaigns={campaigns} categories={categories} />
      </Suspense>
    </main>
  );
}
