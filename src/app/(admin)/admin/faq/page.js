import { getAdminFaqs } from "@/services/adminFaqService";
import { AdminFaqTable } from "@/components/admin/faqs/AdminFaqTable";

export const metadata = {
  title: "Kelola Tanya Jawab (FAQ)",
  description: "Manajemen pusat bantuan dan tanya jawab seputar donasi, penyaluran, dan legalitas yayasan.",
};

export default async function AdminFaqPage() {
  const faqs = await getAdminFaqs();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-base sm:text-lg font-semibold text-slate-900 leading-tight">
          Kelola Tanya Jawab (FAQ)
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Atur pertanyaan umum dan jawaban resmi yayasan yang muncul di beranda dan halaman bantuan donatur.
        </p>
      </div>

      <AdminFaqTable initialFaqs={faqs} />
    </div>
  );
}
