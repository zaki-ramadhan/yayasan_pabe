import { getAdminVacancies } from "@/services/adminCareerService";
import { AdminCareerTable } from "@/components/admin/careers/AdminCareerTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = {
  title: "Kelola Lowongan Karier",
  description: "Manajemen lowongan pekerjaan, penempatan amil/staf yayasan, dan seleksi berkas pelamar.",
};

export default async function AdminCareerPage() {
  const vacancies = await getAdminVacancies();

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Kelola Lowongan Karier & Rekrutmen"
        description="Kelola lowongan pekerjaan dan pantau berkas pelamar."
      />

      <AdminCareerTable initialVacancies={vacancies} />
    </div>
  );
}
