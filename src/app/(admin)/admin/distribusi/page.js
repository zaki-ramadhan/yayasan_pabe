import { getAdminDistributions } from "@/services/adminService";
import { AdminDistributionTable } from "@/components/admin/distribution/AdminDistributionTable";

export const metadata = {
  title: "Rekam Penyaluran Donasi",
  description: "Dokumentasi realisasi distribusi dana amanah donatur kepada para mustahik dan penerima manfaat.",
};

export default async function AdminDistributionPage() {
  const { items, campaigns } = await getAdminDistributions({ limit: 50 });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-base sm:text-lg font-semibold text-slate-900 leading-tight">
          Rekam Penyaluran Donasi ke Mustahik
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Catat alokasi pengeluaran dana amanah, dokumentasi kegiatan di lapangan, dan laporan pertanggungjawaban donatur.
        </p>
      </div>

      <AdminDistributionTable
        initialDistributions={items}
        campaigns={campaigns}
      />
    </div>
  );
}
