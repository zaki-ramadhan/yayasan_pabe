import { getAdminUsers } from "@/services/adminUserService";
import { getOrgSettings } from "@/services/adminSettingsService";
import { AdminUserTable } from "@/components/admin/users/AdminUserTable";
import { AdminStructureImageCard } from "@/components/admin/users/AdminStructureImageCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = {
  title: "Manajemen Pengurus & Hak Akses",
  description: "Otoritas kendali penuh akun staf yayasan, penugasan peran, dan pengelolaan kredensial.",
};

export default async function AdminUsersPage() {
  const [usersData, orgSettings] = await Promise.all([
    getAdminUsers({ page: 1, limit: 10 }),
    getOrgSettings(),
  ]);

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Kelola Pengurus Yayasan"
        description="Kelola akun staf, peran akses, dan status keaktifan pengurus."
      />

      {/* 1. Bagan Visual Struktur Organisasi (R2 Storage) */}
      <AdminStructureImageCard initialImage={orgSettings?.structureImage || null} />

      {/* 2. Daftar Personil Akun Pengurus */}
      <AdminUserTable initialData={usersData} />
    </div>
  );
}
