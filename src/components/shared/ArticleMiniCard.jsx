import Link from "next/link";
import { Image as ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SafeImage } from "@/components/ui/SafeImage";
import { HighlightText } from "@/components/shared/HighlightText";
import { cn } from "@/lib/utils";

/**
 * Compact horizontal mini card for articles
 * Used on Home Page digest, sidebar suggestions, and compact feeds.
 *
 * @param {object} props
 * @param {object} props.article
 * @param {string} [props.highlightQuery]
 * @param {string} [props.className]
 */
export function ArticleMiniCard({
  article,
  highlightQuery = "",
  className = "",
}) {
  if (!article) return null;

  return (
    <Card
      className={cn(
        "p-2 sm:p-2.5 bg-white border-slate-200 transition-colors flex flex-row gap-2.5 sm:gap-3 items-center rounded-lg shadow-2xs group h-full",
        className
      )}
    >
      {/* Left: Compact Square Thumbnail or Fallback Image Icon */}
      <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-md overflow-hidden bg-slate-100 border border-slate-200 aspect-square flex items-center justify-center">
        {article.bannerUrl ? (
          <SafeImage
            src={article.bannerUrl}
            alt={article.title}
            sizes="64px"
            fallbackText={article.category}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
            <ImageIcon className="w-6 h-6 text-slate-400 stroke-[1.5]" />
          </div>
        )}
      </div>

      {/* Right: Category + Title with font-medium */}
      <div className="flex-1 min-w-0 space-y-0.5">
        <span className="text-xs font-semibold text-primary block truncate">
          {article.category}
        </span>

        <Link href={`/artikel/${article.slug}`}>
          <h3 className="text-xs sm:text-sm font-medium text-slate-900 group-hover:text-primary group-hover:underline transition-colors leading-snug line-clamp-2">
            <HighlightText text={article.title} highlight={highlightQuery} />
          </h3>
        </Link>
      </div>
    </Card>
  );
}
