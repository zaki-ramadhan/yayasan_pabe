import { CampaignCTA } from "@/components/campaign/CampaignCTA";

/**
 * Organism component: Tampilan ramah jika pengguna belum memiliki riwayat lamaran kerja
 */
export function DonorCareerEmptyState() {
  return (
    <div className="space-y-6">
      <CampaignCTA
        title="Tertarik Bergabung Bersama Kami?"
        description="Salurkan keahlian profesional dan dedikasi Anda untuk kemajuan dakwah, pemberdayaan yatim, dan program kemanusiaan bersama Yayasan Payung Berkah."
        buttonText="Lihat Lowongan Tersedia"
        buttonHref="/karier"
        ignoreAuthCheck={true}
        variant="blue"
        campaign={{
          bannerUrl: "/img/banners/cta/cta-banner.webp",
          title: "Peluang Karier & Pengabdian",
          category: "Karier Yayasan",
        }}
      />
    </div>
  );
}

