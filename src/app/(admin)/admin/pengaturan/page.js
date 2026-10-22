import { getOrgSettings } from "@/services/adminSettingsService";
import { AdminSettingsForm } from "@/components/admin/settings/AdminSettingsForm";

export const metadata = {
  title: "Pengaturan Yayasan",
  description: "Pengaturan identitas resmi yayasan, kontak operasional, legalitas, dan nomor rekening bank resmi.",
};

export default async function AdminSettingsPage() {
  const settings = await getOrgSettings();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-base sm:text-lg font-medium text-slate-900 leading-tight">
          Pengaturan profil &amp; rekening yayasan
        </h1>
        <p className="text-sm font-normal text-slate-500 mt-0.5">
          Kelola informasi identitas lembaga, data kontak layanan donatur, legalitas perizinan, dan rekening bank resmi.
        </p>
      </div>

      <AdminSettingsForm initialSettings={settings} />
    </div>
  );
}
