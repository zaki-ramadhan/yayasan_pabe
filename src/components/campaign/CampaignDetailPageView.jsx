import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { getCampaignBySlug, getCampaignDonationStats } from "@/services/campaignService";
import { calculateProgress, calculateDaysLeft } from "@/lib/formatters";
import { getCampaignDetailHref, isZisCampaign } from "@/lib/zisFilter";
import { CampaignMedia } from "@/components/campaign/CampaignMedia";
import { CampaignDetailWrapper } from "@/components/campaign/CampaignDetailWrapper";
import { CampaignSidebarDonate } from "@/components/campaign/CampaignSidebarDonate";
import { CampaignStickyMobileBar } from "@/components/campaign/CampaignStickyMobileBar";

/**
 * Membangun metadata OpenGraph/Twitter untuk halaman detail program donasi & ZIS.
 * @param {string} slug
 */
export async function buildCampaignDetailMetadata(slug) {
  const campaign = await getCampaignBySlug(slug);
  if (!campaign) return { title: "Program Tidak Ditemukan" };

  const ogImage = campaign.bannerUrl || "/img/branding/logo-ypabe.webp";
  const canonicalUrl = getCampaignDetailHref(campaign);

  return {
    title: campaign.title,
    description: campaign.excerpt,
    openGraph: {
      title: campaign.title,
      description: campaign.excerpt,
      type: "website",
      url: canonicalUrl,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: campaign.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: campaign.title,
      description: campaign.excerpt,
      images: [ogImage],
    },
  };
}

/**
 * Shared view untuk halaman detail program donasi (/program/[slug]) dan ZIS (/zis/[slug]).
 */
export async function CampaignDetailPageView({ slug, enforceMode = null }) {
  const [campaign, donationStats] = await Promise.all([
    getCampaignBySlug(slug),
    getCampaignDonationStats(slug),
  ]);

  if (!campaign) {
    notFound();
  }

  const isZis = isZisCampaign(campaign);
  if (enforceMode === "program" && isZis) {
    const { redirect } = await import("next/navigation");
    redirect(`/zis/${campaign.slug}`);
  }
  if (enforceMode === "zis" && !isZis) {
    const { redirect } = await import("next/navigation");
    redirect(`/program/${campaign.slug}`);
  }

  const progress = calculateProgress(campaign.collectedAmount, campaign.targetAmount);
  const daysLeft = calculateDaysLeft(campaign.endDate);
  const prayersCount = (campaign.recentDonors || []).filter(
    (d) => Boolean(d.prayer && d.prayer.trim())
  ).length;
  const hasDonations =
    campaign.donorCount > 0 ||
    campaign.collectedAmount > 0 ||
    (Array.isArray(campaign.recentDonors) && campaign.recentDonors.length > 0);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 pb-24 lg:pb-12">
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/" },
          isZis
            ? { label: "Program ZIS", href: "/zis" }
            : { label: "Program Donasi", href: "/program" },
          { label: campaign.title },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-8 space-y-4">
          <CampaignMedia bannerUrl={campaign.bannerUrl} title={campaign.title} />
          <CampaignDetailWrapper
            campaign={campaign}
            progress={progress}
            daysLeft={daysLeft}
            donationStats={donationStats}
            prayersCount={prayersCount}
            hasDonations={hasDonations}
          />
        </div>

        <CampaignSidebarDonate
          campaign={campaign}
          progress={progress}
          daysLeft={daysLeft}
          hasDonations={hasDonations}
        />
      </div>

      <CampaignStickyMobileBar campaign={campaign} />
    </main>
  );
}

