import { getAdminDonors } from "@/services/adminDonorService";
import { AdminDonorTable } from "@/components/admin/donors/AdminDonorTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = {
  title: "Daftar Donatur",
  description: "Daftar donatur dan riwayat akumulasi donasi yayasan.",
};

export default async function AdminDonorsPage() {
  const donorsData = await getAdminDonors({ page: 1, limit: 100 });

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Daftar donatur"
        description="Daftar donatur dan riwayat akumulasi donasi yayasan."
      />

      <AdminDonorTable initialData={donorsData} />
    </div>
  );
}
