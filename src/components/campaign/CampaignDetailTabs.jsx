"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CampaignStory } from "./CampaignStory";
import { CampaignUpdatesFeed } from "./CampaignUpdatesFeed";
import { CampaignPrayersFeed } from "@/components/modules/CampaignPrayersFeed";
import { CampaignDonationGrowthChart } from "./CampaignDonationGrowthChart";
import { CampaignTransactionsList } from "./CampaignTransactionsList";

const TAB_TRIGGER_CLASS =
  "rounded-none border-t-0 border-x-0 border-b-2 border-transparent bg-transparent data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none shadow-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 pb-3 px-4 sm:px-5 text-sm sm:text-base font-medium text-slate-700 hover:text-slate-950 transition-colors shrink-0";

/**
 * Controlled editorial tabs for campaign detail.
 * Controlled externally so tour can switch tabs programmatically.
 *
 * @param {object} props
 * @param {object} props.campaign
 * @param {object} props.donationStats
 * @param {number} props.prayersCount
 * @param {boolean} props.hasDonations
 * @param {string} props.activeTab - controlled tab value
 * @param {(tab: string) => void} props.onTabChange
 */
export function CampaignDetailTabs({
  campaign,
  donationStats,
  prayersCount = 0,
  hasDonations = false,
  activeTab,
  onTabChange,
}) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="w-full justify-start border-b border-slate-300 pb-0 rounded-none bg-transparent h-auto p-0 gap-0 overflow-x-auto flex-nowrap">
        <TabsTrigger
          id="tour-tab-detail"
          data-tour-tab="detail"
          value="detail"
          className={TAB_TRIGGER_CLASS}
        >
          Detail Program
        </TabsTrigger>
        <TabsTrigger
          id="tour-tab-penyaluran"
          data-tour-tab="penyaluran"
          value="penyaluran"
          className={TAB_TRIGGER_CLASS}
        >
          Laporan Penyaluran{campaign.updates?.length ? ` (${campaign.updates.length})` : ""}
        </TabsTrigger>
        <TabsTrigger
          id="tour-tab-doa"
          data-tour-tab="doa"
          value="doa"
          className={TAB_TRIGGER_CLASS}
        >
          Doa &amp; Dukungan{prayersCount > 0 ? ` (${prayersCount})` : ""}
        </TabsTrigger>
        {hasDonations && (
          <TabsTrigger
            id="tour-tab-riwayat"
            data-tour-tab="riwayat"
            value="riwayat"
            className={TAB_TRIGGER_CLASS}
          >
            Riwayat Donasi{campaign.donorCount > 0 ? ` (${campaign.donorCount})` : ""}
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="detail" className="mt-4 focus:outline-none">
        <CampaignStory story={campaign.story} />
      </TabsContent>

      <TabsContent value="penyaluran" className="mt-4 focus:outline-none">
        <CampaignUpdatesFeed updates={campaign.updates} />
      </TabsContent>

      <TabsContent value="doa" className="mt-4 focus:outline-none">
        <CampaignPrayersFeed
          initialDonors={campaign.recentDonors || []}
          campaignSlug={campaign.slug}
          campaignTitle={campaign.title}
        />
      </TabsContent>

      {hasDonations && (
        <TabsContent value="riwayat" className="mt-4 focus:outline-none space-y-6">
          <CampaignDonationGrowthChart
            initialData={donationStats}
            campaign={campaign}
          />
          <CampaignTransactionsList
            donors={campaign.recentDonors || []}
            totalDonorsCount={campaign.donorCount || 0}
            campaignSlug={campaign.slug}
          />
        </TabsContent>
      )}
    </Tabs>
  );
}
