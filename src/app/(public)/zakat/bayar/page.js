import prisma from "@/lib/prisma";
import { BackLink } from "@/components/shared/BackLink";
import { PageHeader } from "@/components/shared/PageHeader";
import { ZakatCheckoutForm } from "@/components/zakat/ZakatCheckoutForm";

export const metadata = {
  title: "Tunaikan Zakat Maal & Fitrah",
  description: "Salurkan kewajiban zakat penghasilan, maal, emas, perdagangan, dan fitrah Anda secara amanah melalui Yayasan Payung Berkah.",
};

export default async function ZakatBayarPage({ searchParams }) {
  const sParams = await searchParams;
  const rawAmount = sParams?.amount ? Number(String(sParams.amount).replace(/\D/g, "")) : 250000;
  const initialAmount = !isNaN(rawAmount) && rawAmount >= 10000 ? rawAmount : 250000;
  const initialType = sParams?.type || "ZAKAT_PENGHASILAN";

  let targetCampaign = null;
  try {
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
  } catch (err) {
    console.warn("ZakatBayarPage: Prisma campaign lookup fallback:", err?.message);
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-4">
      <div className="space-y-4">
        <BackLink
          href="/kalkulator-zakat"
          label="Hitung kewajiban di kalkulator zakat"
        />
        <PageHeader
          title="Formulir pembayaran zakat"
          description="Tunaikan kewajiban zakat secara amanah, transparan, dan tepat sasaran kepada 8 asnaf mustahik."
        />
      </div>

      <ZakatCheckoutForm
        key={`${initialType}-${initialAmount}`}
        initialType={initialType}
        initialAmount={initialAmount}
        targetCampaign={targetCampaign}
      />
    </main>
  );
}

