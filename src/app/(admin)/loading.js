import { Skeleton } from "@/components/ui/skeleton";

export default function AdminGenericLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Page Title & Subtitle Skeleton */}
      <div className="space-y-1.5">
        <Skeleton className="h-6 w-56 rounded-md" />
        <Skeleton className="h-4 w-96 max-w-full rounded" />
      </div>

      {/* Filter Bar & Action Button Skeleton */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2.5 max-w-lg">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 w-44 rounded-lg shrink-0" />
        </div>
        <Skeleton className="h-10 w-36 rounded-lg shrink-0" />
      </div>

      {/* Table Skeleton Container */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden">
        {/* Table Header Skeleton */}
        <div className="bg-slate-50/70 border-b border-slate-200/90 px-4 py-3 flex items-center justify-between gap-4">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-4 w-12 rounded" />
        </div>

        {/* Table Rows Skeleton */}
        <div className="divide-y divide-slate-100">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="px-4 py-3.5 flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-44 rounded" />
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-5 w-16 rounded" />
              <Skeleton className="h-4 w-8 rounded" />
            </div>
          ))}
        </div>

        {/* Pagination Footer Skeleton */}
        <div className="px-4 py-3 border-t border-slate-200/90 flex items-center justify-between">
          <Skeleton className="h-4 w-36 rounded" />
          <div className="flex items-center gap-1">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
