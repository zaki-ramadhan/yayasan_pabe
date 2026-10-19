import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Reusable skeleton loader for ArticleCard.
 * Perfectly mirrors ArticleCard's layout and responsive proportions.
 *
 * @param {object} props
 * @param {boolean} [props.isCompact=false]
 * @param {string} [props.className]
 */
export function ArticleCardSkeleton({ isCompact = false, className }) {
  if (isCompact) {
    return (
      <div
        className={cn(
          "p-2 sm:p-2.5 bg-white border border-slate-300 rounded-lg shadow-2xs flex flex-row gap-2.5 sm:gap-3 items-center h-full",
          className
        )}
      >
        <Skeleton className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-md aspect-square" />
        <div className="flex-1 min-w-0 space-y-1.5">
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-3.5 w-3/4 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "p-3.5 sm:p-4 bg-white border border-slate-300 rounded-xl shadow-2xs flex flex-col justify-between h-full space-y-0",
        className
      )}
    >
      {/* Top Section: Side-by-side Thumbnail + Content */}
      <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-4 items-start flex-1 w-full">
        {/* Left: Thumbnail preview skeleton */}
        <Skeleton className="w-full aspect-[16/9] sm:aspect-square sm:w-32 md:w-36 sm:h-32 md:h-36 shrink-0 rounded-lg" />

        {/* Right: Content (Category, Title, Excerpt, Tags) */}
        <div className="flex-1 flex flex-col justify-between min-w-0 space-y-2 w-full py-0.5">
          <div className="space-y-1.5 w-full">
            {/* Category */}
            <Skeleton className="h-3.5 w-20 rounded" />

            {/* Title */}
            <div className="space-y-1.5 pt-0.5">
              <Skeleton className="h-4.5 sm:h-5 w-full rounded" />
              <Skeleton className="h-4.5 sm:h-5 w-4/5 rounded" />
            </div>

            {/* Excerpt */}
            <div className="space-y-1 pt-1">
              <Skeleton className="h-3.5 w-full rounded" />
              <Skeleton className="h-3.5 w-5/6 rounded" />
            </div>

            {/* Tags */}
            <div className="flex items-center gap-1.5 pt-1">
              <Skeleton className="h-4.5 w-14 rounded-md" />
              <Skeleton className="h-4.5 w-16 rounded-md" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Metadata: Author, Date & Reactions */}
      <div className="flex items-center justify-between pt-2.5 sm:pt-3 border-t border-slate-200 mt-2.5 sm:mt-3 w-full gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3.5 w-20 rounded" />
          <Skeleton className="h-3.5 w-24 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-3.5 w-10 rounded" />
          <Skeleton className="h-3.5 w-10 rounded" />
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
      </div>
    </div>
  );
}
