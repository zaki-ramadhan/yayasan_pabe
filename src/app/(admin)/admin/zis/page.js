import { getAdminCampaigns } from "@/services/adminService";
import { AdminProgramTable } from "@/components/admin/programs/AdminProgramTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = {
  title: "Kelola Program ZIS",
  description:
    "Manajemen program penghimpunan dan penyaluran Zakat, Infaq, dan Sedekah yayasan.",
};

export default async function AdminZisPage({ searchParams }) {
  const resolvedParams = searchParams ? await searchParams : {};
  const { items, categories, error } = await getAdminCampaigns({
    limit: 50,
    mode: "zis",
  });

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Kelola Program ZIS"
        description="Kelola program Zakat, Infaq, dan Sedekah beserta capaian dan status penyalurannya."
      />

      <AdminProgramTable
        key="zis"
        mode="zis"
        initialCampaigns={items}
        categories={categories}
        initialEditId={resolvedParams?.edit}
        initialError={error}
      />
    </div>
  );
}

