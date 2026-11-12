import {
  CampaignDonatePageView,
  buildCampaignDonateMetadata,
} from "@/components/campaign/CampaignDonatePageView";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return buildCampaignDonateMetadata(slug);
}

export default async function ZisDonasiPage({ params, searchParams }) {
  const { slug } = await params;
  return <CampaignDonatePageView slug={slug} searchParams={searchParams} enforceMode="zis" />;
}

