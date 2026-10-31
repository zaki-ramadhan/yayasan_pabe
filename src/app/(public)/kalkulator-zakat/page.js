import prisma from "@/lib/prisma";
import { InformationHeroHeader } from "@/components/shared/InformationHeroHeader";
import { ZakatCalculator } from "@/components/modules/ZakatCalculator";

export const metadata = {
  title: "Kalkulator Zakat",
  description:
    "Alat bantu perhitungan zakat secara mudah dan akurat. Gunakan kalkulator ini untuk mengetahui kewajiban zakat maal, penghasilan, perusahaan, perdagangan, dan emas sesuai syariat.",
};

export default async function KalkulatorZakatPage() {
  let targetSlug = "zakat-penghasilan-pemberdayaan-mustahik";
  try {
    const activeZakat = await prisma.campaign.findFirst({
      where: {
        status: "ACTIVE",
        OR: [
          { category: { slug: { contains: "zakat", mode: "insensitive" } } },
          { slug: { contains: "zakat", mode: "insensitive" } },
        ],
      },
      select: { slug: true },
    });
    if (activeZakat?.slug) {
      targetSlug = activeZakat.slug;
    }
  } catch (err) {
    console.warn("KalkulatorZakatPage: Prisma lookup fallback:", err?.message);
  }

  return (
    <div className="w-full">
      <InformationHeroHeader
        title="Kalkulator Zakat"
        description="Alat bantu perhitungan zakat secara mudah dan akurat. Gunakan kalkulator ini untuk mengetahui kewajiban zakat maal, penghasilan, perusahaan, perdagangan, dan emas sesuai ketentuan syariat Islam."
        imageAlt="Latar Belakang Kalkulator Zakat Yayasan Payung Berkah"
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        <ZakatCalculator targetCampaignSlug={targetSlug} />
      </main>
    </div>
  );
}
