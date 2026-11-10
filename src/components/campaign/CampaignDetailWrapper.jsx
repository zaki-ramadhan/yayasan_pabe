"use client";

import { useState } from "react";
import { CampaignHeader } from "./CampaignHeader";
import { CampaignDetailTabs } from "./CampaignDetailTabs";
import { CampaignCTA } from "./CampaignCTA";
import { CampaignPrayersSidebar } from "@/components/modules/CampaignPrayersSidebar";
import { isCampaignClosed } from "@/lib/formatters";
import { useCampaignDetailTour } from "@/hooks/useCampaignDetailTour";

/**
 * Client wrapper for campaign detail left column.
 * Manages controlled tab state and tour auto-start lifecycle.
 *
 * @param {object} props
 * @param {object} props.campaign
 * @param {number} props.progress
 * @param {number|null} [props.daysLeft]
 * @param {object} props.donationStats
 * @param {number} props.prayersCount
 * @param {boolean} props.hasDonations
 */
export function CampaignDetailWrapper({
  campaign,
  progress,
  daysLeft = null,
  donationStats,
  prayersCount,
  hasDonations,
}) {
  const [activeTab, setActiveTab] = useState("detail");

  // Auto-start tour on first visit (global key). Manual trigger is in SidebarTourButton.
  useCampaignDetailTour({ slug: campaign.slug, hasDonations });

  const isClosed = isCampaignClosed(campaign);

  return (
    <div className="lg:col-span-8 space-y-4">
      <div id="tour-campaign-header">
        <CampaignHeader campaign={campaign} progress={progress} daysLeft={daysLeft} />
      </div>

      <CampaignDetailTabs
        campaign={campaign}
        donationStats={donationStats}
        prayersCount={prayersCount}
        hasDonations={hasDonations}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <CampaignCTA campaign={campaign} />

      {/* Forum Chat Doa & Dukungan di Mobile */}
      <div className="block lg:hidden pt-2 space-y-4">
        <CampaignPrayersSidebar
          initialDonors={campaign.recentDonors || []}
          campaignSlug={campaign.slug}
          isClosed={isClosed}
        />
      </div>
    </div>
  );
}
