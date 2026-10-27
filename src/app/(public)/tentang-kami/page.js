import { getVolunteerCount } from "@/services/volunteerService";
import { getOrgSettings } from "@/services/adminSettingsService";
import { AboutHeader } from "@/components/about/AboutHeader";
import { AboutStory } from "@/components/about/AboutStory";
import { AboutVisionMission } from "@/components/about/AboutVisionMission";
import { AboutPillars } from "@/components/about/AboutPillars";
import { AboutLeadership } from "@/components/about/AboutLeadership";
import { AboutBankAccounts } from "@/components/about/AboutBankAccounts";
import { AboutSidebarInfo } from "@/components/about/AboutSidebarInfo";
import { DashedDivider } from "@/components/ui/DashedDivider";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Tentang Kami",
  description:
    "Profil lengkap, struktur dewan pengurus, legalitas resmi, dan visi misi Yayasan Payung Berkah (PABE). Hidup Berkah dengan Sedekah.",
  openGraph: {
    title: "Tentang Kami - Yayasan Payung Berkah (PABE)",
    description:
      "Profil lengkap, struktur dewan pengurus, legalitas resmi, dan visi misi Yayasan Payung Berkah (PABE). Hidup Berkah dengan Sedekah.",
    url: "/tentang-kami",
    type: "website",
    images: [
      {
        url: "/img/branding/logo-ypabe.webp",
        width: 1200,
        height: 630,
        alt: "Profil Resmi Yayasan Payung Berkah",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tentang Kami - Yayasan Payung Berkah (PABE)",
    description:
      "Profil lengkap, struktur dewan pengurus, legalitas resmi, dan visi misi Yayasan Payung Berkah (PABE).",
    images: ["/img/branding/logo-ypabe.webp"],
  },
};

export default async function TentangKamiPage() {
  const [volunteerCount, orgSettings] = await Promise.all([
    getVolunteerCount(),
    getOrgSettings(),
  ]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-4">
      {/* 1. Profile Header with Real Team Count & Dynamic Org Settings */}
      <AboutHeader orgSettings={orgSettings} volunteerCount={volunteerCount} />

      {/* 2. Editorial 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Main Column (8 Cols): Unified Editorial Section with Dashed Dividers */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-300 shadow-2xs overflow-hidden">
          <AboutStory orgSettings={orgSettings} />
          <DashedDivider className="px-4 sm:px-5" />
          <AboutVisionMission orgSettings={orgSettings} />
          <DashedDivider className="px-4 sm:px-5" />
          <AboutPillars />
          <DashedDivider className="px-4 sm:px-5" />
          <AboutLeadership />
          <DashedDivider className="px-4 sm:px-5" />
          <AboutBankAccounts orgSettings={orgSettings} />
        </div>

        {/* Sidebar Column (4 Cols): Unified Sidebar Card with Dynamic Legal & Contact */}
        <aside className="lg:col-span-4 sticky top-20">
          <AboutSidebarInfo orgSettings={orgSettings} />
        </aside>
      </div>
    </main>
  );
}
