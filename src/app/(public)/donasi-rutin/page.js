import { getCampaigns } from "@/services/campaignService";
import { isCampaignClosed } from "@/lib/formatters";
import { RoutineDonationForm } from "@/components/routine-donation/RoutineDonationForm";

export const metadata = {
  title: "Donasi Rutin Otomatis (Sedekah Subuh & Bulanan) - Yayasan PABE",
  description: "Atur jadwal sedekah subuh, infak jumat, atau donasi bulanan rutin untuk santri tahfidz dan yatim dhuafa.",
};

export default async function DonasiRutinPage() {
  const allCampaigns = await getCampaigns();
  const activeCampaigns = allCampaigns.filter((c) => !isCampaignClosed(c));

  return <RoutineDonationForm campaigns={activeCampaigns} />;
}

