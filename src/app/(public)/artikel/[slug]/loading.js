import { Skeleton } from "@/components/ui/skeleton";
import { ArticleCardSkeleton } from "@/components/shared/ArticleCardSkeleton";

export default function ArtikelDetailLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 animate-pulse">
      {/* Back button */}
      <Skeleton className="h-4 w-44 rounded" />

      {/* Title & Metadata */}
      <div className="space-y-3">
        <Skeleton className="h-8 sm:h-9 w-full rounded-lg" />
        <Skeleton className="h-8 sm:h-9 w-3/4 rounded-lg" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="h-4 w-36 rounded" />
        </div>
      </div>

      {/* Featured Image Skeleton */}
      <Skeleton className="aspect-video w-full rounded-xl" />

      {/* Paragraphs */}
      <div className="space-y-3.5 pt-1">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-5/6 rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-4/5 rounded" />
      </div>

      {/* Action Bar Skeleton */}
      <div className="flex items-center justify-between py-3 border-y border-slate-200">
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>

      {/* Related Articles Skeleton */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        <Skeleton className="h-6 w-36 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

