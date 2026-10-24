import { getAdminVolunteers } from "@/services/adminVolunteerService";
import { AdminVolunteerTable } from "@/components/admin/volunteers/AdminVolunteerTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = {
  title: "Pendaftar Relawan",
  description: "Kelola data pendaftar relawan, status verifikasi, dan kontak relawan yayasan.",
};

export default async function AdminVolunteerPage() {
  const { items } = await getAdminVolunteers({ limit: 50 });

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Pendaftar relawan yayasan"
        description="Pantau pendaftar relawan dan verifikasi data."
      />

      <AdminVolunteerTable initialVolunteers={items} />
    </div>
  );
}
