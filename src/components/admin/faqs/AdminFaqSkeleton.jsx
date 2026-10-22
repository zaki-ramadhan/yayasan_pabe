import { Skeleton } from "@/components/ui/skeleton";

export function AdminFaqSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Page Header */}
      <div className="space-y-1.5">
        <Skeleton className="h-6 w-56 rounded-md" />
        <Skeleton className="h-4 w-96 max-w-full rounded" />
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 max-w-md">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-44 rounded-lg" />
        </div>
      </div>

      {/* List of FAQ Cards Skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-slate-200/90 bg-white p-4 sm:p-5 space-y-3 shadow-2xs"
          >
            {/* FAQ Header Row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <Skeleton className="w-7 h-7 rounded-md shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Skeleton className="h-4.5 w-72 sm:w-96 max-w-full rounded" />
                  <Skeleton className="h-4 w-20 rounded" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>

            {/* Answer Paragraph Skeleton */}
            <div className="space-y-1.5 pt-1 pl-9.5">
              <Skeleton className="h-3.5 w-full rounded" />
              <Skeleton className="h-3.5 w-11/12 rounded" />
              <Skeleton className="h-3.5 w-3/4 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
