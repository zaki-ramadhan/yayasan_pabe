import { DonorHistoryDashboard } from "@/components/donor/DonorHistoryDashboard";

export const metadata = {
  title: "Riwayat Donasi & Zakat",
  description: "Daftar riwayat donasi, zakat, dan bukti pembayaran resmi Anda.",
};

export default function DonaturRiwayatPage() {
  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Page Header */}
      <div>
        <h1 className="text-lg sm:text-xl font-medium tracking-tight text-slate-950">
          Riwayat Donasi &amp; Zakat
        </h1>
        <p className="text-sm font-normal text-slate-500 mt-0.5">
          Daftar transaksi donasi dan bukti pembayaran resmi Anda.
        </p>
      </div>

      {/* Dashboard Content */}
      <DonorHistoryDashboard />
    </div>
  );
}
