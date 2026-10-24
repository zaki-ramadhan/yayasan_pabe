import { getAdminDistributions } from "@/services/adminService";
import { AdminDistributionTable } from "@/components/admin/distribution/AdminDistributionTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = {
  title: "Rekam Penyaluran Donasi",
  description: "Dokumentasi realisasi distribusi dana amanah donatur kepada para mustahik dan penerima manfaat.",
};

export default async function AdminDistributionPage() {
  const { items, campaigns } = await getAdminDistributions({ limit: 50 });

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Rekam Penyaluran Donasi ke Mustahik"
        description="Catat penyaluran dana program dan bukti kegiatan lapangan."
      />

      <AdminDistributionTable
        initialDistributions={items}
        campaigns={campaigns}
      />
    </div>
  );
}
