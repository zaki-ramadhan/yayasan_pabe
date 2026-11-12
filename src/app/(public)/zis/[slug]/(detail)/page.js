import {
  CampaignDetailPageView,
  buildCampaignDetailMetadata,
} from "@/components/campaign/CampaignDetailPageView";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return buildCampaignDetailMetadata(slug);
}

export default async function ZisDetailPage({ params }) {
  const { slug } = await params;
  return <CampaignDetailPageView slug={slug} enforceMode="zis" />;
}

