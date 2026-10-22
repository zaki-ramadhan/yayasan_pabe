import { Skeleton } from "@/components/ui/skeleton";

export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-2.5 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-2xs space-y-1.5"
          >
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-7 w-28 rounded-md" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch">
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col">
          <div className="rounded-lg border border-slate-200/90 bg-white shadow-2xs overflow-hidden h-full flex flex-col">
            <div className="p-3.5 sm:p-4 border-b border-slate-200/90 flex items-center justify-between gap-3">
              <div className="space-y-1">
                <Skeleton className="h-5 w-48 rounded" />
                <Skeleton className="h-3.5 w-64 rounded" />
              </div>
              <Skeleton className="h-4 w-28 rounded" />
            </div>

            <div className="overflow-x-auto flex-1">
              <div className="w-full">
                <div className="bg-slate-50/70 border-b border-slate-200/90 px-4 py-2.5 flex items-center justify-between gap-4">
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-4 w-36 flex-1 rounded" />
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-4 w-16 rounded" />
                </div>

                <div className="divide-y divide-slate-100">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div key={i} className="px-4 py-3.5 flex items-center justify-between gap-4">
                      <Skeleton className="h-4 w-24 rounded" />
                      <Skeleton className="h-4 w-24 rounded" />
                      <Skeleton className="h-4 w-44 flex-1 rounded" />
                      <Skeleton className="h-4 w-20 rounded" />
                      <Skeleton className="h-5 w-16 rounded" />
                      <Skeleton className="h-5 w-16 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 xl:col-span-3 flex flex-col">
          <div className="rounded-lg border border-slate-200/90 bg-white shadow-2xs overflow-hidden h-full flex flex-col">
            <div className="p-3.5 sm:p-4 border-b border-slate-200/90 flex items-center justify-between gap-3">
              <div className="space-y-1">
                <Skeleton className="h-5 w-44 rounded" />
                <Skeleton className="h-3.5 w-48 rounded" />
              </div>
              <Skeleton className="h-4 w-12 rounded" />
            </div>

            <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between gap-3">
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex flex-row items-start gap-2.5">
                    <Skeleton className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-md aspect-square" />
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <Skeleton className="h-4 w-full rounded" />
                      <Skeleton className="h-3.5 w-3/4 rounded" />
                      <div className="flex items-center gap-2 pt-0.5">
                        <Skeleton className="h-1.5 flex-1 rounded-full" />
                        <Skeleton className="h-3.5 w-7 rounded" />
                      </div>
                      <div className="space-y-1 pt-0.5">
                        <Skeleton className="h-3 w-32 rounded" />
                        <Skeleton className="h-3 w-28 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Skeleton className="h-8 w-full rounded-md mt-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
