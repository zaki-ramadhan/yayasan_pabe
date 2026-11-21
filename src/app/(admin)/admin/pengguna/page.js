import { Suspense } from "react";
import { getAdminUsers } from "@/services/adminUserService";
import { AdminUserTable } from "@/components/admin/users/AdminUserTable";
import { AdminUserSkeleton } from "@/components/admin/users/AdminUserSkeleton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = {
  title: "Kelola Pengurus Yayasan",
  description: "Otoritas kendali penuh akun pengurus yayasan, penugasan peran, dan pengelolaan kredensial.",
};

export default async function AdminUsersPage() {
  const usersData = await getAdminUsers({ page: 1, limit: 10 });

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Kelola Pengurus Yayasan"
        description="Kelola akun pengurus yayasan, peran akses, dan status keaktifan."
      />

      <Suspense fallback={<AdminUserSkeleton />}>
        <AdminUserTable initialData={usersData} />
      </Suspense>
    </div>
  );
}
