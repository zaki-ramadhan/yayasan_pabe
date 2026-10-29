import { Skeleton } from "@/components/ui/Skeleton";

export function DonorProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-md border border-slate-200/90 bg-sidebar overflow-hidden shadow-2xs">
        <div className="h-24 sm:h-28 w-full bg-slate-200/80 relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse" />
        </div>

        <div className="px-4 sm:px-6 md:px-8 pb-6 bg-sidebar">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6">
              <div className="relative shrink-0 -mt-12 sm:-mt-14 z-10">
                <Skeleton className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-sidebar shadow-md" />
              </div>

              <div className="text-center sm:text-left space-y-2 pt-1 sm:pt-2">
                <div className="flex items-center justify-center sm:justify-start">
                  <Skeleton className="h-6 sm:h-7 w-44 rounded-sm" />
                </div>
                <Skeleton className="h-4 w-52 rounded-sm mx-auto sm:mx-0" />
                <Skeleton className="h-4 w-72 max-w-xs rounded-sm mx-auto sm:mx-0" />
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1">
                  <Skeleton className="h-4 w-28 rounded-sm" />
                  <Skeleton className="h-4 w-36 rounded-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200/80 flex flex-col md:flex-row min-h-[460px]">
          <aside className="w-full md:w-52 lg:w-60 shrink-0 border-b md:border-b-0 md:border-r border-slate-200/80 p-3 sm:p-4 bg-slate-100/50 space-y-1.5">
            <Skeleton className="h-9 w-full rounded-md bg-slate-200" />
            <Skeleton className="h-9 w-full rounded-md bg-slate-100" />
            <Skeleton className="h-9 w-full rounded-md bg-slate-100" />
          </aside>

          <main className="flex-1 p-5 sm:p-7 md:p-8 bg-sidebar min-w-0 space-y-5">
            <div className="space-y-1.5 pb-2">
              <Skeleton className="h-5 w-40 rounded-sm" />
              <Skeleton className="h-3.5 w-72 max-w-full rounded-sm" />
            </div>

            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-24 rounded-xs" />
              <Skeleton className="h-9.5 w-full rounded-md border border-slate-200" />
            </div>

            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-28 rounded-xs" />
              <Skeleton className="h-20 w-full rounded-md border border-slate-200" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-24 rounded-xs" />
                <Skeleton className="h-9.5 w-full rounded-md border border-slate-200" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-36 rounded-xs" />
                <Skeleton className="h-9.5 w-full rounded-md border border-slate-200" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-28 rounded-xs" />
              <Skeleton className="h-20 w-full rounded-md border border-slate-200" />
            </div>

            <div className="pt-2">
              <Skeleton className="h-9.5 w-32 rounded-md" />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
