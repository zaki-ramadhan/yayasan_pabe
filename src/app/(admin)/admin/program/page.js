import { getAdminCampaigns } from "@/services/adminService";
import { AdminProgramTable } from "@/components/admin/programs/AdminProgramTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = {
  title: "Kelola Program Donasi",
  description: "Manajemen kampanye penggalangan donasi, target nominal, status penggalangan, dan kabar penyaluran yayasan.",
};

export default async function AdminProgramPage() {
  const { items, categories } = await getAdminCampaigns({ limit: 50 });

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Kelola Program Donasi"
        description="Kelola daftar program galang dana dan target donasi."
      />

      <AdminProgramTable initialCampaigns={items} categories={categories} />
    </div>
  );
}
