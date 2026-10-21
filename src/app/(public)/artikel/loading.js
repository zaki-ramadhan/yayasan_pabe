import { Skeleton } from "@/components/ui/skeleton";
import { ArticleCardSkeleton } from "@/components/shared/ArticleCardSkeleton";

export default function ArtikelCatalogLoading() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-pulse">
      {/* 1. Page Header */}
      <div className="space-y-2 max-w-3xl">
        <Skeleton className="h-8 sm:h-9 w-72 max-w-full rounded-lg" />
        <Skeleton className="h-4 sm:h-5 w-full max-w-xl rounded" />
      </div>

      {/* 2. Category Tabs (Wrapped & Centered Pills matching CategoryTabs) */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
        <Skeleton className="h-[38px] w-36 rounded-full shrink-0" />
        <Skeleton className="h-[38px] w-32 rounded-full shrink-0" />
        <Skeleton className="h-[38px] w-32 rounded-full shrink-0" />
        <Skeleton className="h-[38px] w-32 rounded-full shrink-0" />
        <Skeleton className="h-[38px] w-32 rounded-full shrink-0" />
        <Skeleton className="h-[38px] w-36 rounded-full shrink-0" />
        <Skeleton className="h-[38px] w-36 rounded-full shrink-0" />
        <Skeleton className="h-[38px] w-24 rounded-full shrink-0" />
        <Skeleton className="h-[38px] w-32 rounded-full shrink-0" />
        <Skeleton className="h-[38px] w-32 rounded-full shrink-0" />
        <Skeleton className="h-[38px] w-40 rounded-full shrink-0" />
      </div>

      {/* 3. Search Bar & Sort Control (matching CatalogSearchBar) */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
        <div className="w-full sm:max-w-md">
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
      </div>

      {/* 4. Horizontal Cards Grid (2 columns matching ArticleCatalog, 8 items) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <ArticleCardSkeleton key={i} />
        ))}
      </div>
    </main>
  );
}
