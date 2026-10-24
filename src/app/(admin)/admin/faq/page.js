import { getAdminFaqs } from "@/services/adminFaqService";
import { AdminFaqTable } from "@/components/admin/faqs/AdminFaqTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = {
  title: "Kelola Tanya Jawab (FAQ)",
  description: "Manajemen pusat bantuan dan tanya jawab seputar donasi, penyaluran, dan legalitas yayasan.",
};

export default async function AdminFaqPage() {
  const faqs = await getAdminFaqs();

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Kelola Tanya Jawab (FAQ)"
        description="Kelola daftar pertanyaan umum dan jawabannya."
      />

      <AdminFaqTable initialFaqs={faqs} />
    </div>
  );
}
