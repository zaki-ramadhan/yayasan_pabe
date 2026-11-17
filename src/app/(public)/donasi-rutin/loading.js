import { Skeleton } from "@/components/ui/Skeleton";

export default function DonasiRutinLoading() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-4">
      <div className="space-y-4">
        <Skeleton className="h-4 w-52 rounded" />
        <div className="space-y-1.5">
          <Skeleton className="h-8 sm:h-9 w-72 rounded-lg" />
          <Skeleton className="h-5 w-full max-w-xl rounded" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

        <div className="lg:col-span-7 space-y-4">

          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 space-y-4 shadow-xs">
            <Skeleton className="h-6 w-28 rounded" />
            <div className="flex items-start gap-3 p-3.5 rounded-lg border border-slate-200 bg-slate-50">
              <Skeleton className="w-4 h-4 rounded mt-0.5 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-48 rounded" />
                <Skeleton className="h-3 w-40 rounded" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-36 rounded" />
              <Skeleton className="h-11 w-full rounded-lg" />
              <Skeleton className="h-3.5 w-72 rounded" />
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 space-y-4 shadow-xs relative">
            <Skeleton className="h-6 w-60 rounded" />

            <div className="space-y-1.5">
              <Skeleton className="h-4 w-36 rounded" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>

            <div className="space-y-2">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-40 rounded" />
                <Skeleton className="h-11 w-full rounded-lg" />
              </div>
              <div className="space-y-1.5 pt-1">
                <Skeleton className="h-4 w-36 rounded" />
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 rounded-lg" />
                  ))}
                  <Skeleton className="h-10 rounded-lg col-start-2 col-span-1" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Skeleton className="h-4 w-44 rounded" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="rounded-lg border border-slate-200 p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-28 rounded" />
                    <Skeleton className="h-4 w-4 rounded-full" />
                  </div>
                  <Skeleton className="h-3.5 w-full rounded" />
                  <Skeleton className="h-3.5 w-3/4 rounded" />
                </div>
                <div className="rounded-lg border border-slate-200 p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-28 rounded" />
                    <Skeleton className="h-4 w-4 rounded-full" />
                  </div>
                  <Skeleton className="h-3.5 w-full rounded" />
                  <Skeleton className="h-3.5 w-3/4 rounded" />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between py-1">
                <Skeleton className="h-4 w-44 rounded" />
                <Skeleton className="h-4 w-4 rounded" />
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <Skeleton className="h-4 w-36 rounded" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-11 w-16 rounded-lg" />
                <Skeleton className="h-5 w-3 rounded" />
                <Skeleton className="h-11 w-16 rounded-lg" />
                <Skeleton className="h-11 w-16 rounded-lg" />
              </div>
              <Skeleton className="h-3.5 w-80 rounded" />
            </div>

            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 rounded" />
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 rounded-lg" />
                  ))}
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <Skeleton className="h-4 w-40 rounded" />
                <Skeleton className="h-14 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 lg:sticky lg:top-20">
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 space-y-5 shadow-xs">
            <div className="space-y-0.5">
              <Skeleton className="h-6 w-48 rounded" />
              <Skeleton className="h-4 w-28 rounded" />
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-36 rounded" />
                <Skeleton className="h-5 w-20 rounded" />
              </div>
              <Skeleton className="h-3.5 w-44 rounded" />
              <Skeleton className="h-3.5 w-32 rounded" />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Skeleton className="h-12 flex-1 rounded-lg" />
              <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

