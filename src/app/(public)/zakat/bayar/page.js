import prisma from "@/lib/prisma";
import { BackLink } from "@/components/shared/BackLink";
import { PageHeader } from "@/components/shared/PageHeader";
import { ZakatCheckoutForm } from "@/components/zakat/ZakatCheckoutForm";
import { resolveZakatCheckoutFlow } from "@/lib/zakat/calculations";
import { getCampaignDetailHref } from "@/lib/zisFilter";

export const metadata = {
  title: "Tunaikan Zakat Maal & Fitrah",
  description: "Salurkan kewajiban zakat penghasilan, maal, emas, perdagangan, dan fitrah Anda secara amanah melalui Yayasan Payung Berkah.",
};

export default async function ZakatBayarPage({ searchParams }) {
  const sParams = (await searchParams) || {};
  const {
    isFromCalculator,
    initialAmount,
    initialType,
    campaignSlug,
  } = resolveZakatCheckoutFlow(sParams);

  let targetCampaign = null;
  try {
    if (campaignSlug) {
      targetCampaign = await prisma.campaign.findUnique({
        where: { slug: campaignSlug },
        select: { id: true, title: true, slug: true },
      });
    }

    if (!targetCampaign) {
      targetCampaign = await prisma.campaign.findFirst({
        where: {
          status: "ACTIVE",
          OR: [
            { category: { slug: { contains: "zakat", mode: "insensitive" } } },
            { slug: { contains: "zakat", mode: "insensitive" } },
          ],
        },
        select: { id: true, title: true, slug: true },
      });
    }
  } catch (err) {
    console.warn("ZakatBayarPage: Prisma campaign lookup fallback:", err?.message);
  }

  const backHref = isFromCalculator
    ? "/kalkulator-zakat"
    : targetCampaign?.slug
    ? getCampaignDetailHref({ slug: targetCampaign.slug, categorySlug: "zakat" })
    : "/zis";

  const backLabel = isFromCalculator
    ? "Hitung kewajiban di kalkulator zakat"
    : "Kembali ke detail program";

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-4">
      <div className="space-y-4">
        <BackLink href={backHref} label={backLabel} />
        <PageHeader
          title="Formulir pembayaran zakat"
          description="Tunaikan kewajiban zakat secara amanah, transparan, dan tepat sasaran kepada 8 asnaf mustahik."
        />
      </div>

      <ZakatCheckoutForm
        key={`${initialType}-${initialAmount}-${isFromCalculator ? "calc" : "zis"}`}
        initialType={initialType}
        initialAmount={initialAmount}
        targetCampaign={targetCampaign}
        isFromCalculator={isFromCalculator}
      />
    </main>
  );
}
