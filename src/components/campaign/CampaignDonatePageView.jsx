import { notFound, redirect } from "next/navigation";
import { getCampaignBySlug } from "@/services/campaignService";
import { isCampaignClosed } from "@/lib/formatters";
import { sanitizePrayer } from "@/lib/security";
import { FIELD_LIMITS } from "@/constants/fieldValidationLimits";
import { getCampaignDetailHref, isZisCampaign } from "@/lib/zisFilter";
import { BackLink } from "@/components/shared/BackLink";
import { PageHeader } from "@/components/shared/PageHeader";
import { CampaignClosedNotice } from "@/components/campaign/CampaignClosedNotice";
import { DonationCheckoutForm } from "@/components/modules/DonationCheckoutForm";

/**
 * Membangun metadata SEO untuk halaman checkout donasi program / ZIS.
 * @param {string} slug
 */
export async function buildCampaignDonateMetadata(slug) {
  const campaign = await getCampaignBySlug(slug);
  if (!campaign) return { title: "Program Tidak Ditemukan" };

  const isZakat =
    campaign.slug === "zakat" ||
    campaign.categoryId === "zakat" ||
    campaign.categorySlug === "zakat" ||
    campaign.category?.slug === "zakat";

  return {
    title: isZakat ? `Tunaikan Zakat: ${campaign.title}` : `Donasi: ${campaign.title}`,
    description: isZakat
      ? `Tunaikan zakat Anda untuk ${campaign.title} melalui Yayasan Payung Berkah. Bersihkan harta, hadirkan manfaat.`
      : `Salurkan donasi Anda untuk ${campaign.title} melalui Yayasan Payung Berkah. Hidup Berkah dengan Sedekah.`,
  };
}

function buildSearchQueryString(sParams) {
  if (!sParams || typeof sParams !== "object") return "";
  const qp = new URLSearchParams();
  for (const [key, val] of Object.entries(sParams)) {
    if (typeof val === "string" && val.length > 0) {
      qp.set(key, val);
    }
  }
  const qs = qp.toString();
  return qs ? `?${qs}` : "";
}

/**
 * Shared view untuk halaman checkout donasi (/program/[slug]/donasi dan /zis/[slug]/donasi).
 */
export async function CampaignDonatePageView({ slug, searchParams, enforceMode = null }) {
  const sParams = (await searchParams) || {};
  const campaign = await getCampaignBySlug(slug);

  if (!campaign) {
    notFound();
  }

  const isZis = isZisCampaign(campaign);
  const qs = buildSearchQueryString(sParams);

  if (enforceMode === "program" && isZis) {
    redirect(`/zis/${campaign.slug}/donasi${qs}`);
  }
  if (enforceMode === "zis" && !isZis) {
    redirect(`/program/${campaign.slug}/donasi${qs}`);
  }

  const isClosed = isCampaignClosed(campaign);
  if (isClosed) {
    return <CampaignClosedNotice campaign={campaign} />;
  }

  const rawQuery = sParams?.amount || sParams?.total;
  const sanitized = typeof rawQuery === "string" ? rawQuery.replace(/\D/g, "") : rawQuery;
  const rawAmount = sanitized ? Number(sanitized) : null;
  const initialAmount = rawAmount && !isNaN(rawAmount) && rawAmount > 0 ? rawAmount : 50000;

  const rawPrayer = sParams?.prayer;
  const initialPrayer =
    typeof rawPrayer === "string"
      ? sanitizePrayer(rawPrayer.trim()).slice(0, FIELD_LIMITS.PRAYER.max)
      : "";

  const isZakat =
    campaign.slug === "zakat" ||
    campaign.categoryId === "zakat" ||
    campaign.categorySlug === "zakat" ||
    campaign.category?.slug === "zakat" ||
    sParams?.type === "ZAKAT";

  if (isZakat) {
    const qParams = new URLSearchParams();
    if (initialAmount) qParams.set("amount", String(initialAmount));
    if (sParams?.type && sParams.type !== "ZAKAT") qParams.set("type", sParams.type);
    const zakatQs = qParams.toString();
    redirect(`/zakat/bayar${zakatQs ? `?${zakatQs}` : ""}`);
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-4">
      <div className="space-y-4">
        <BackLink
          href={getCampaignDetailHref(campaign)}
          label="Kembali ke detail program"
        />
        <PageHeader
          title="Formulir donasi kebaikan"
          description={
            <>
              Menyalurkan bantuan untuk:{" "}
              <strong className="text-slate-900 font-semibold">{campaign.title}</strong>
            </>
          }
        />
      </div>

      <DonationCheckoutForm
        key={`${campaign.slug}-${initialAmount}-${initialPrayer || ""}`}
        campaign={campaign}
        initialAmount={initialAmount}
        initialPrayer={initialPrayer}
      />
    </main>
  );
}

