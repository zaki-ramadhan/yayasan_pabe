import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

export function CampaignCardSkeleton({ className }) {
  return (
    <div
      className={cn(
        "flex flex-col h-full w-full rounded-xl border border-slate-300 bg-white overflow-hidden p-0 space-y-0",
        className
      )}
    >
      {/* Thumbnail Skeleton with RibbonBadge Placeholder */}
      <div className="relative aspect-video w-full bg-slate-100 overflow-hidden border-b border-slate-200">
        <Skeleton className="w-full h-full rounded-none" />
        <div className="absolute top-2.5 left-0 z-10">
          <Skeleton className="h-5 sm:h-5.5 w-24 rounded-r-md bg-slate-300" />
        </div>
      </div>

      {/* Content Skeleton: Preserves upper spacing */}
      <div className="flex flex-col flex-1 px-4 sm:px-5 pt-4 sm:pt-5 pb-3 space-y-2.5">
        {/* Title (Uniform 2-line height) */}
        <div className="space-y-1.5 min-h-[2.6rem]">
          <Skeleton className="h-4.5 sm:h-5 w-full rounded" />
          <Skeleton className="h-4.5 sm:h-5 w-4/5 rounded" />
        </div>

        {/* Location below title */}
        <div className="flex items-center gap-1.5 pt-0.5">
          <Skeleton className="w-3.5 h-3.5 rounded-full shrink-0" />
          <Skeleton className="h-3.5 w-32 rounded" />
        </div>

        {/* Excerpt */}
        <div className="space-y-1">
          <Skeleton className="h-3.5 w-full rounded" />
          <Skeleton className="h-3.5 w-5/6 rounded" />
        </div>

        {/* Progress Bar & Amounts (Matching 2-line layout) */}
        <div className="space-y-1.5 pt-1 mt-auto">
          <Skeleton className="h-2 w-full rounded-full" />
          <div className="flex justify-between items-baseline pt-0.5">
            <div className="space-y-1">
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-4 sm:h-4.5 w-24 rounded" />
            </div>
            <div className="space-y-1 text-right flex flex-col items-end">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-4 sm:h-4.5 w-24 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Skeleton: Tightened side & bottom margins */}
      <div className="px-3.5 sm:px-4 pb-3 sm:pb-3.5 pt-2.5 border-t border-slate-200/80 space-y-2.5">
        <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5">
            <Skeleton className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full" />
            <Skeleton className="h-3.5 w-20 rounded" />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full" />
            <Skeleton className="h-3.5 w-18 rounded" />
          </div>
        </div>
        <Skeleton className="h-8.5 sm:h-9 w-full rounded-lg" />
      </div>
    </div>
  );
}

