import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/shared/BackLink";
import { getArticleBySlug, getArticles } from "@/services/articleService";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/formatters";
import { SafeImage } from "@/components/ui/safe-image";
import { ArticleActionBar } from "@/components/modules/ArticleActionBar";
import { RelatedArticles } from "@/components/modules/RelatedArticles";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Artikel Tidak Ditemukan" };

  const ogImage = article.bannerUrl || "/img/logo/logo_ypabe.jpeg";

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      url: `/artikel/${slug}`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [ogImage],
    },
  };
}

export default async function ArticleDetailPage({ params }) {
  const { slug } = await params;
  const [article, allArticles] = await Promise.all([
    getArticleBySlug(slug),
    getArticles(),
  ]);

  if (!article) {
    notFound();
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-5">
      <BackLink
        href="/artikel"
        label="Kembali ke Berita &amp; Artikel"
      />

      {/* Title & Metadata Header */}
      <div className="space-y-3">
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-950 leading-tight">
          {article.title}
        </h1>

        {/* Metadata Header */}
        <div className="flex items-center divide-x divide-slate-300 text-xs sm:text-sm text-slate-600 flex-wrap gap-y-1">
          <span className="pr-3 font-semibold text-slate-900">{article.category}</span>
          {article.author && <span className="px-3">Oleh {article.author}</span>}
          <span className="pl-3">
            {formatDate(article.publishedAt, { withDay: true, withTime: true })}
          </span>
        </div>
      </div>

      {/* Optional Featured Image with Left-Aligned Attribution Footer */}
      {article.bannerUrl && (
        <figure className="space-y-1.5">
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
            <SafeImage
              src={article.bannerUrl}
              alt={article.title}
              priority
              fallbackText={article.category}
            />
          </div>
          {article.imageSource && (
            <figcaption className="text-xs text-slate-500 text-left italic">
              Sumber foto:{" "}
              {article.imageSourceUrl ? (
                <a
                  href={article.imageSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary underline underline-offset-2"
                >
                  {article.imageSource}
                </a>
              ) : (
                <span>{article.imageSource}</span>
              )}
            </figcaption>
          )}
        </figure>
      )}

      {/* Article Content */}
      <div className="text-base text-slate-800 leading-relaxed space-y-4 whitespace-pre-line pt-1">
        {article.content}
      </div>

      {/* Multi-Tags */}
      {Array.isArray(article.tags) && article.tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-slate-200">
          <span className="text-xs font-medium text-slate-500 mr-1">
            Topik:
          </span>
          {article.tags.map((tag) => (
            <Link
              key={tag}
              href="/artikel"
              className="text-xs px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {/* Interactive Like & Share Bar */}
      <ArticleActionBar
        articleId={article.id}
        slug={article.slug}
        initialLikes={article.likeCount || 0}
        initialDislikes={article.dislikeCount || 0}
        title={article.title}
      />

      {/* Related Articles Recommendation */}
      <RelatedArticles currentArticle={article} allArticles={allArticles} />

      {/* Donation Promo CTA Box (Atmospheric gradient overlay + semi-transparent bg image + 3D CTA button) */}
      <div className="relative overflow-hidden rounded-xl border border-slate-700/70 bg-slate-950 text-white p-5 sm:p-6 shadow-md mt-4">
        {/* Background image + atmospheric bottom-anchored radial gradient */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <Image
            src={article.bannerUrl || "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=800&q=80"}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(29,78,216,0.5)_0%,_rgba(15,23,42,0.75)_55%,_rgba(2,6,23,0.92)_100%)]" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-white text-base sm:text-lg">
              Salurkan Sedekah &amp; Doa Terbaik Anda
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 max-w-xl leading-relaxed">
              Dukung program pembinaan santri Al-Qur&apos;an dan kemandirian dhuafa bersama Yayasan PABE.
            </p>
          </div>

          <Link
            href="/program"
            className="relative inline-flex items-center justify-center px-4 sm:px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs sm:text-sm border-t border-white/25 shadow-[0_3.5px_0_0_#1e3a8a] active:shadow-[0_1px_0_0_#1e3a8a] active:translate-y-[2.5px] transition-all cursor-pointer shrink-0 whitespace-nowrap self-start sm:self-auto select-none"
          >
            Lihat Program Kebaikan
          </Link>
        </div>
      </div>
    </main>
  );
}
