import { Skeleton } from "@/components/ui/skeleton";

export function AdminDonationTrendSkeleton() {
  return (
    <div className="rounded-lg border border-slate-200/90 bg-white shadow-2xs overflow-hidden animate-pulse">
      {/* Header Skeleton */}
      <div className="p-3.5 sm:p-4 border-b border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1">
          <Skeleton className="h-5 w-48 rounded" />
          <Skeleton className="h-3.5 w-72 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-38 rounded-md" />
          <Skeleton className="h-9 w-42 rounded-md" />
        </div>
      </div>

      {/* Metric badges strip skeleton */}
      <div className="px-3.5 sm:px-4 py-2.5 bg-slate-50/50 border-b border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-6">
          <div className="space-y-1">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-4.5 w-28 rounded" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-4.5 w-24 rounded" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-4.5 w-20 rounded" />
          </div>
        </div>
        <Skeleton className="h-4 w-48 rounded" />
      </div>

      {/* Canvas Area Skeleton */}
      <div className="p-3.5 sm:p-4">
        <Skeleton className="h-[260px] sm:h-[300px] w-full rounded-md" />
      </div>
    </div>
  );
}
