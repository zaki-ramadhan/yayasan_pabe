import {
  CampaignDonatePageView,
  buildCampaignDonateMetadata,
} from "@/components/campaign/CampaignDonatePageView";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return buildCampaignDonateMetadata(slug);
}

export default async function ProgramDonasiPage({ params, searchParams }) {
  const { slug } = await params;
  return <CampaignDonatePageView slug={slug} searchParams={searchParams} enforceMode="program" />;
}

