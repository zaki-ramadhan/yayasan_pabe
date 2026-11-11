import { getAdminCampaigns } from "@/services/adminService";
import { AdminProgramTable } from "@/components/admin/programs/AdminProgramTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = {
  title: "Kelola Program Donasi",
  description: "Manajemen kampanye penggalangan donasi, target nominal, status penggalangan, dan kabar penyaluran yayasan.",
};

export default async function AdminProgramPage({ searchParams }) {
  const resolvedParams = searchParams ? await searchParams : {};
  const { items, categories, error } = await getAdminCampaigns({ limit: 50 });
  const isZisCategory = resolvedParams?.category === "zakat" || resolvedParams?.category === "zis";

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title={isZisCategory ? "Kelola Program ZIS" : "Kelola Program Donasi"}
        description={
          isZisCategory
            ? "Kelola program ZIS (Zakat, Infaq, Sedekah) dan pos penyaluran amanah mustahik 8 asnaf."
            : "Kelola daftar program galang dana dan target donasi."
        }
      />

      <AdminProgramTable
        initialCampaigns={items}
        categories={categories}
        initialEditId={resolvedParams?.edit}
        initialCategoryFilter={resolvedParams?.category || "ALL"}
        initialError={error}
      />
    </div>
  );
}
