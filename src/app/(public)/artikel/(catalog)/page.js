import { Suspense } from "react";
import { getArticles, getArticleCategories } from "@/services/articleService";
import { PageHeader } from "@/components/shared/PageHeader";
import { ArticleCatalog } from "@/components/modules/ArticleCatalog";
import { ArticleCardSkeleton } from "@/components/shared/ArticleCardSkeleton";

export const metadata = {
  title: "Berita & Artikel",
  description: "Kumpulan artikel edukasi fiqih zakat, sedekah subuh, dan kabar penyaluran bantuan Yayasan Payung Berkah.",
  openGraph: {
    title: "Berita & Artikel - Yayasan Payung Berkah",
    description: "Kumpulan artikel edukasi fiqih zakat, sedekah subuh, dan kabar penyaluran bantuan Yayasan Payung Berkah.",
    url: "/artikel",
    type: "website",
    images: [
      {
        url: "/img/branding/logo-ypabe.webp",
        width: 1200,
        height: 630,
        alt: "Berita & Artikel Yayasan Payung Berkah",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Berita & Artikel - Yayasan Payung Berkah",
    description: "Kumpulan artikel edukasi fiqih zakat, sedekah subuh, dan kabar penyaluran bantuan.",
    images: ["/img/branding/logo-ypabe.webp"],
  },
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

      <Suspense
        fallback={
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <ArticleCardSkeleton key={n} />
            ))}
          </div>
        }
      >
        <ArticleCatalog initialArticles={articles} categories={categories} />
      </Suspense>
    </main>
  );
}
