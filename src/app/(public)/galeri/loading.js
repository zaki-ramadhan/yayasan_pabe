import { PageHeader } from "@/components/shared/PageHeader";
import { GallerySkeleton } from "@/components/gallery/GallerySkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function GalleryLoading() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-pulse">
      {/* 1. Page Header */}
      <div className="space-y-2 max-w-3xl">
        <Skeleton className="h-8 sm:h-9 w-80 max-w-full rounded-lg" />
        <Skeleton className="h-4 sm:h-5 w-full max-w-2xl rounded" />
      </div>

      {/* 2. Category Tabs Skeleton (Wrapped & Centered Pills) */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
        <Skeleton className="h-[38px] w-36 rounded-full shrink-0" />
        <Skeleton className="h-[38px] w-36 rounded-full shrink-0" />
        <Skeleton className="h-[38px] w-32 rounded-full shrink-0" />
        <Skeleton className="h-[38px] w-28 rounded-full shrink-0" />
        <Skeleton className="h-[38px] w-40 rounded-full shrink-0" />
        <Skeleton className="h-[38px] w-36 rounded-full shrink-0" />
      </div>

      {/* 3. Search Bar & Sort Dropdown Skeleton */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
        <div className="w-full sm:max-w-md">
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
      </div>

      {/* 4. Gallery Photos Grid */}
      <GallerySkeleton count={9} />
    </main>
  );
}

