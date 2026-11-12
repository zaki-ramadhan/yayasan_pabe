import { notFound, redirect } from "next/navigation";
import { getCampaignBySlug } from "@/services/campaignService";
import { getCampaignDetailHref } from "@/lib/zisFilter";

export const dynamic = "force-dynamic";

export default async function LegacyCampaignDetailRedirect({ params }) {
  const { slug } = await params;
  const campaign = await getCampaignBySlug(slug);

  if (!campaign) {
    notFound();
  }

  redirect(getCampaignDetailHref(campaign));
}
