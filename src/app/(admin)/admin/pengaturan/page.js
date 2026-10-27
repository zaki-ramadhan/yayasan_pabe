import { getOrgSettings } from "@/services/adminSettingsService";
import { AdminSettingsForm } from "@/components/admin/settings/AdminSettingsForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = {
  title: "Pengaturan Yayasan",
  description: "Pengaturan identitas resmi yayasan, kontak operasional, legalitas, dan nomor rekening bank resmi.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSettingsPage() {
  const settings = await getOrgSettings();

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Pengaturan profil & rekening yayasan"
        description="Kelola profil lembaga, kontak layanan, dan rekening bank yayasan."
      />

      <AdminSettingsForm initialSettings={settings} />
    </div>
  );
}
