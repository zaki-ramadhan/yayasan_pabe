import { DonorHistoryDashboard } from "@/components/donor/DonorHistoryDashboard";

export const metadata = {
  title: "Riwayat Donasi & Zakat",
  description:
    "Pantau seluruh rekam jejak penyaluran donasi, zakat, infak subuh, dan kuitansi resmi atas nama Anda secara transparan dan akuntabel.",
};

export default function DonaturRiwayatPage() {
  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Page Header (Tanpa Subheading) */}
      <div>
        <h1 className="text-lg sm:text-xl font-medium tracking-tight text-slate-950">
          Riwayat Donasi &amp; Zakat
        </h1>
      </div>

      {/* Dashboard Content */}
      <DonorHistoryDashboard />
    </div>
  );
}
