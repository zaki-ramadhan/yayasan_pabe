import { notFound } from "next/navigation";
import { getCampaignBySlug } from "@/services/campaignService";
import { isCampaignClosed } from "@/lib/formatters";
import { sanitizePrayer } from "@/lib/security";
import { FIELD_LIMITS } from "@/constants/fieldValidationLimits";
import { BackLink } from "@/components/shared/BackLink";
import { PageHeader } from "@/components/shared/PageHeader";
import { CampaignClosedNotice } from "@/components/campaign/CampaignClosedNotice";
import { DonationCheckoutForm } from "@/components/modules/DonationCheckoutForm";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const campaign = await getCampaignBySlug(slug);
  if (!campaign) return { title: "Program Tidak Ditemukan" };
  return {
    title: `Donasi: ${campaign.title}`,
    description: `Salurkan donasi Anda untuk ${campaign.title} melalui Yayasan Payung Berkah. Hidup Berkah dengan Sedekah.`,
  };
}

export default async function DonatePage({ params, searchParams }) {
  const { slug } = await params;
  const sParams = await searchParams;
  const campaign = await getCampaignBySlug(slug);

  if (!campaign) {
    notFound();
  }

  const isClosed = isCampaignClosed(campaign);
  if (isClosed) {
    return <CampaignClosedNotice campaign={campaign} />;
  }

  const rawQuery = sParams?.amount;
  const sanitized = typeof rawQuery === "string" ? rawQuery.replace(/\D/g, "") : rawQuery;
  const rawAmount = sanitized ? Number(sanitized) : null;
  const initialAmount = rawAmount && !isNaN(rawAmount) && rawAmount > 0 ? rawAmount : 50000;

  const rawPrayer = sParams?.prayer;
  const initialPrayer = typeof rawPrayer === "string"
    ? sanitizePrayer(rawPrayer.trim()).slice(0, FIELD_LIMITS.PRAYER.max)
    : "";

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-4">
      {/* Back button & Title */}
      <div className="space-y-4">
        <BackLink
          href={`/campaign/${campaign.slug}`}
          label="Kembali ke detail program"
        />
        <PageHeader
          title="Formulir donasi kebaikan"
          description={
            <>
              Menyalurkan bantuan untuk: <strong className="text-slate-900 font-semibold">{campaign.title}</strong>
            </>
          }
        />
      </div>

      {/* Checkout Form */}
      <DonationCheckoutForm
        key={`${campaign.slug}-${initialAmount}-${initialPrayer || ""}`}
        campaign={campaign}
        initialAmount={initialAmount}
        initialPrayer={initialPrayer}
      />
    </main>
  );
}
