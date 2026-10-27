import { DashboardMetricCard } from "@/components/dashboard/DashboardMetricCard";
import { USER_ROLES } from "@/services/authService";
import { formatRupiah, formatNumber } from "@/lib/formatters";

export function DashboardMetricCards({ userRole, stats }) {
  if (userRole === USER_ROLES.DONOR) {
    const totalDonated = Number(stats?.totalDonations || stats?.totalDonated || 0);
    const activeRoutines = Number(stats?.activeRoutines || stats?.activeSchedulesCount || 0);
    const supportedBeneficiaries = Number(stats?.beneficiariesCount || (totalDonated > 0 ? Math.max(1, Math.round(totalDonated / 250000)) : 0));

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardMetricCard
          label="Total Infak / Zakat Disalurkan"
          value={formatRupiah(totalDonated)}
          subtitle="Tercatat di e-Kwitansi Pajak"
          statusColor="emerald"
        />
        <DashboardMetricCard
          label="Jadwal Donasi Rutin Aktif"
          value={`${formatNumber(activeRoutines)} Program`}
          subtitle="Pengingat WhatsApp aktif"
          statusColor="slate"
        />
        <DashboardMetricCard
          label="Anak Asuh Didukung"
          value={`${formatNumber(supportedBeneficiaries)} Anak Yatim`}
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
    const totalHours = Number(stats?.totalHours || 0);
    const missionCount = Number(stats?.missionCount || 0);
    const assistedBeneficiaries = Number(stats?.assistedBeneficiaries || 0);

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardMetricCard
          label="Total Jam Khidmat Relawan"
          value={`${formatNumber(totalHours)} Jam`}
          subtitle={`${formatNumber(missionCount)} Misi Lapangan`}
          statusColor="emerald"
        />
        <DashboardMetricCard
          label="Misi Aksi Mendatang"
          value={`${formatNumber(missionCount)} Agenda`}
          subtitle="Wilayah Binaan PABE"
          statusColor="slate"
        />
        <DashboardMetricCard
          label="Penerima Manfaat Dibantu"
          value={`${formatNumber(assistedBeneficiaries)} Orang`}
          subtitle="Distribusi sembako & mushaf"
          statusColor="slate"
        />
        <DashboardMetricCard
          label="Status Keaktifan"
          value={<span className="text-emerald-600">Relawan Terdaftar</span>}
          subtitle="Database Resmi Yayasan PABE"
          statusColor="slate"
        />
      </div>
    );
  }

  const totalDonations = Number(stats?.totalDonations || 0);
  const transactionCount = Number(stats?.transactionCount || 0);
  const campaignsCount = Number(stats?.activeCampaignsCount || 0);
  const volunteersCount = Number(stats?.volunteerCount || 0);

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
        value={`${formatNumber(transactionCount)} Transaksi`}
        subtitle="Otomatis QRIS & VA"
        statusColor="slate"
      />
      <DashboardMetricCard
        label="Program Campaign Aktif"
        value={`${formatNumber(campaignsCount)} Program`}
        subtitle="Tersinkronisasi Database"
        statusColor="slate"
      />
      <DashboardMetricCard
        label="Relawan Terdaftar"
        value={`${formatNumber(volunteersCount)} Relawan`}
        subtitle="Formulir Relawan Terhubung"
        statusColor="emerald"
      />
    </div>
  );
}
