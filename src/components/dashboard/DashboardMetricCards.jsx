import { DashboardMetricCard } from "@/components/dashboard/DashboardMetricCard";
import { USER_ROLES } from "@/services/authService";
import { CAMPAIGNS } from "@/data/campaigns";
import { formatRupiah } from "@/lib/formatters";

export function DashboardMetricCards({ userRole, stats }) {
  if (userRole === USER_ROLES.DONOR) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardMetricCard
          label="Total Infak / Zakat Disalurkan"
          value={formatRupiah(3850000)}
          subtitle="Tercatat di e-Kwitansi Pajak"
          statusColor="emerald"
        />
        <DashboardMetricCard
          label="Jadwal Donasi Rutin Aktif"
          value="2 Program"
          subtitle="Pengingat WhatsApp aktif"
          statusColor="slate"
        />
        <DashboardMetricCard
          label="Santri yang Didukung"
          value="4 Santri Yatim"
          subtitle="Bimbel PABE Smart Cakung"
          statusColor="slate"
        />
        <DashboardMetricCard
          label="Bukti Zakat Sah SPT"
          value="Siap Diunduh"
          subtitle={`Tahun Pajak ${new Date().getFullYear()}`}
          statusColor="primary"
        />
      </div>
    );
  }

  if (userRole === USER_ROLES.VOLUNTEER) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardMetricCard
          label="Total Jam Khidmat Relawan"
          value="48 Jam"
          subtitle="6 Misi Lapangan Selesai"
          statusColor="emerald"
        />
        <DashboardMetricCard
          label="Misi Aksi Mendatang"
          value="2 Agenda"
          subtitle="Lebak & Sukabumi"
          statusColor="slate"
        />
        <DashboardMetricCard
          label="Penerima Manfaat Dibantu"
          value="320 Jiwa"
          subtitle="Distribusi sembako & mushaf"
          statusColor="slate"
        />
        <DashboardMetricCard
          label="Status Keaktifan"
          value={<span className="text-emerald-600">Relawan Aktif</span>}
          subtitle="Terdaftar resmi di Yayasan PABE"
          statusColor="slate"
        />
      </div>
    );
  }

  const totalDonations = stats?.totalDonations || 148500000;
  const transactionCount = stats?.transactionCount || 1240;
  const campaignsCount = stats?.activeCampaignsCount || CAMPAIGNS.length;
  const volunteersCount = stats?.volunteerCount || 348;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <DashboardMetricCard
        label="Donasi Masuk Terhimpun"
        value={formatRupiah(totalDonations)}
        subtitle="Live dari transaksi PostgreSQL"
        statusColor="emerald"
      />
      <DashboardMetricCard
        label="Transaksi Terverifikasi"
        value={`${transactionCount} Transaksi`}
        subtitle="Otomatis QRIS & VA"
        statusColor="slate"
      />
      <DashboardMetricCard
        label="Program Campaign Aktif"
        value={`${campaignsCount} Program`}
        subtitle="Tersinkronisasi Database"
        statusColor="slate"
      />
      <DashboardMetricCard
        label="Relawan Terdaftar"
        value={`${volunteersCount} Relawan`}
        subtitle="Formulir Relawan Terhubung"
        statusColor="emerald"
      />
    </div>
  );
}
