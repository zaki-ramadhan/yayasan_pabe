import { DonorHistoryDashboard } from "@/components/donor/DonorHistoryDashboard";

export const metadata = {
  title: "Riwayat Donasi & Zakat",
  description: "Daftar riwayat donasi, zakat, dan bukti pembayaran resmi Anda.",
};

export default function DonaturRiwayatPage() {
  return <DonorHistoryDashboard />;
}
