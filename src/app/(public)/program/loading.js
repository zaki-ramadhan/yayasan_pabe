import { Skeleton } from "@/components/ui/skeleton";
import { CampaignCardSkeleton } from "@/components/shared/CampaignCardSkeleton";

export default function ProgramLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 sm:h-9 w-80 max-w-full rounded-lg" />
        <Skeleton className="h-4 sm:h-5 w-full max-w-2xl rounded" />
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-4 pt-1">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Skeleton className="h-9 w-24 rounded-lg shrink-0" />
          <Skeleton className="h-9 w-28 rounded-lg shrink-0" />
          <Skeleton className="h-9 w-32 rounded-lg shrink-0" />
          <Skeleton className="h-9 w-28 rounded-lg shrink-0" />
          <Skeleton className="h-9 w-24 rounded-lg shrink-0" />
        </div>

        {/* Search Bar & Sort Dropdown Control */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
          <div className="w-full sm:max-w-md">
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-10 w-36 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Campaign Cards Grid (6 initial items matching batch) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-2">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <CampaignCardSkeleton key={n} />
        ))}
      </div>
    </div>
  );
}

