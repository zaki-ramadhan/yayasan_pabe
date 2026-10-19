import { getCampaigns, getQuickDonateTargetSlug } from "@/services/campaignService";
import { getTransparencyMetrics } from "@/services/reportService";
import { getArticles } from "@/services/articleService";
import { getInstagramPosts, getInstagramAccount } from "@/services/instagramService";
import { isCampaignClosed } from "@/lib/formatters";
import { HomeHero } from "@/components/home/HomeHero";
import { HomePartnersSection } from "@/components/home/HomePartnersSection";
import { HomeFeaturedPrograms } from "@/components/home/HomeFeaturedPrograms";
import { HomeTransparencySection } from "@/components/home/HomeTransparencySection";
import { HomeInstagramFeed } from "@/components/home/HomeInstagramFeed";
import { HomeArticlesSection } from "@/components/home/HomeArticlesSection";
import { HomeFaqSection } from "@/components/home/HomeFaqSection";
import { HomeCtaSection } from "@/components/home/HomeCtaSection";

export const metadata = {
  title: "Beranda",
  description: "Penyaluran zakat, infak, dan sedekah untuk pendidikan santri dan pemberdayaan dhuafa.",
};

export default async function HomePage() {
  const [allCampaigns, metrics, articles, instagramPosts, instagramAccount] = await Promise.all([
    getCampaigns({ status: "ACTIVE" }),
    getTransparencyMetrics(),
    getArticles({ limit: 8 }),
    getInstagramPosts(18),
    getInstagramAccount(),
  ]);

  const activeCampaigns = allCampaigns.filter((c) => !isCampaignClosed(c));
  const featuredCampaigns = activeCampaigns.slice(0, 5);
  const quickDonateTargetSlug = getQuickDonateTargetSlug(activeCampaigns);

  return (
    <div className="space-y-10 sm:space-y-12 pb-14">
      {/* 1. Hero Section with Quick Donate */}
      <HomeHero defaultCampaignSlug={quickDonateTargetSlug} />

      {/* 2. Mitra & Lembaga Terkait */}
      <HomePartnersSection />

      {/* 3. Program Donasi Pilihan */}
      <HomeFeaturedPrograms
        campaigns={featuredCampaigns}
        totalCount={activeCampaigns.length}
      />

      {/* 4. Transparansi & Audit Keuangan */}
      <HomeTransparencySection metrics={metrics} />

      {/* 5. Dokumentasi Media Sosial (Instagram Feed) */}
      <HomeInstagramFeed posts={instagramPosts} account={instagramAccount} />

      {/* 6. Artikel & FAQ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          <div className="lg:col-span-7">
            <HomeArticlesSection articles={articles} />
          </div>
          <div className="lg:col-span-5">
            <HomeFaqSection />
          </div>
        </div>
      </section>

      {/* 7. Call To Action */}
      <HomeCtaSection defaultCampaignSlug={activeCampaigns[0]?.slug} />
    </div>
  );
}
