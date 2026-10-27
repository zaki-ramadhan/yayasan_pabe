import { getCampaigns } from "@/services/campaignService";
import { isCampaignClosed } from "@/lib/formatters";
import { RoutineDonationForm } from "@/components/routine-donation/RoutineDonationForm";

export const metadata = {
  title: "Donasi Rutin (Sedekah Subuh & Bulanan)",
  description: "Atur jadwal sedekah subuh, infak jumat, atau donasi bulanan rutin untuk pendidikan anak yatim dan dhuafa.",
};

export default async function DonasiRutinPage() {
  const allCampaigns = await getCampaigns();
  const activeCampaigns = allCampaigns.filter((c) => !isCampaignClosed(c));

  return <RoutineDonationForm campaigns={activeCampaigns} />;
}

