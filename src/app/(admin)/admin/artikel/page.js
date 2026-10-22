import { getAdminArticles } from "@/services/adminArticleService";
import { AdminArticleTable } from "@/components/admin/articles/AdminArticleTable";

export const metadata = {
  title: "Kelola Berita & Artikel",
  description: "Manajemen publikasi artikel, edukasi ziswaf, dan transparansi kabar kegiatan yayasan.",
};

export default async function AdminArticlePage() {
  const { items, categories } = await getAdminArticles({ limit: 50 });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-base sm:text-lg font-semibold text-slate-900 leading-tight">
          Kelola Berita &amp; Artikel
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Tulis dan kelola artikel kegiatan, wawasan filantropi, dan laporan berkala untuk donatur dan publik.
        </p>
      </div>

      <AdminArticleTable initialArticles={items} categories={categories} />
    </div>
  );
}
