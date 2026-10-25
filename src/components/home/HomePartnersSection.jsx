import { PARTNERS } from "@/data/partners";
import { PartnerLogo } from "@/components/home/PartnerLogo";
import { SectionHeader } from "@/components/shared/SectionHeader";

/**
 * Section mitra & lembaga terkait yayasan.
 * Ditempatkan sebelum section program donasi di halaman beranda.
 */
export function HomePartnersSection({
  partners = PARTNERS,
  title = "Mitra & Lembaga Resmi",
  subtitle = "Beroperasi di bawah pengawasan dan sinergi lembaga resmi negara serta mitra terpercaya.",
}) {
  if (!partners || partners.length === 0) return null;

  return (
    <section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <SectionHeader title={title} subtitle={subtitle} align="center" />

        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 lg:gap-12 xl:gap-14 pt-2">
          {partners.map((partner) => (
            <PartnerLogo key={partner.id} partner={partner} />
          ))}
        </div>
      </div>
    </section>
  );
}
