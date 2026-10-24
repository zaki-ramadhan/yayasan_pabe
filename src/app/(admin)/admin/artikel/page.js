import { getAdminArticles } from "@/services/adminArticleService";
import { AdminArticleTable } from "@/components/admin/articles/AdminArticleTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = {
  title: "Kelola Berita & Artikel",
  description: "Manajemen publikasi artikel, edukasi ziswaf, dan transparansi kabar kegiatan yayasan.",
};

export default async function AdminArticlePage() {
  const { items, categories } = await getAdminArticles({ limit: 50 });

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Kelola Berita & Artikel"
        description="Kelola berita, kabar kegiatan, dan artikel yayasan."
      />

      <AdminArticleTable initialArticles={items} categories={categories} />
    </div>
  );
}
