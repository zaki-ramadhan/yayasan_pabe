import { getAdminVolunteers } from "@/services/adminVolunteerService";
import { AdminVolunteerTable } from "@/components/admin/volunteers/AdminVolunteerTable";

export const metadata = {
  title: "Pendaftar Relawan",
  description: "Kelola data pendaftar relawan, status verifikasi, dan kontak relawan yayasan.",
};

export default async function AdminVolunteerPage() {
  const { items } = await getAdminVolunteers({ limit: 50 });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-base sm:text-lg font-medium text-slate-900 leading-tight">
          Pendaftar relawan yayasan
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Pantau calon relawan, verifikasi profil, hubungi melalui WhatsApp, dan kelola status keaktifan penugasan.
        </p>
      </div>

      <AdminVolunteerTable initialVolunteers={items} />
    </div>
  );
}
