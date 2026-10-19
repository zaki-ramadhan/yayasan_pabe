import { Skeleton } from "@/components/ui/skeleton";

export function CampaignCardSkeleton() {
  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-200 bg-white overflow-hidden p-0 space-y-0">
      {/* Thumbnail Skeleton */}
      <Skeleton className="aspect-video w-full rounded-none" />

      {/* Content Skeleton: Preserves upper spacing */}
      <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3 space-y-2.5 flex-1 flex flex-col">
        {/* Category & Location */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
        </div>

        {/* Excerpt */}
        <div className="space-y-1">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-5/6" />
        </div>

        {/* Progress Bar Skeleton */}
        <div className="space-y-2 pt-2 mt-auto">
          <Skeleton className="h-2 w-full rounded-md" />
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>

      {/* Footer Skeleton: Tightened side & bottom margins */}
      <div className="px-3.5 sm:px-4 pb-3 sm:pb-3.5 pt-2.5 border-t border-slate-100 space-y-2.5">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-8.5 sm:h-9 w-full rounded-lg" />
      </div>
    </div>
  );
}
