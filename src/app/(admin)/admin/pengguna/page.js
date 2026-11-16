import { getAdminUsers } from "@/services/adminUserService";
import { AdminUserTable } from "@/components/admin/users/AdminUserTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = {
  title: "Manajemen Pengurus & Hak Akses",
  description: "Otoritas kendali penuh akun staf yayasan, penugasan peran, dan pengelolaan kredensial.",
};

export default async function AdminUsersPage() {
  const usersData = await getAdminUsers({ page: 1, limit: 10 });

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Kelola Pengurus Yayasan"
        description="Kelola akun staf, peran akses, dan status keaktifan pengurus."
      />

      {/* Daftar Personil Akun Pengurus */}
      <AdminUserTable initialData={usersData} />
    </div>
  );
}
