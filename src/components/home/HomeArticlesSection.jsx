import Link from "next/link";
import { ArticleMiniCard } from "@/components/shared/ArticleMiniCard";

/**
 * Articles and field stories digest on home page
 * @param {object} props
 * @param {Array} props.articles
 */
export function HomeArticlesSection({ articles = [] }) {
  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-medium text-slate-950 tracking-tight">
          Berita &amp; Artikel
        </h2>
        <Link href="/artikel" className="text-sm font-medium text-primary hover:underline">
          Lihat Semua
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {articles.map((art) => (
          <ArticleMiniCard key={art.id} article={art} />
        ))}
      </div>
    </div>
  );
}
