import { Suspense } from "react";
import { getArticles, getArticleCategories } from "@/services/articleService";
import { PageHeader } from "@/components/shared/PageHeader";
import { ArticleCatalog } from "@/components/modules/ArticleCatalog";

export const metadata = {
  title: "Artikel & Kabar Lapangan - Yayasan PABE",
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
        title="Artikel &amp; Kabar Filantropi"
        description="Wawasan fiqih ZISWAF dan laporan aktual kegiatan pemberdayaan santri dan dhuafa di lapangan."
      />

      <Suspense>
        <ArticleCatalog initialArticles={articles} categories={categories} />
      </Suspense>
    </main>
  );
}
