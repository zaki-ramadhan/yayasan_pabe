import { getAdminUsers } from "@/services/adminUserService";
import { AdminUserTable } from "@/components/admin/users/AdminUserTable";

export const metadata = {
  title: "Manajemen Pengurus & Hak Akses",
  description: "Otoritas kendali penuh akun staf yayasan, penugasan peran, dan pengelolaan kredensial.",
};

export default async function AdminUsersPage() {
  const usersData = await getAdminUsers({ page: 1, limit: 10 });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-base sm:text-lg font-medium text-slate-900 leading-tight">
          Kelola Pengurus Yayasan
        </h1>
        <p className="text-sm font-normal text-slate-500 mt-0.5">
          Atur peran staf pengurus, kelola status keaktifan akun, dan pantau hak akses operasional yayasan.
        </p>
      </div>

      <AdminUserTable initialData={usersData} />
    </div>
  );
}
