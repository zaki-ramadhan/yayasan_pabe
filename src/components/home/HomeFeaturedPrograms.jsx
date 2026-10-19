import { CampaignCard } from "@/components/shared/CampaignCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { BrowseAllCampaignsCard } from "@/components/home/BrowseAllCampaignsCard";
import { isCampaignClosed } from "@/lib/formatters";

/**
 * Featured campaigns showcase on home page
 * @param {object} props
 * @param {Array} props.campaigns
 * @param {number} props.totalCount
 */
export function HomeFeaturedPrograms({ campaigns = [], totalCount = 0 }) {
  const activeCampaigns = campaigns.filter((c) => !isCampaignClosed(c));

  if (activeCampaigns.length === 0) return null;

  return (
    <section className="bg-slate-100/80 border-y border-slate-200 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <SectionHeader
          title="Program Donasi Pilihan"
          subtitle="Salurkan kepedulian Anda untuk program pendidikan, kemanusiaan, dan pemberdayaan umat."
          align="center"
        />

        <div className="flex flex-wrap justify-center gap-2">
          {activeCampaigns.map((camp, index) => (
            <div
              key={camp.id}
              className="w-full sm:w-[calc(50%-4px)] lg:w-[calc((100%-16px)/3)] flex"
            >
              <CampaignCard campaign={camp} showDescription={false} priority={index === 0} />
            </div>
          ))}

          {/* 6th Slot: Dedicated Card to Browse All Programs */}
          <div className="w-full sm:w-[calc(50%-4px)] lg:w-[calc((100%-16px)/3)] flex">
            <BrowseAllCampaignsCard totalCount={totalCount} />
          </div>
        </div>
      </div>
    </section>
  );
}
