import { getAdminCampaigns } from "@/services/adminService";
import { AdminProgramTable } from "@/components/admin/programs/AdminProgramTable";

export const metadata = {
  title: "Kelola Program Donasi",
  description: "Manajemen kampanye penggalangan donasi, target nominal, status penggalangan, dan kabar penyaluran yayasan.",
};

export default async function AdminProgramPage() {
  const { items, categories } = await getAdminCampaigns({ limit: 50 });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-base sm:text-lg font-semibold text-slate-900 leading-tight">
          Kelola Program Donasi
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Publikasikan kampanye baru, pantau pencapaian donatur, dan kelola masa aktif program amanah.
        </p>
      </div>

      <AdminProgramTable initialCampaigns={items} categories={categories} />
    </div>
  );
}
