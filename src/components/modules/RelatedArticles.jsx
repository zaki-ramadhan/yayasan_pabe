import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ArticleCard } from "@/components/shared/ArticleCard";
import { getRelatedArticles } from "@/lib/articleRecommendation";

export { getRelatedArticles };

/**
 * Komponen Rekomendasi Artikel (RelatedArticles)
 *
 * Menampilkan artikel rekomendasi menggunakan mekanisme Relevance Waterfall:
 * 1. Menyelaraskan artikel berdasarkan kategori dan topik (tags).
 * 2. Mengantisipasi kasus jika kategori hanya memiliki 1 artikel dengan graceful freshness fallback.
 * 3. Menyesuaikan judul dan konteks heading secara dinamis ("Artikel Terkait" vs "Artikel Terbaru Lainnya").
 *
 * @param {object} props
 * @param {object} props.currentArticle - Artikel acuan saat ini
 * @param {Array<object>} props.allArticles - Pool seluruh artikel
 * @param {number} [props.limit=2] - Maksimal artikel yang ditampilkan
 */
export function RelatedArticles({ currentArticle, allArticles = [], limit = 2 }) {
  const result = getRelatedArticles(currentArticle, allArticles, limit);
  const { articles, label, description } = result;

  if (!articles || articles.length === 0) return null;

  return (
    <section className="space-y-4 pt-6 border-t border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div className="space-y-0.5">
          <h2 className="text-base sm:text-lg font-semibold text-slate-950">
            {label}
          </h2>
          {description && (
            <p className="text-xs text-slate-600 font-normal">
              {description}
            </p>
          )}
        </div>

        <Link
          href="/artikel"
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-primary hover:underline underline-offset-4 shrink-0 transition-colors"
        >
          <span>Lihat Semua Artikel</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3.5">
        {articles.map((art) => (
          <ArticleCard key={art.id} article={art} />
        ))}
      </div>
    </section>
  );
}

export default RelatedArticles;
