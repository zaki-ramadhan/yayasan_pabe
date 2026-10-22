import { getAdminVacancies } from "@/services/adminCareerService";
import { AdminCareerTable } from "@/components/admin/careers/AdminCareerTable";

export const metadata = {
  title: "Kelola Lowongan Karier",
  description: "Manajemen lowongan pekerjaan, penempatan amil/staf yayasan, dan seleksi berkas pelamar.",
};

export default async function AdminCareerPage() {
  const vacancies = await getAdminVacancies();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-base sm:text-lg font-semibold text-slate-900 leading-tight">
          Kelola Lowongan Karier &amp; Rekrutmen
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Kelola publikasi posisi staf yayasan, pantau berkas lamaran masuk, dan tentukan status seleksi kandidat.
        </p>
      </div>

      <AdminCareerTable initialVacancies={vacancies} />
    </div>
  );
}
