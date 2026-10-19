import { InformationHeroHeader } from "@/components/shared/InformationHeroHeader";
import { ZakatCalculator } from "@/components/modules/ZakatCalculator";

export const metadata = {
  title: "Kalkulator Zakat - Hitung Kewajiban Zakat Sesuai Syariat",
  description:
    "Alat bantu perhitungan zakat secara mudah dan akurat. Gunakan kalkulator ini untuk mengetahui kewajiban zakat maal, penghasilan, perusahaan, perdagangan, dan emas sesuai syariat.",
};

export default function KalkulatorZakatPage() {
  return (
    <div className="w-full">
      <InformationHeroHeader
        badge={
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Panduan &amp; Simulasi ZISWAF
          </span>
        }
        title="Kalkulator Zakat"
        description="Alat bantu perhitungan zakat secara mudah dan akurat. Gunakan kalkulator ini untuk mengetahui kewajiban zakat maal, penghasilan, perusahaan, perdagangan, dan emas sesuai ketentuan syariat Islam."
        imageAlt="Latar Belakang Kalkulator Zakat Yayasan PABE"
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        <ZakatCalculator />
      </main>
    </div>
  );
}
