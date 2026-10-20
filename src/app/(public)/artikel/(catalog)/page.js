import { Suspense } from "react";
import { getArticles, getArticleCategories } from "@/services/articleService";
import { PageHeader } from "@/components/shared/PageHeader";
import { ArticleCatalog } from "@/components/modules/ArticleCatalog";

export const metadata = {
  title: "Berita & Artikel - Yayasan PABE",
  description: "Kumpulan artikel edukasi fiqih zakat, sedekah subuh, dan kabar penyaluran bantuan Yayasan PABE.",
};

export default async function ArtikelIndexPage() {
  const [articles, categories] = await Promise.all([
    getArticles(),
    getArticleCategories(),
  ]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <PageHeader
        title="Berita &amp; Artikel"
        description="Wawasan panduan zakat, infak, sedekah, serta laporan aktual kegiatan pemberdayaan santri dan dhuafa di lapangan."
      />

      <Suspense>
        <ArticleCatalog initialArticles={articles} categories={categories} />
      </Suspense>
    </main>
  );
}
