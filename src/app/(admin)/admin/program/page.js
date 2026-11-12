import { redirect } from "next/navigation";
import { getAdminCampaigns } from "@/services/adminService";
import { AdminProgramTable } from "@/components/admin/programs/AdminProgramTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = {
  title: "Kelola Program Donasi",
  description: "Manajemen kampanye penggalangan donasi, target nominal, status penggalangan, dan kabar penyaluran yayasan.",
};

export default async function AdminProgramPage({ searchParams }) {
  const resolvedParams = searchParams ? await searchParams : {};
  const isZisRedirect =
    resolvedParams?.category === "zakat" || resolvedParams?.category === "zis";
  if (isZisRedirect) {
    redirect("/admin/zis");
  }

  const { items, categories, error } = await getAdminCampaigns({
    limit: 50,
    mode: "donation",
  });

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Kelola Program Donasi"
        description="Kelola daftar program galang dana dan target donasi."
      />

      <AdminProgramTable
        key={`donation-${resolvedParams?.category || "all"}`}
        mode="donation"
        initialCampaigns={items}
        categories={categories}
        initialEditId={resolvedParams?.edit}
        initialCategoryFilter={resolvedParams?.category || "ALL"}
        initialError={error}
      />
    </div>
  );
}
