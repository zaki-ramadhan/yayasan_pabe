import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { getCampaignBySlug, getCampaignDonationStats } from "@/services/campaignService";
import { calculateProgress, calculateDaysLeft } from "@/lib/formatters";
import { CampaignMedia } from "@/components/campaign/CampaignMedia";
import { CampaignDetailWrapper } from "@/components/campaign/CampaignDetailWrapper";
import { CampaignSidebarDonate } from "@/components/campaign/CampaignSidebarDonate";
import { CampaignStickyMobileBar } from "@/components/campaign/CampaignStickyMobileBar";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const campaign = await getCampaignBySlug(slug);
  if (!campaign) return { title: "Program Tidak Ditemukan" };

  const ogImage = campaign.bannerUrl || "/img/branding/logo-ypabe.webp";

  return {
    title: campaign.title,
    description: campaign.excerpt,
    openGraph: {
      title: campaign.title,
      description: campaign.excerpt,
      type: "website",
      url: `/campaign/${slug}`,
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

export default async function CampaignDetailPage({ params }) {
  const { slug } = await params;
  const [campaign, donationStats] = await Promise.all([
    getCampaignBySlug(slug),
    getCampaignDonationStats(slug),
  ]);

  if (!campaign) {
    notFound();
  }

  const progress = calculateProgress(campaign.collectedAmount, campaign.targetAmount);
  const daysLeft = calculateDaysLeft(campaign.endDate);
  const prayersCount = (campaign.recentDonors || []).filter(
    (d) => Boolean(d.prayer && d.prayer.trim())
  ).length;
  const hasDonations =
    (campaign.donorCount > 0) ||
    (campaign.collectedAmount > 0) ||
    (Array.isArray(campaign.recentDonors) && campaign.recentDonors.length > 0);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 pb-24 lg:pb-12">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/" },
          { label: "Program", href: "/program" },
          { label: campaign.title },
        ]}
      />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Media, Header, Tabs, CTA */}
        <div className="lg:col-span-8 space-y-4">
          <CampaignMedia bannerUrl={campaign.bannerUrl} title={campaign.title} />
          <CampaignDetailWrapper
            campaign={campaign}
            progress={progress}
            donationStats={donationStats}
            prayersCount={prayersCount}
            hasDonations={hasDonations}
          />
        </div>

        {/* Right Column: Sticky Donation Panel */}
        <CampaignSidebarDonate
          campaign={campaign}
          progress={progress}
          daysLeft={daysLeft}
          hasDonations={hasDonations}
        />
      </div>

      {/* Mobile Fixed Bottom Donation Bar */}
      <CampaignStickyMobileBar campaign={campaign} />
    </main>
  );
}
