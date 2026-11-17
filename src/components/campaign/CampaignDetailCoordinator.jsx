"use client";

import { useMemo } from "react";
import { CampaignMedia } from "@/components/campaign/CampaignMedia";
import { CampaignDetailWrapper } from "@/components/campaign/CampaignDetailWrapper";
import { CampaignSidebarDonate } from "@/components/campaign/CampaignSidebarDonate";
import { CampaignStickyMobileBar } from "@/components/campaign/CampaignStickyMobileBar";
import { useCampaignLiveStats } from "@/hooks/useCampaignLiveStats";

/**
 * Client coordinator untuk halaman detail program dan ZIS.
 * Menghubungkan state live metrik donasi ke sub-widget layout tanpa membengkakkan Server Component.
 *
 * @param {object} props
 * @param {object} props.campaign
 * @param {number} props.progress
 * @param {number|null} [props.daysLeft]
 * @param {object} props.donationStats
 * @param {number} props.prayersCount
 * @param {boolean} props.hasDonations
 */
export function CampaignDetailCoordinator({
  campaign,
  progress: initialProgress,
  daysLeft = null,
  donationStats,
  prayersCount,
  hasDonations = false,
}) {
  const { collectedAmount, donorCount, progress } = useCampaignLiveStats({
    slug: campaign.slug,
    initialCollectedAmount: campaign.collectedAmount,
    initialTargetAmount: campaign.targetAmount,
    initialDonorCount: campaign.donorCount,
    initialProgress,
  });

  const liveCampaign = useMemo(
    () => ({
      ...campaign,
      collectedAmount,
      donorCount,
    }),
    [campaign, collectedAmount, donorCount]
  );

  const isLiveHasDonations = hasDonations || donorCount > 0 || collectedAmount > 0;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-8 space-y-4">
          <CampaignMedia bannerUrl={campaign.bannerUrl} title={campaign.title} />
          <CampaignDetailWrapper
            campaign={liveCampaign}
            progress={progress}
            daysLeft={daysLeft}
            donationStats={donationStats}
            prayersCount={prayersCount}
            hasDonations={isLiveHasDonations}
          />
        </div>

        <CampaignSidebarDonate
          campaign={liveCampaign}
          progress={progress}
          daysLeft={daysLeft}
          hasDonations={isLiveHasDonations}
        />
      </div>

      <CampaignStickyMobileBar campaign={liveCampaign} />
    </>
  );
}

