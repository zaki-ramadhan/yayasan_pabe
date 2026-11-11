import { Suspense } from "react";
import { getZisCampaigns } from "@/services/campaignService";
import { PageHeader } from "@/components/shared/PageHeader";
import { ZisCatalog } from "@/components/modules/ZisCatalog";
import { CampaignCardSkeleton } from "@/components/shared/CampaignCardSkeleton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Program ZIS",
  description:
    "Penyaluran dana zakat, infak, dan sedekah terpercaya dan tepat sasaran kepada mustahik 8 asnaf binaan Yayasan Payung Berkah.",
  openGraph: {
    title: "Program ZIS - Yayasan Payung Berkah",
    description:
      "Penyaluran dana zakat, infak, dan sedekah terpercaya dan tepat sasaran kepada mustahik 8 asnaf binaan Yayasan Payung Berkah.",
    url: "/zis",
    type: "website",
    images: [
      {
        url: "/img/branding/logo-ypabe.webp",
        width: 1200,
        height: 630,
        alt: "Program ZIS Yayasan Payung Berkah",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Program ZIS - Yayasan Payung Berkah",
    description:
      "Penghimpunan dan penyaluran dana zakat, infak, dan sedekah terpercaya bagi 8 asnaf mustahik binaan Yayasan Payung Berkah.",
    images: ["/img/branding/logo-ypabe.webp"],
  },
};

export default async function ZisPage() {
  const campaigns = await getZisCampaigns();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <PageHeader
        title="Program ZIS (Zakat, Infaq, Sedekah)"
        description="Pilih pos penyaluran zakat, infak, dan sedekah yang ingin Anda tunaikan. Seluruh dana dikelola secara amanah dan disalurkan tepat sasaran kepada mustahik 8 asnaf binaan yayasan."
      />

      {/* ZIS Catalog Component with Suspense Fallback */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <CampaignCardSkeleton key={n} />
            ))}
          </div>
        }
      >
        <ZisCatalog initialCampaigns={campaigns} />
      </Suspense>
    </main>
  );
}

