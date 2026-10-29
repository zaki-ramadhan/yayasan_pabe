import { Skeleton } from "@/components/ui/Skeleton";

export function GallerySkeleton({ count = 9, showFilters = false }) {
  const cardsGrid = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-slate-300 p-3.5 sm:p-4 flex flex-col justify-between"
        >
          {/* Viewport Media Carousel */}
          <Skeleton className="w-full aspect-[16/10] rounded-lg" />

          {/* Footer Judul (Line-Clamp 2) & Baris Kategori vs Tanggal */}
          <div className="space-y-2 mt-3 pt-0.5">
            <div className="space-y-1 min-h-[2.5rem]">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-3/4 rounded" />
            </div>
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-3.5 w-16 rounded" />
              <Skeleton className="h-3.5 w-20 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {showFilters ? (
        <>
          {/* Category Tabs Skeleton */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            <Skeleton className="h-[38px] w-36 rounded-full shrink-0" />
            <Skeleton className="h-[38px] w-36 rounded-full shrink-0" />
            <Skeleton className="h-[38px] w-32 rounded-full shrink-0" />
            <Skeleton className="h-[38px] w-28 rounded-full shrink-0" />
            <Skeleton className="h-[38px] w-40 rounded-full shrink-0" />
            <Skeleton className="h-[38px] w-36 rounded-full shrink-0" />
          </div>

          {/* Search Bar & Cards Container with space-y-4 */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
              <div className="w-full sm:max-w-md">
                <Skeleton className="h-11 w-full rounded-lg" />
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-10 w-36 rounded-lg" />
              </div>
            </div>

            {cardsGrid}
          </div>
        </>
      ) : (
        cardsGrid
      )}
    </div>
  );
}
