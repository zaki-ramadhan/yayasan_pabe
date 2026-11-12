import { notFound, redirect } from "next/navigation";
import { getCampaignBySlug } from "@/services/campaignService";
import { getCampaignDonateHref } from "@/lib/zisFilter";

export default async function LegacyCampaignDonateRedirect({ params, searchParams }) {
  const { slug } = await params;
  const sParams = (await searchParams) || {};
  const campaign = await getCampaignBySlug(slug);

  if (!campaign) {
    notFound();
  }

  const qp = new URLSearchParams();
  for (const [key, val] of Object.entries(sParams)) {
    if (typeof val === "string" && val.length > 0) {
      qp.set(key, val);
    }
  }
  const qs = qp.toString();
  redirect(`${getCampaignDonateHref(campaign)}${qs ? `?${qs}` : ""}`);
}
