import { Skeleton } from "@/components/ui/skeleton";
import { ArticleCardSkeleton } from "@/components/shared/ArticleCardSkeleton";

export default function ArtikelCatalogLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 sm:h-9 w-64 max-w-full rounded-lg" />
        <Skeleton className="h-4 sm:h-5 w-full max-w-lg rounded" />
      </div>

      {/* Search Bar & Sort Control */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
        <Skeleton className="h-11 w-full sm:max-w-md rounded-lg" />
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-11 w-44 rounded-lg" />
        </div>
      </div>

      {/* Horizontal Cards Grid - 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <ArticleCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

